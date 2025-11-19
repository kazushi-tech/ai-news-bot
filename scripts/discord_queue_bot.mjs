// scripts/discord_queue_bot.mjs
// Discord の指定チャンネルから URL を拾って ai-news/queue/urls.txt に追記する。

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client, GatewayIntentBits } from "discord.js";

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

    for (const url of urls) {
      await appendToQueue(url);
    }

    // 成功したら軽くリアクション（邪魔なら消してOK）
    await message.react("✅").catch(() => {});
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
