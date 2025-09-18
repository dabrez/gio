# OpenAI News Discord Bot

A Discord bot that automatically monitors OpenAI's blog and research pages for new announcements about features, models, and updates, then reposts them to your Discord channel.

## Features

- 🔍 Monitors OpenAI blog and research pages
- 🎯 Filters for relevant content (new models, features, updates)
- 🚫 Prevents duplicate posts
- ⏰ Configurable check intervals
- 📱 Rich embed messages with links and descriptions

## Setup

### 1. Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section
4. Click "Add Bot"
5. Copy the bot token (you'll need this later)
6. Under "Privileged Gateway Intents", enable "Message Content Intent"

### 2. Invite Bot to Your Server

1. In the Discord Developer Portal, go to "OAuth2" > "URL Generator"
2. Select scopes: `bot`
3. Select bot permissions: `Send Messages`, `Embed Links`
4. Copy the generated URL and visit it to invite the bot to your server

### 3. Get Channel ID

1. Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
2. Right-click on the channel where you want news posted
3. Click "Copy ID"

### 4. Install and Configure

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your values
DISCORD_TOKEN=your_discord_bot_token_here
CHANNEL_ID=your_channel_id_here
CHECK_INTERVAL_MINUTES=30
```

### 5. Run the Bot

```bash
# Production
npm start

# Development (with auto-restart)
npm run dev
```

## Configuration

- `DISCORD_TOKEN`: Your Discord bot token
- `CHANNEL_ID`: The Discord channel ID where news will be posted
- `CHECK_INTERVAL_MINUTES`: How often to check for news (default: 30 minutes)

## How It Works

The bot:
1. Scrapes OpenAI's blog and research pages every 30 minutes (configurable)
2. Filters content for keywords related to new features, models, and updates
3. Checks against previously posted items to avoid duplicates
4. Posts new items as rich embeds with titles, descriptions, and links
5. Stores posted items in `posted_news.json` to prevent duplicates

## Monitored Sources

- OpenAI Blog (https://openai.com/blog)
- OpenAI Research (https://openai.com/research)

## File Structure

```
├── src/
│   ├── bot.js          # Main bot logic
│   ├── newsMonitor.js  # Web scraping and filtering
│   └── storage.js      # Duplicate prevention
├── package.json
├── .env.example
└── README.md
```