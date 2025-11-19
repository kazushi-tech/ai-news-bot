// ai-news-bot/scripts/discord_bot.mjs

import 'dotenv/config'; // .env を読み込む
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd(); // ai-news-bot のルート想定
const STATE_DIR = path.join(ROOT, 'state');
const INGESTED_FILE = path.join(STATE_DIR, 'ingested-urls.json');

// ---------- ユーティリティ ----------

function log(...args) {
  console.log('[discord-bot]', ...args);
}

function errorLog(...args) {
  console.error('[discord-bot]', ...args);
}

async function ensureDir(dirPath) {
  await fsp.mkdir(dirPath, { recursive: true });
}

async function loadState() {
  try {
    await ensureDir(STATE_DIR);
    await fsp.access(INGESTED_FILE, fs.constants.F_OK);
    const raw = await fsp.readFile(INGESTED_FILE, 'utf8');
    const json = JSON.parse(raw);
    if (json && typeof json === 'object') {
      return json;
    }
    return {};
  } catch {
    return {};
  }
}

async function saveState(state) {
  await ensureDir(STATE_DIR);
  const raw = JSON.stringify(state, null, 2);
  await fsp.writeFile(INGESTED_FILE, raw, 'utf8');
}

function normalizeUrl(rawUrl) {
  if (!rawUrl) return null;
  let u;
  try {
    u = new URL(rawUrl);
  } catch {
    return null;
  }

  // トラッキング系クエリを削除
  const params = u.searchParams;
  const dropKeys = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'gclid',
    'fbclid',
    'mc_cid',
    'mc_eid',
  ];
  dropKeys.forEach((k) => params.delete(k));
  u.search = params.toString();

  // 末尾スラッシュの整理（クエリやハッシュがない場合）
  if (!u.search && !u.hash && u.pathname.endsWith('/')) {
    u.pathname = u.pathname.replace(/\/+$/, '');
  }

  return u.toString();
}

function extractUrls(text) {
  if (!text) return [];
  const regex = /(https?:\/\/[^\s<]+)/g;
  const urls = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

function runCommand(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    log('runCommand:', cmd, args.join(' '));
    const child = spawn(cmd, args, {
      cwd: ROOT,
      stdio: 'inherit',
      ...options,
    });

    child.on('error', (err) => {
      errorLog('spawn error:', err);
      reject(err);
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        const err = new Error(`${cmd} ${args.join(' ')} exited with code ${code}`);
        errorLog(err.message);
        reject(err);
      }
    });
  });
}

async function ingestOneUrl(url) {
  const env = {
    ...process.env,
    EXTRACTOR: process.env.EXTRACTOR || 'readability',
  };

  // ai-news-bot/scripts/summarize_article.mjs を叩く
  await runCommand('node', ['scripts/summarize_article.mjs', '--url', url, '--lang=ja', '--force'], {
    env,
  });
}

// ---------- Discord クライアント設定 ----------

const token = process.env.DISCORD_TOKEN;
const targetChannelId = process.env.DISCORD_CHANNEL_ID;

if (!token) {
  errorLog('ERROR: DISCORD_TOKEN が .env に設定されていません。');
  process.exit(1);
}

if (!targetChannelId) {
  log('WARN: DISCORD_CHANNEL_ID が設定されていません。全チャンネルを対象にします。');
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // ※ Discord Developer Portal で有効化必須
  ],
  partials: [Partials.Channel],
});

// ---------- メインロジック ----------

client.once('ready', () => {
  log(`Logged in as ${client.user.tag}`);
  if (targetChannelId) {
    log(`Watching channel: ${targetChannelId}`);
  } else {
    log('Watching ALL text channels (DISCORD_CHANNEL_ID not set)');
  }
});

client.on('messageCreate', async (message) => {
  try {
    // Bot のメッセージは無視
    if (message.author.bot) return;

    // チャンネル制限
    if (targetChannelId && message.channelId !== targetChannelId) return;

    const rawUrls = extractUrls(message.content);
    if (rawUrls.length === 0) return;

    log(`message from ${message.author.tag} in #${message.channelId}: found URLs`, rawUrls);

    // 取りあえず「キューに入れたよ」リアクション
    try {
      await message.react('📰');
    } catch (err) {
      errorLog('failed to react 📰:', err.message || err);
    }

    // URL 正規化 + 重複排除
    const normalizedSet = new Set();
    for (const u of rawUrls) {
      const n = normalizeUrl(u);
      if (n) normalizedSet.add(n);
    }
    const normalizedUrls = Array.from(normalizedSet);
    if (normalizedUrls.length === 0) {
      log('no valid URLs after normalization');
      return;
    }

    const state = await loadState();
    const newUrls = normalizedUrls.filter((u) => !state[u]);

    if (newUrls.length === 0) {
      log('all URLs already ingested, nothing to do');
      try {
        await message.react('✅');
      } catch {}
      return;
    }

    log('new URLs to ingest:', newUrls);

    const successes = [];
    const failures = [];

    for (const url of newUrls) {
      try {
        await ingestOneUrl(url);
        state[url] = { lastIngestedAt: new Date().toISOString() };
        successes.push(url);
      } catch (err) {
        errorLog('ingest failed for', url, err);
        failures.push({ url, error: err.message || String(err) });
      }
    }

    await saveState(state);

    // 1件でも成功していれば Daily / Weekly / Home を更新
    if (successes.length > 0) {
      try {
        await runCommand('npm', ['run', 'daily']);
        await runCommand('npm', ['run', 'weekly']);
        await runCommand('npm', ['run', 'home']);
      } catch (err) {
        errorLog('failed to update daily/weekly/home:', err);
      }
    }

    // Discord への簡易フィードバック
    let content = '';

    if (successes.length > 0) {
      content += `📰 要約完了: ${successes.length}件\n`;
      content += successes.map((u) => `- ${u}`).join('\n');
    }

    if (failures.length > 0) {
      if (content) content += '\n\n';
      content += `⚠️ 失敗: ${failures.length}件\n`;
      content += failures.map((f) => `- ${f.url}`).join('\n');
    }

    if (!content) {
      content = '全部すでに要約済みっぽいです。';
    }

    try {
      await message.reply({ content });
    } catch (err) {
      errorLog('failed to reply:', err.message || err);
    }
  } catch (err) {
    errorLog('unhandled error in messageCreate handler:', err);
  }
});

client.login(token).catch((err) => {
  errorLog('failed to login to Discord:', err);
  process.exit(1);
});
