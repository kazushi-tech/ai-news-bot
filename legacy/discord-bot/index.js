// index.js
import 'dotenv/config';
import { Client, GatewayIntentBits, Partials } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

const urlRe = /https?:\/\/[^\s,")]+/gi;

async function dispatch(url) {
  const endpoint = `https://api.github.com/repos/${process.env.GH_OWNER}/${process.env.GH_REPO}/dispatches`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event_type: 'summarize_url',
      client_payload: { url },
    }),
  });
  if (!res.ok) throw new Error(`dispatch failed: ${res.status} ${await res.text()}`);
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (msg) => {
  const urls = msg.content.match(urlRe) ?? [];
  for (const url of urls) {
    try { await dispatch(url); } catch (e) { console.error(e); }
  }
});

client.login(process.env.DISCORD_TOKEN);
