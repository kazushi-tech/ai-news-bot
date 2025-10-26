// bot/index.mjs
// Discord → repository_dispatch (GitHub) トリガーBot
// 環境変数: DISCORD_TOKEN, DISCORD_CHANNEL_ID, GITHUB_TOKEN, REPO (owner/repo), EVENT_TYPE (default: ai-news-url)

import 'dotenv/config';
import fetch from 'node-fetch';
import { Client, GatewayIntentBits, Partials } from 'discord.js';

const token = process.env.DISCORD_TOKEN;
const channelId = process.env.DISCORD_CHANNEL_ID;
const githubToken = process.env.GITHUB_TOKEN;
const repo = process.env.REPO;
const eventType = process.env.EVENT_TYPE || 'ai-news-url';

if (!token || !channelId || !githubToken || !repo) {
  console.error('Missing env. Please set DISCORD_TOKEN, DISCORD_CHANNEL_ID, GITHUB_TOKEN, REPO');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

function extractUrls(text) {
  const re = /(https?:\/\/[^\s>]+)\b/g;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) out.push(m[1]);
  return out;
}

async function fireDispatch(url) {
  const api = `https://api.github.com/repos/${repo}/dispatches`;
  const body = { event_type: eventType, client_payload: { url } };
  const res = await fetch(api, {
    method: 'POST',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'ai-news-bot/0.1'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub dispatch failed: ${res.status} ${text}`);
  }
}

client.on('ready', () => {
  console.log(`Discord bot online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;
    if (message.channelId !== channelId) return;
    const urls = extractUrls(message.content);
    if (!urls.length) return;

    for (const url of urls) {
      await fireDispatch(url);
    }
    await message.react('✅');
  } catch (e) {
    console.error(e);
    try { await message.react('⚠️'); } catch {}
  }
});

client.login(token);