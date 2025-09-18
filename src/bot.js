require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const cron = require('node-cron');
const NewsMonitor = require('./newsMonitor');
const { loadPostedNews, savePostedNews } = require('./storage');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const newsMonitor = new NewsMonitor();
let postedNews = new Set();

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    postedNews = await loadPostedNews();
    console.log(`Loaded ${postedNews.size} previously posted news items`);

    await checkForNews();

    const intervalMinutes = process.env.CHECK_INTERVAL_MINUTES || 30;
    cron.schedule(`*/${intervalMinutes} * * * *`, async () => {
        console.log('Checking for new OpenAI news...');
        await checkForNews();
    });

    console.log(`Bot started! Checking for news every ${intervalMinutes} minutes.`);
});

async function checkForNews() {
    try {
        const newsItems = await newsMonitor.getLatestNews();
        const channel = await client.channels.fetch(process.env.CHANNEL_ID);

        if (!channel) {
            console.error('Could not find channel with ID:', process.env.CHANNEL_ID);
            return;
        }

        let newItemsCount = 0;

        for (const item of newsItems) {
            if (!postedNews.has(item.url)) {
                await postNewsItem(channel, item);
                postedNews.add(item.url);
                newItemsCount++;

                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        if (newItemsCount > 0) {
            await savePostedNews(postedNews);
            console.log(`Posted ${newItemsCount} new news items`);
        } else {
            console.log('No new news items found');
        }

    } catch (error) {
        console.error('Error checking for news:', error);
    }
}

async function postNewsItem(channel, item) {
    const embed = new EmbedBuilder()
        .setTitle(item.title)
        .setURL(item.url)
        .setDescription(item.description || 'New update from OpenAI')
        .setColor(0x10a37f)
        .setTimestamp(item.date ? new Date(item.date) : new Date())
        .setFooter({ text: 'OpenAI News' });

    if (item.image) {
        embed.setImage(item.image);
    }

    await channel.send({ embeds: [embed] });
}

client.on('error', console.error);

client.login(process.env.DISCORD_TOKEN);