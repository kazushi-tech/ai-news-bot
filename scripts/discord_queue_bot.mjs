// scripts/discord_queue_bot.mjs
// Discord の指定チャンネルから URL を拾って ai-news/queue/urls.txt に追記し、自動で記事生成まで実行する。

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client, GatewayIntentBits } from "discord.js";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const NEWS_ROOT = process.env.NEWS_ROOT || "../ai-news";

if (!TOKEN) {
  console.error("ERROR: DISCORD_BOT_TOKEN が .env に設定されていません。");
  process.exit(1);
}
if (!CHANNEL_ID) {
  console.error("ERROR: DISCORD_CHANNEL_ID が .env に設定されていません。");
  process.exit(1);
}

const newsRoot = path.resolve(__dirname, "..", NEWS_ROOT);
const queueDir = path.join(newsRoot, "queue");
const queueFile = path.join(queueDir, "urls.txt");

async function appendToQueue(url) {
  await fs.mkdir(queueDir, { recursive: true });
  await fs.appendFile(queueFile, url + "\n", "utf8");
  console.log(`[discord_queue_bot] queued: ${url}`);
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
      // 全てのURLをキューに追加（X/Twitterもプレースホルダー生成される）
      await appendToQueue(url);
      addedCount++;
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
