import React, { useState, useEffect } from 'react';
import { fetchArticles } from './api';
import ArticleCard from './components/ArticleCard';
import ArticleDetail from './components/ArticleDetail';
import './App.css';

function App() {
    const [activeTab, setActiveTab] = useState('original');
    const [articles, setArticles] = useState([]);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadArticles();
    }, [activeTab]);

    const loadArticles = async () => {
        setLoading(true);
        const data = await fetchArticles(activeTab);
        setArticles(data);
        setLoading(false);
    };

    return (
        <div className="app-container">
            <nav className="navbar">
                <div className="logo">BeyondChats Assignment</div>
                <div className="tabs">
                    <button
                        className={activeTab === 'original' ? 'active' : ''}
                        onClick={() => setActiveTab('original')}>
                        Original Articles
                    </button>
                    <button
                        className={activeTab === 'updated' ? 'active' : ''}
                        onClick={() => setActiveTab('updated')}>
                        AI Enhanced
                    </button>
                </div>
            </nav>

            <main className="main-content">
                <header className="page-header">
                    .
                    <h2>{activeTab === 'original' ? 'Latest Blog Posts' : 'Curated & Enhanced Content'}</h2>
                    <p>{activeTab === 'original' ? 'Scraped directly from BeyondChats blogs.' : 'Enriched with Google Search insights and LLM processing.'}</p>
                </header>

                {loading ? (
                    <div className="loader">Loading articles...</div>
                ) : (
                    <div className="articles-grid">
                        {articles.map(article => (
                            <ArticleCard
                                key={article.id}
                                article={article}
                                onClick={setSelectedArticle}
                            />
                        ))}
                    </div>
                )}

                {articles.length === 0 && !loading && (
                    <div className="empty-state">
                        <p>No articles found. Run the scraper backend!</p>
                    </div>
                )}
            </main>

            {selectedArticle && (
                <ArticleDetail
                    article={selectedArticle}
                    onClose={() => setSelectedArticle(null)}
                />
            )}
        </div>
    );
}

export default App;
