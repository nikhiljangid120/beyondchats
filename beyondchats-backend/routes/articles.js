const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { Op } = require('sequelize');

// GET /api/articles - List all articles
router.get('/', async (req, res) => {
    try {
        const { source } = req.query;
        const whereClause = source ? { source } : {};
        const articles = await Article.findAll({ where: whereClause, order: [['createdAt', 'DESC']] });
        res.json(articles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/articles/:id - Get specific article
router.get('/:id', async (req, res) => {
    try {
        const article = await Article.findByPk(req.params.id);
        if (!article) return res.status(404).json({ error: 'Article not found' });
        res.json(article);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/articles - Create article
router.post('/', async (req, res) => {
    try {
        const article = await Article.create(req.body);
        res.status(201).json(article);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT /api/articles/:id - Update article
router.put('/:id', async (req, res) => {
    try {
        const article = await Article.findByPk(req.params.id);
        if (!article) return res.status(404).json({ error: 'Article not found' });
        await article.update(req.body);
        res.json(article);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /api/articles/:id - Delete article
router.delete('/:id', async (req, res) => {
    try {
        const article = await Article.findByPk(req.params.id);
        if (!article) return res.status(404).json({ error: 'Article not found' });
        await article.destroy();
        res.json({ message: 'Article deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
