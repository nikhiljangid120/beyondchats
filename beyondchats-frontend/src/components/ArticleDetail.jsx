import React from 'react';

export default function ArticleDetail({ article, onClose }) {
    if (!article) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>&times;</button>

                <header className="article-header">
                    <span className={`badge ${article.source} large`}>{article.source.toUpperCase()}</span>
                    <h1>{article.title}</h1>
                    {article.url && <a href={article.url} target="_blank" rel="noopener noreferrer" className="source-link">Visit Source</a>}
                </header>

                <div className="article-body" dangerouslySetInnerHTML={{ __html: article.content }} />

                {article.citation && (
                    <div className="citations">
                        <h4>References</h4>
                        <p>{article.citation}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
