import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/articles';

export const fetchArticles = async (source) => {
    try {
        const response = await axios.get(`${API_BASE}?source=${source}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
};

export const fetchArticleById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching article:', error);
        return null;
    }
};
