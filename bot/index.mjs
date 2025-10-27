#!/usr/bin/env node
import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, PermissionFlagsBits, ChannelType } from 'discord.js';

const {
  DISCORD_TOKEN,
  DISCORD_CHANNEL_ID,              // カンマ区切りで複数指定OK
  GITHUB_TOKEN,
  REPO,
  EVENT_TYPE = 'ai-news-url',
} = process.env;

if (!DISCORD_TOKEN || !DISCORD_CHANNEL_ID || !GITHUB_TOKEN || !REPO) {
  console.error('Missing env. Check DISCORD_TOKEN, DISCORD_CHANNEL_ID, GITHUB_TOKEN, REPO.');
  process.exit(1);
}

const CHANNEL_IDS = new Set(
  DISCORD_CHANNEL_ID.split(',').map(s => s.trim()).filter(Boolean)
);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // Developer Portal: Message Content Intent = ON
  ],
  partials: [Partials.Channel, Partials.GuildMember, Partials.Message],
});

client.once('ready', () => console.log(`Discord bot online as ${client.user?.tag}`));
client.once('clientReady', () => console.log(`Discord clientReady as ${client.user?.tag}`));

const urlRe = /https?:\/\/[^\s<>()]+/g; // シンプルで頑強

client.on('messageCreate', async (msg) => {
  try {
    const head = (msg.content || '').slice(0, 80);
    console.log('[recv]', { guild: msg.guildId, channel: msg.channelId, len: head.length, head });

    if (msg.author?.bot) { console.log('[skip:bot]'); return; }
    if (!isMonitoredChannel(msg)) {
      console.log('[skip:channel]', { channel: msg.channelId, parent: msg.channel?.parentId || null });
      return;
    }

    const urls = extractUrls(msg.content).slice(0, 5);
    console.log('[urls]', urls);
    if (urls.length === 0) { console.log('[skip:no-url]'); return; }

    await safeReact(msg, '✅');

    for (const url of urls) {
      const res = await dispatchToGitHub(url);
      console.log('[dispatch]', url, 'status=', res.status);

      const statusLine = `status: \`${res.status}\`${res.ok ? ' ✅' : ' ❌'}`;
      const text = res.ok
        ? `GitHub Actions started 🚀  (${statusLine})\n→ ${url}`
        : `Dispatch failed (${statusLine})\n→ ${url}\n${(res.body || '').slice(0, 200)}`;

      await safeSend(msg.channel, text);
      await wait(300);
    }
  } catch (e) {
    console.error('bot error:', e);
  }
});

function isMonitoredChannel(msg) {
  if (CHANNEL_IDS.has(msg.channelId)) return true;
  const ch = msg.channel;
  if (!ch) return false;
  // スレッド内投稿は親チャンネルIDで判定
  if (
    ch.type === ChannelType.PublicThread ||
    ch.type === ChannelType.PrivateThread ||
    ch.type === ChannelType.AnnouncementThread
  ) {
    return CHANNEL_IDS.has(ch.parentId);
  }
  return false;
}

function extractUrls(text = '') {
  const m = text.match(urlRe);
  return m ? Array.from(new Set(m)) : [];
}

async function dispatchToGitHub(url) {
  const api = `https://api.github.com/repos/${REPO}/dispatches`;
  const res = await fetch(api, {
    method: 'POST',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'ai-news-bot/0.1',
    },
    body: JSON.stringify({ event_type: EVENT_TYPE, client_payload: { url } }),
  });
  const body = res.status === 204 ? '' : await res.text().catch(() => '');
  return { ok: res.status === 204, status: res.status, body };
}

async function safeReact(msg, emoji) {
  try {
    const me = msg.guild?.members?.me;
    if (me) {
      const perms = msg.channel.permissionsFor(me);
      if (perms?.has(PermissionFlagsBits.AddReactions)) await msg.react(emoji);
    } else {
      await msg.react(emoji).catch(() => {});
    }
  } catch {}
}

async function safeSend(channel, text) {
  try {
    const me = channel.guild?.members?.me;
    if (!me) return void channel.send(text).catch(() => {});
    const perms = channel.permissionsFor(me);
    if (perms?.has(PermissionFlagsBits.SendMessages)) await channel.send(text);
  } catch {}
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

process.on('unhandledRejection', (e) => console.error('UNHANDLED', e));
process.on('uncaughtException', (e) => console.error('UNCAUGHT', e));

client.login(DISCORD_TOKEN);
