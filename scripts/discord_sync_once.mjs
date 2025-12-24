// scripts/discord_sync_once.mjs
// Discord チャンネルから最新メッセージを取得し、URL をキューに追加して worker を1回実行

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
const FETCH_LIMIT = Number(process.env.DISCORD_FETCH_LIMIT || "10");

if (!TOKEN || !CHANNEL_ID) {
  console.error("ERROR: DISCORD_BOT_TOKEN と DISCORD_CHANNEL_ID を .env に設定してください");
  process.exit(1);
}

const newsRoot = path.resolve(__dirname, "..", NEWS_ROOT);
const queueDir = path.join(newsRoot, "queue");
const queueFile = path.join(queueDir, "urls.txt");

async function appendToQueue(url) {
  await fs.mkdir(queueDir, { recursive: true });
  await fs.appendFile(queueFile, url + "\n", "utf8");
  console.log(`[sync] queued: ${url}`);
}

async function runWorker() {
  return new Promise((resolve, reject) => {
    const child = spawn("node", ["--env-file=.env", "scripts/queue_worker.mjs"], {
      cwd: path.resolve(__dirname, ".."),
      env: { ...process.env, NEWS_ROOT },
      stdio: "inherit"
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`queue_worker exited with code ${code}`));
    });
  });
}

async function main() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  await client.login(TOKEN);
  console.log(`[sync] Logged in as ${client.user.tag}`);

  const channel = await client.channels.fetch(CHANNEL_ID);
  if (!channel?.isTextBased()) {
    throw new Error(`Channel ${CHANNEL_ID} is not a text channel`);
  }

  console.log(`[sync] Fetching latest ${FETCH_LIMIT} messages from channel...`);
  const messages = await channel.messages.fetch({ limit: FETCH_LIMIT });

  const urlRegex = /(https?:\/\/[^\s<>()]+)/g;
  let addedCount = 0;

  for (const msg of messages.values()) {
    if (msg.author.bot) continue;
    const content = msg.content || "";
    const urls = [...content.matchAll(urlRegex)].map((m) => m[1]);

    for (const url of urls) {
      // 全てのURLをキューに追加（X/Twitterもプレースホルダー生成される）
      await appendToQueue(url);
      addedCount++;
    }
  }

  console.log(`[sync] Added ${addedCount} URLs to queue`);
  await client.destroy();

  if (addedCount > 0) {
    console.log(`[sync] Running queue_worker...`);
    await runWorker();
    console.log(`[sync] Done! Check ai-news/news/ for updated Daily notes.`);
  } else {
    console.log(`[sync] No new URLs found.`);
  }
}

main().catch((err) => {
  console.error("[sync] ERROR:", err);
  process.exit(1);
});
