const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Article = sequelize.define('Article', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    source: {
        type: DataTypes.ENUM('original', 'updated'),
        allowNull: false,
        defaultValue: 'original'
    },
    original_article_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Articles', // key points to insertion table name
            key: 'id'
        }
    },
    citation: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

module.exports = Article;
