import React from 'react';

export default function ArticleCard({ article, onClick }) {
    return (
        <div className="article-card" onClick={() => onClick(article)}>
            <div className="card-content">
                <span className={`badge ${article.source}`}>{article.source === 'original' ? 'Original' : 'Enhanced'}</span>
                <h3>{article.title}</h3>
                <p className="excerpt">
                    {article.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                </p>
                <div className="card-footer">
                    <span>Read More &rarr;</span>
                </div>
            </div>
        </div>
    );
}
