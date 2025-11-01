#!/usr/bin/env node
// bot/discord-bot.mjs
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import process from 'node:process';

// ====== Env ======
const token         = process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_TOKEN;
const ghToken       = process.env.GH_PAT || process.env.GITHUB_TOKEN;     // PAT: repo + workflow スコープ
const owner         = process.env.GH_OWNER;                                // 例: "yourname"
const repo          = process.env.GH_REPO;                                 // 例: "ai-news-bot"
const workflowFile  = process.env.GH_WORKFLOW_FILE || 'summarize.yml';     // .github/workflows/ 内のファイル名
const workflowRef   = process.env.GH_WORKFLOW_REF  || 'main';              // ブランチ or SHA
const defaultStyle  = (process.env.DEFAULT_STYLE || 'general').toLowerCase();
const defaultLang   = (process.env.DEFAULT_LANG  || 'ja').toLowerCase();

for (const [k, v] of Object.entries({
  DISCORD_BOT_TOKEN: token, GH_PAT_or_GITHUB_TOKEN: ghToken,
  GH_OWNER: owner, GH_REPO: repo,
})) {
  if (!v) {
    console.error(`Missing ${k} in env`);
    process.exit(1);
  }
}

// ====== Discord Client ======
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // ← Dev Portal で MESSAGE CONTENT INTENT を有効化
  ],
  partials: [Partials.Channel],
});

const urlRe = /(https?:\/\/[^\s>]+[^\s.,)>\]}"'])/gi;

// ====== GitHub Actions dispatch ======
async function dispatch(url, style, lang) {
  const api = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${encodeURIComponent(workflowFile)}/dispatches`;
  const body = { ref: workflowRef, inputs: { url, style, lang } };

  const res = await fetch(api, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${ghToken}`,
      accept: 'application/vnd.github+json',
      'content-type': 'application/json',
      'user-agent': 'ai-news-bot-dispatch/1.0',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`GitHub dispatch failed: ${res.status} ${t}`);
  }
}

// ====== Handlers ======
client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.on('messageCreate', async (msg) => {
  try {
    if (msg.author.bot) return;

    const text = msg.content ?? '';
    const m = text.match(urlRe);
    if (!m || m.length === 0) return;

    // 任意: メッセージ中に "style=xxx lang=ja" があれば上書き
    const style = (text.match(/\bstyle=(\w+)/i)?.[1] || defaultStyle).toLowerCase();
    const lang  = (text.match(/\blang=(\w+)/i)?.[1]  || defaultLang).toLowerCase();

    const url = m[0];

    await dispatch(url, style, lang);
    await msg.react('✅');
    await msg.reply(`GitHub Actionsへ投げました\nstyle=${style}, lang=${lang}\n${url}`);
  } catch (e) {
    await msg.react('❌').catch(() => {});
    await msg.reply(`起動に失敗しました: ${String(e).slice(0, 400)}`).catch(() => {});
  }
});

client.login(token);
