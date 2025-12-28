// scripts/discord_queue_bot.mjs
// Discord の指定チャンネルから URL を拾って ai-news/queue/urls.txt に追記し、自動で記事生成まで実行する。

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client, GatewayIntentBits } from "discord.js";
import { spawn } from "node:child_process";
import { normalizeUrl, hashUrl } from "./lib/url_normalizer.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
// パス解決：__dirname は scripts フォルダ
// scripts/.. => ai-news-bot
// scripts/../.. => myapp (Obsidian Root)
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

// .env の NEWS_ROOT は無視して、強制的に親の親（myapp）を使う
// これにより ai-news-bot フォルダ内に誤ってファイルが生成されるのを防ぐ
const NEWS_ROOT = PROJECT_ROOT;

if (!TOKEN) {
  console.error("ERROR: DISCORD_BOT_TOKEN が .env に設定されていません。");
  process.exit(1);
}
if (!CHANNEL_ID) {
  console.error("ERROR: DISCORD_CHANNEL_ID が .env に設定されていません。");
  process.exit(1);
}

const newsRoot = NEWS_ROOT;
const queueDir = path.join(newsRoot, "queue");
const queueFile = path.join(queueDir, "urls.txt");
const metadataFile = path.join(queueDir, "metadata.json");
const dedupeFile = path.join(newsRoot, ".data", "news_dedupe.json");

// メタデータ読み込み
async function loadMetadata() {
  try {
    const data = await fs.readFile(metadataFile, "utf8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// メタデータ保存
async function saveMetadata(metadata) {
  await fs.mkdir(queueDir, { recursive: true });
  await fs.writeFile(metadataFile, JSON.stringify(metadata, null, 2), "utf8");
}

// Dedupe読み込み
async function loadDedupe() {
  try {
    const data = await fs.readFile(dedupeFile, "utf8");
    return JSON.parse(data);
  } catch {
    return { hashes: {} };
  }
}

// Dedupe保存
async function saveDedupe(dedupe) {
  await fs.mkdir(path.dirname(dedupeFile), { recursive: true });
  await fs.writeFile(dedupeFile, JSON.stringify(dedupe, null, 2), "utf8");
}

// URL重複チェック
async function isUrlDuplicate(url) {
  const hash = hashUrl(url);
  if (!hash) return false;
  
  const dedupe = await loadDedupe();
  if (dedupe.hashes[hash]) {
    console.log(`[discord_queue_bot] duplicate URL detected: ${url} (hash: ${hash})`);
    return true;
  }
  return false;
}

// URL登録
async function registerUrl(url) {
  const hash = hashUrl(url);
  if (!hash) return;
  
  const normalized = normalizeUrl(url);
  const dedupe = await loadDedupe();
  dedupe.hashes[hash] = {
    original: url,
    normalized,
    timestamp: new Date().toISOString()
  };
  await saveDedupe(dedupe);
}

async function appendToQueue(url, metadata = {}) {
  // 重複チェック
  if (await isUrlDuplicate(url)) {
    return false;  // 追加しなかった
  }
  
  await fs.mkdir(queueDir, { recursive: true });
  await fs.appendFile(queueFile, url + "\n", "utf8");
  
  // メタデータも保存
  const allMetadata = await loadMetadata();
  allMetadata[url] = {
    title: metadata.title || null,
    description: metadata.description || null,
    isX: metadata.isX || false,
    timestamp: new Date().toISOString()
  };
  await saveMetadata(allMetadata);
  
  // Dedupeに登録
  await registerUrl(url);
  
  console.log(`[discord_queue_bot] queued: ${url}`, metadata.title ? `(title: "${metadata.title}")` : "");
  return true;  // 追加した
}

// Worker実行状態管理
let workerRunning = false;
let pendingWorkerRun = false;

async function runWorker() {
  if (workerRunning) {
    pendingWorkerRun = true;
    console.log("[discord_queue_bot] Worker already running, will run again after completion");
    return;
  }
  
  workerRunning = true;
  console.log("[discord_queue_bot] Starting queue_worker...");
  
  return new Promise((resolve) => {
    const child = spawn("node", ["--env-file=.env", "scripts/queue_worker.mjs"], {
      cwd: path.resolve(__dirname, ".."),
      env: { ...process.env, NEWS_ROOT },
      stdio: "inherit"
    });
    
    child.on("close", async (code) => {
      console.log(`[discord_queue_bot] queue_worker exited with code ${code}`);
      workerRunning = false;
      
      // ペンディング中の実行があれば再実行
      if (pendingWorkerRun) {
        pendingWorkerRun = false;
        setTimeout(() => runWorker(), 1000);
      }
      resolve();
    });
    
    child.on("error", (err) => {
      console.error("[discord_queue_bot] queue_worker error:", err);
      workerRunning = false;
      resolve();
    });
  });
}

// デバウンス処理：連続投稿時に5秒待ってからworkerを実行
let workerDebounceTimer = null;

function scheduleWorker() {
  if (workerDebounceTimer) {
    clearTimeout(workerDebounceTimer);
  }
  workerDebounceTimer = setTimeout(() => {
    workerDebounceTimer = null;
    runWorker();
  }, 5000); // 5秒待ってから実行
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`[discord_queue_bot] Logged in as ${client.user.tag}`);
  console.log(`[discord_queue_bot] NEWS_ROOT = ${newsRoot}`);
  console.log(`[discord_queue_bot] Watching channel: ${CHANNEL_ID}`);
  console.log(`[discord_queue_bot] Auto-worker: ENABLED (5s debounce)`);
});

// URL から embed を探す補助関数
function findEmbedForUrl(embeds, url) {
  // URL が embed の url フィールドに含まれているか確認
  return embeds.find(e => e.url && e.url.includes(url)) || 
         embeds.find(e => e.data?.url && e.data.url.includes(url));
}

// X/Twitter URLの判定
function isTwitterUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname === 'x.com' || u.hostname === 'twitter.com' || 
           u.hostname === 'www.x.com' || u.hostname === 'www.twitter.com';
  } catch {
    return false;
  }
}

