const fs = require('fs').promises;
const path = require('path');

const STORAGE_FILE = path.join(__dirname, '..', 'posted_news.json');

async function loadPostedNews() {
    try {
        const data = await fs.readFile(STORAGE_FILE, 'utf8');
        const newsArray = JSON.parse(data);
        return new Set(newsArray);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return new Set();
        }
        console.error('Error loading posted news:', error);
        return new Set();
    }
}

async function savePostedNews(postedNewsSet) {
    try {
        const newsArray = Array.from(postedNewsSet);

        const recentNews = newsArray.slice(-1000);

        await fs.writeFile(STORAGE_FILE, JSON.stringify(recentNews, null, 2));
    } catch (error) {
        console.error('Error saving posted news:', error);
    }
}

module.exports = {
    loadPostedNews,
    savePostedNews
};