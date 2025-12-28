const puppeteer = require('puppeteer');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_BASE = 'http://localhost:3000/api/articles';
const GEMINI_API_KEY = 'AIzaSyAumG4JvYJolIEBU4qAJMKXtC9YCmv-Wzg'; // Hardcoded for demo/hackathon context

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function rewriteContent(originalContent, researchContent) {
    console.log('Calling Gemini to rewrite content...');

    const prompt = `
    You are an expert tech editor. I will provide you with an original article content and some research notes from other top-ranking articles.
    
    Your task:
    1. Rewrite the original article to make it more comprehensive, engaging, and "viral-worthy".
    2. Incorporate the key insights from the research notes.
    3. Maintain a professional but accessible tone.
    4. Return the result in clean HTML format (using <h2>, <p>, <ul>, etc.).
    
    Original Article:
    ${originalContent.substring(0, 5000)}
    
    Research Notes:
    ${researchContent.substring(0, 5000)}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        return originalContent + "<br><br><b>(AI Update Failed - Using Original)</b>";
    }
}

async function processArticles() {
    const browser = await puppeteer.launch({ headless: "new" });

    try {
        // 1. Fetch original articles
        const { data: articles } = await axios.get(`${API_BASE}?source=original`);
        console.log(`Found ${articles.length} articles to process.`);

        for (const article of articles) {
            console.log(`-----------------------------------`);
            console.log(`Processing: ${article.title}`);
            const page = await browser.newPage();

            // 2. Search (Using DuckDuckGo HTML for easier scraping)
            const query = encodeURIComponent(article.title);
            console.log(`Searching DuckDuckGo for: ${article.title}`);
            // Use html.duckduckgo.com for non-JS version which is easier to scrape
            await page.goto(`https://html.duckduckgo.com/html/?q=${query}`, { waitUntil: 'domcontentloaded' });

            // 3. Get top 2 links
            const links = await page.evaluate(() => {
                const results = Array.from(document.querySelectorAll('.result__a'));
                return results.map(a => a.href)
                    .filter(href => href && !href.includes('duckduckgo.com') && !href.includes('google.com'))
                    .slice(0, 2);
            });
            console.log(`Found references:`, links);

            let researchData = "";

            // 4. Scrape content from links
            for (const link of links) {
                if (!link) continue;
                try {
                    console.log(`Scraping reference: ${link}`);
                    const researchPage = await browser.newPage();
                    // Set timeout to avoid hanging on slow sites
                    await researchPage.goto(link, { waitUntil: 'domcontentloaded', timeout: 15000 });

                    const text = await researchPage.evaluate(() => {
                        // Try to get main content
                        const main = document.querySelector('article') || document.querySelector('main') || document.body;
                        return main.innerText;
                    });

                    if (text) {
                        researchData += `\n\n--- Source: ${link} ---\n${text.substring(0, 1500)}`;
                    }

                    await researchPage.close();
                } catch (e) {
                    console.error(`Failed to scrape ${link}: ${e.message}`);
                    if (browser.pages().length > 2) (await browser.pages())[2].close(); // Cleanup
                }
            }

            // 5. LLM Rewrite if we have something
            let newContent = article.content;
            if (researchData.length > 0) {
                newContent = await rewriteContent(article.content, researchData);
            } else {
                console.log("No research data found, skipping AI rewrite for this item.");
            }

            const citations = links.join(', ');

            // 6. Publish Updated Article
            // Check if already updated to avoid duplicates (optional, but good)
            await axios.post(API_BASE, {
                title: `${article.title} (AI Updated)`,
                content: newContent,
                url: article.url,
                source: 'updated',
                original_article_id: article.id,
                citation: citations
            });
            console.log(`Published updated version.`);

            await page.close();
        }

    } catch (error) {
        console.error('Error in Phase 2:', error);
    } finally {
        await browser.close();
    }
}

// Delay start slightly to allow server to be ready if invoked concurrently
setTimeout(processArticles, 2000);