// タイトルFallback生成（X用）
function generateXFallbackTitle(url) {
  try {
    const u = new URL(url);
    const pathParts = u.pathname.split('/').filter(Boolean);
    
    // パターン1: /user/status/123... の場合
    if (pathParts.length >= 3 && pathParts[1] === 'status') {
      const username = pathParts[0];
      // ユーザー名が取れたらそれを使う
      if (username && username !== 'status' && username !== 'i') {
        return `Xポスト（@${username}）`;
      }
      // ユーザー名が取れなければID末尾8文字
      const statusId = pathParts[2].slice(-8);
      return `X Post #${statusId}`;
    }
    
    // パターン2: /user のみの場合やその他
    if (pathParts.length >= 1) {
      const username = pathParts[0];
      if (username && username !== 'home' && username !== 'i') {
        return `Xポスト（@${username}）`;
      }
    }
    
    return `X Post (${u.hostname})`;
  } catch {
    return 'X Post';
  }
}

// メッセージからembedを取得し、URLに対応するメタデータを返す
async function extractMetadataFromMessage(message, url, retryDelayMs = 5000) {
  const isX = isTwitterUrl(url);
  
  // 初回embed確認
  let embed = findEmbedForUrl(message.embeds, url);
  
  // embedが見つからない場合、遅延再取得
  if (!embed && retryDelayMs > 0) {
    console.log(`[discord_queue_bot] embed not found for ${url}, retrying in ${retryDelayMs}ms...`);
    await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    
    try {
      const refreshedMessage = await message.fetch();
      embed = findEmbedForUrl(refreshedMessage.embeds, url);
    } catch (err) {
      console.warn(`[discord_queue_bot] failed to refresh message: ${err.message}`);
    }
  }
  
  let title = null;
  let description = null;
  
  if (embed) {
    title = embed.title || embed.data?.title || null;
    description = embed.description || embed.data?.description || null;
    console.log(`[discord_queue_bot] embed found for ${url}: title="${title}", desc="${description?.slice(0, 50)}..."`);
  } else {
    console.log(`[discord_queue_bot] no embed found for ${url}`);
  }
  
  // X URL用fallback（優先順位: embed.title > embed.description先頭60字 > ユーザー名 > ID）
  if (isX && !title) {
    // embed.descriptionがあれば先頭60文字を使う
    if (description && description.trim()) {
      const cleaned = description.trim().replace(/\n/g, ' ');
      title = cleaned.length > 60 ? cleaned.slice(0, 60) + '...' : cleaned;
      console.log(`[discord_queue_bot] using description as title for X: "${title}"`);
    } else {
      // descriptionもなければURLからfallback生成
      title = generateXFallbackTitle(url);
      console.log(`[discord_queue_bot] using fallback title for X: "${title}"`);
    }
  }
  
  return { title, description, isX };
}

client.on("messageCreate", async (message) => {
  try {
    // Bot自身や他のBotは無視
    if (message.author.bot) return;

    // 特定チャンネル以外は無視
    if (message.channelId !== CHANNEL_ID) return;

    const content = message.content || "";
    const urlRegex = /(https?:\/\/[^\s<>()]+)/g;
    const urls = [...content.matchAll(urlRegex)].map((m) => m[1]);

    if (!urls.length) return;

    let addedCount = 0;
    for (const url of urls) {
      // embedからメタデータを取得（5秒遅延再取得付き）
      const metadata = await extractMetadataFromMessage(message, url, 5000);
      
      // URLとメタデータをキューに追加（重複チェック付き）
      const added = await appendToQueue(url, metadata);
      if (added) addedCount++;
    }

    // 成功したら軽くリアクション
    if (addedCount > 0) {
      await message.react("✅").catch(() => {});
      // 自動でworkerを実行（デバウンス付き）
      scheduleWorker();
    }
  } catch (err) {
    console.error("[discord_queue_bot] ERROR:", err);
  }
});

client
  .login(TOKEN)
  .catch((err) => {
    console.error("[discord_queue_bot] login error:", err);
    process.exit(1);
  });
