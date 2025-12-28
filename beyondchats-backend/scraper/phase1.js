const puppeteer = require('puppeteer');
const axios = require('axios');

const SCRAPE_URL = 'https://beyondchats.com/blogs/';
const API_URL = 'http://localhost:3000/api/articles';

async function scrape() {
    console.log('Starting Scraper...');
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    try {
        // 1. Navigate to the main blog page
        await page.goto(SCRAPE_URL, { waitUntil: 'networkidle2' });
        console.log(`Navigated to ${SCRAPE_URL}`);

        // 2. Find the last page number
        // This selector is an assumption, we might need to adjust based on the actual site structure.
        // Looking for pagination links.
        // If not found, we just take the first page.
        // Strategy: Scrape all article links on the current page.

        // For simplicity and "moderate difficulty", let's try to assume we are on the first page
        // and just find the oldest articles ON THIS PAGE or try to navigate to the last page if possible.
        // The prompt says "last page", so we will try to find pagination.

        const paginationLinks = await page.$$eval('.page-numbers', links => links.map(link => link.href));
        let lastPageUrl = SCRAPE_URL;
        if (paginationLinks.length > 0) {
            // The last one typically is "Next", so second to last might be the number, or just grab the largest number.
            // Let's assume the standard WP pagination.
            // Or simply visit the last link that is a number.
            // Let's just blindly go to the last numeric one we can find.
            console.log('Found pagination links:', paginationLinks);
            lastPageUrl = paginationLinks[paginationLinks.length - 2] || paginationLinks[0]; // Heuristic
            if (lastPageUrl) {
                console.log(`Navigating to last page potentially: ${lastPageUrl}`);
                await page.goto(lastPageUrl, { waitUntil: 'networkidle2' });
            }
        }

        // 3. Scrape 5 oldest articles on the page.
        // Assuming standard blog layout with <article> tags or class .post or similar.
        // We will extract title, content (summary or full), and link.
        const articles = await page.evaluate(() => {
            const nodes = Array.from(document.querySelectorAll('article, .post, .blog-post'));
            const reversed = nodes.reverse().slice(0, 5);

            return reversed.map(node => {
                const titleEl = node.querySelector('h2, h3, .entry-title');
                const linkEl = node.querySelector('a');
                const contentEl = node.querySelector('.entry-content, .post-content, p') || node;

                return {
                    title: titleEl ? titleEl.innerText.trim() : 'No Title',
                    url: linkEl ? linkEl.href : '',
                    content: contentEl ? contentEl.innerText.trim() : ''
                };
            });
        });

        console.log(`Found ${articles.length} articles.`);

        // Fallback: If we have very few articles (like 1 on the last page), let's try to get more from the previous page
        if (articles.length < 5 && lastPageUrl.includes('/page/')) {
            try {
                const pageNum = parseInt(lastPageUrl.match(/\/page\/(\d+)\//)[1]);
                if (pageNum > 1) {
                    const prevPageUrl = lastPageUrl.replace(`/page/${pageNum}/`, `/page/${pageNum - 1}/`);
                    console.log(`Fetching more from previous page: ${prevPageUrl}`);
                    await page.goto(prevPageUrl, { waitUntil: 'domcontentloaded' });
                    const moreArticles = await page.evaluate(() => {
                        const nodes = Array.from(document.querySelectorAll('article, .post, .blog-post'));
                        const reversed = nodes.reverse();
                        return reversed.map(node => {
                            const titleEl = node.querySelector('h2, h3, .entry-title');
                            const linkEl = node.querySelector('a');
                            const contentEl = node.querySelector('.entry-content, .post-content, p') || node;
                            return { title: titleEl ? titleEl.innerText.trim() : 'No Title', url: linkEl ? linkEl.href : '', content: contentEl ? contentEl.innerText.trim() : '' };
                        });
                    });
                    articles.push(...moreArticles);
                }
            } catch (e) { console.log('Could not fetch previous page extra articles'); }
        }

        // Final selection
        const finalArticles = articles.slice(0, 5);
        console.log(`Found ${finalArticles.length} articles to process.`);

        for (let article of finalArticles) {
            if (!article.url) continue;
            console.log(`Fetching full content for: ${article.title}`);
            try {
                const newPage = await browser.newPage();
                // Using domcontentloaded is faster/safer than networkidle2
                await newPage.goto(article.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
                const content = await newPage.evaluate(() => {
                    const contentBody = document.querySelector('.entry-content, .post-content, article');
                    return contentBody ? contentBody.innerHTML : '';
                });
                article.content = content || article.content; // Use summary if full content fails
                await newPage.close();

                // 5. Store in DB via API
                await axios.post(API_URL, {
                    title: article.title,
                    content: article.content,
                    url: article.url,
                    source: 'original'
                });
                console.log(`Saved: ${article.title}`);

            } catch (err) {
                console.error(`Failed to process ${article.title}:`, err.message);
            }
        }
    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        await browser.close();
    }
}

scrape();
