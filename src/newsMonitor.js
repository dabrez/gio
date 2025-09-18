const fetch = require('node-fetch');
const cheerio = require('cheerio');

class NewsMonitor {
    constructor() {
        this.sources = [
            {
                name: 'OpenAI Blog',
                url: 'https://openai.com/blog',
                type: 'web'
            },
            {
                name: 'OpenAI Research',
                url: 'https://openai.com/research',
                type: 'web'
            }
        ];
    }

    async getLatestNews() {
        const allNews = [];

        for (const source of this.sources) {
            try {
                const news = await this.scrapeSource(source);
                allNews.push(...news);
            } catch (error) {
                console.error(`Error scraping ${source.name}:`, error.message);
            }
        }

        return this.filterRelevantNews(allNews)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);
    }

    async scrapeSource(source) {
        const response = await fetch(source.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        if (source.url.includes('openai.com/blog')) {
            return this.scrapeBlogPage($);
        } else if (source.url.includes('openai.com/research')) {
            return this.scrapeResearchPage($);
        }

        return [];
    }

    scrapeBlogPage($) {
        const articles = [];

        $('article, .post, [data-testid*="post"], .blog-post').each((i, element) => {
            const $el = $(element);

            const titleEl = $el.find('h1, h2, h3, .title, [data-testid*="title"]').first();
            const linkEl = $el.find('a').first();
            const dateEl = $el.find('time, .date, [data-testid*="date"]').first();
            const descEl = $el.find('p, .description, .excerpt').first();

            const title = titleEl.text().trim();
            const relativeUrl = linkEl.attr('href');
            const url = relativeUrl ? (relativeUrl.startsWith('http') ? relativeUrl : `https://openai.com${relativeUrl}`) : null;
            const dateText = dateEl.attr('datetime') || dateEl.text().trim();
            const description = descEl.text().trim().substring(0, 200);

            if (title && url) {
                articles.push({
                    title,
                    url,
                    description,
                    date: this.parseDate(dateText),
                    source: 'OpenAI Blog'
                });
            }
        });

        if (articles.length === 0) {
            $('a').each((i, element) => {
                const $el = $(element);
                const href = $el.attr('href');
                const text = $el.text().trim();

                if (href && text && href.includes('/blog/') && text.length > 10) {
                    const url = href.startsWith('http') ? href : `https://openai.com${href}`;
                    articles.push({
                        title: text,
                        url,
                        description: '',
                        date: new Date(),
                        source: 'OpenAI Blog'
                    });
                }
            });
        }

        return articles;
    }

    scrapeResearchPage($) {
        const articles = [];

        $('article, .research-item, [data-testid*="research"]').each((i, element) => {
            const $el = $(element);

            const titleEl = $el.find('h1, h2, h3, .title').first();
            const linkEl = $el.find('a').first();
            const dateEl = $el.find('time, .date').first();
            const descEl = $el.find('p, .description').first();

            const title = titleEl.text().trim();
            const relativeUrl = linkEl.attr('href');
            const url = relativeUrl ? (relativeUrl.startsWith('http') ? relativeUrl : `https://openai.com${relativeUrl}`) : null;
            const dateText = dateEl.attr('datetime') || dateEl.text().trim();
            const description = descEl.text().trim().substring(0, 200);

            if (title && url) {
                articles.push({
                    title,
                    url,
                    description,
                    date: this.parseDate(dateText),
                    source: 'OpenAI Research'
                });
            }
        });

        return articles;
    }

    filterRelevantNews(newsItems) {
        const relevantKeywords = [
            'gpt', 'model', 'feature', 'update', 'release', 'launch', 'announce',
            'new', 'api', 'tool', 'chatgpt', 'dall-e', 'whisper', 'codex',
            'embedding', 'fine-tuning', 'plugin', 'function', 'capability',
            'o1', 'o3', 'reasoning', 'preview', 'beta'
        ];

        return newsItems.filter(item => {
            const text = (item.title + ' ' + item.description).toLowerCase();
            return relevantKeywords.some(keyword => text.includes(keyword));
        });
    }

    parseDate(dateString) {
        if (!dateString) return new Date();

        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date;
        }

        const patterns = [
            /(\w+)\s+(\d{1,2}),?\s+(\d{4})/,
            /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
            /(\d{4})-(\d{1,2})-(\d{1,2})/
        ];

        for (const pattern of patterns) {
            const match = dateString.match(pattern);
            if (match) {
                return new Date(dateString);
            }
        }

        return new Date();
    }
}

module.exports = NewsMonitor;