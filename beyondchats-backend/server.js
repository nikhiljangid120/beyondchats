const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./database');
const Article = require('./models/Article');
const articleRoutes = require('./routes/articles');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Root Route
app.get('/', (req, res) => {
    res.send('BeyondChats Backend API is Running. Access /api/articles to see data.');
});

// Routes
app.use('/api/articles', articleRoutes);

// Sync Database and Start Server
sequelize.sync().then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to sync database:', err);
});
