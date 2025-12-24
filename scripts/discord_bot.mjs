// ai-news-bot/scripts/discord_bot.mjs
//
// 役割：Discord の特定チャンネルに流れてきた URL を検知し、
//       ai-news/queue/urls.txt にキューする。
//       AUTO_INGEST=1 のときは、キュー後に queue_worker.mjs を実行して
//       要約〜Daily/Index 生成まで一気に回す。
// すべての要約ロジックは queue_worker.mjs / summarize_article.mjs / finish_up.mjs 側で統一する。

import "dotenv/config"; // .env を読み込む
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { spawn } from "node:child_process";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd(); // ai-news-bot のルート想定

// ====== AI News / queue 用のパス設定 ======

const NEWS_ROOT =
  process.env.NEWS_ROOT ||
  // env が無いときは ai-news-bot/ai-news を見る（開発用フォールバック）
  path.resolve(ROOT, "ai-news");

const QUEUE_DIR = path.join(NEWS_ROOT, "queue");
const URLS_FILE = path.join(QUEUE_DIR, "urls.txt");

// Discord からの URL 投下後に、自動で queue_worker を回すかどうか
// 1: 自動 ingest、有効
// それ以外: キューだけしておいて queue_worker は手動 or PM2 などで回す
const AUTO_INGEST = process.env.AUTO_INGEST || "1";

// 旧仕様から流用する状態ファイル（「この URL は一度は見た」程度のメモ用）
const STATE_DIR = path.join(ROOT, "state");
const INGESTED_FILE = path.join(STATE_DIR, "ingested-urls.json");

// ============================================================================
// ユーティリティ
// ============================================================================

function log(...args) {
  console.log("[discord-bot]", ...args);
}

function errorLog(...args) {
  console.error("[discord-bot]", ...args);
}

async function ensureDir(dirPath) {
  await fsp.mkdir(dirPath, { recursive: true });
}

async function loadState() {
  try {
    await ensureDir(STATE_DIR);
    await fsp.access(INGESTED_FILE, fs.constants.F_OK);
    const raw = await fsp.readFile(INGESTED_FILE, "utf8");
    const json = JSON.parse(raw);
    if (json && typeof json === "object") {
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
  await fsp.writeFile(INGESTED_FILE, raw, "utf8");
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
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid",
    "fbclid",
    "mc_cid",
    "mc_eid",
  ];
  dropKeys.forEach((k) => params.delete(k));
  u.search = params.toString();

  // 末尾スラッシュの整理（クエリやハッシュがない場合）
  if (!u.search && !u.hash && u.pathname.endsWith("/")) {
    u.pathname = u.pathname.replace(/\/+$/, "");
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
    log("runCommand:", cmd, args.join(" "));
    const child = spawn(cmd, args, {
      cwd: ROOT,
      stdio: "inherit",
      ...options,
    });

    child.on("error", (err) => {
      errorLog("spawn error:", err);
      reject(err);
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        const err = new Error(
          `${cmd} ${args.join(" ")} exited with code ${code}`
        );
        errorLog(err.message);
        reject(err);
      }
    });
  });
}

// queue/urls.txt に URL を追加（重複は気にせず append。処理側で dedupe）
async function appendUrlToQueue(url) {
  await ensureDir(QUEUE_DIR);
  await fsp.appendFile(URLS_FILE, url + "\n", "utf8");
  log("queued URL:", url);
}

// AUTO_INGEST=1 のときに queue_worker.mjs を 1 回まわす
async function runQueueWorkerOnce() {
  if (AUTO_INGEST !== "1") {
    log("AUTO_INGEST != 1 のため queue_worker.mjs は起動しません。");
    return;
  }

  const env = {
    ...process.env,
    NEWS_ROOT, // 念のため明示
  };

  await runCommand("node", ["scripts/queue_worker.mjs"], { env });
}

// ============================================================================
// Discord クライアント設定
// ============================================================================

const token = process.env.DISCORD_TOKEN;
const targetChannelId = process.env.DISCORD_CHANNEL_ID;

if (!token) {
  errorLog("ERROR: DISCORD_TOKEN が .env に設定されていません。");
  process.exit(1);
}

if (!targetChannelId) {
  log("WARN: DISCORD_CHANNEL_ID が設定されていません。全チャンネルを対象にします。");
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // ※ Discord Developer Portal で有効化必須
  ],
  partials: [Partials.Channel],
});

// ============================================================================
// メインロジック
// ============================================================================

client.once("ready", () => {
  log(`Logged in as ${client.user.tag}`);
  log(`NEWS_ROOT = ${NEWS_ROOT}`);
  log(`QUEUE_DIR = ${QUEUE_DIR}`);
  if (targetChannelId) {
    log(`Watching channel: ${targetChannelId}`);
  } else {
    log("Watching ALL text channels (DISCORD_CHANNEL_ID not set)");
  }
  log(`AUTO_INGEST = ${AUTO_INGEST}`);
});

client.on("messageCreate", async (message) => {
  try {
    // Bot のメッセージは無視
    if (message.author.bot) return;

    // チャンネル制限
    if (targetChannelId && message.channelId !== targetChannelId) return;

    const rawUrls = extractUrls(message.content);
    if (rawUrls.length === 0) return;

    log(
      `message from ${message.author.tag} in #${message.channelId}: found URLs`,
      rawUrls
    );

    // 「キューに入れたよ」リアクション（事前通知）
    try {
      await message.react("📰");
    } catch (err) {
      errorLog("failed to react 📰:", err.message || err);
    }

    // URL 正規化 + 重複排除
    const normalizedSet = new Set();
    for (const u of rawUrls) {
      const n = normalizeUrl(u);
      if (n) normalizedSet.add(n);
    }
    const normalizedUrls = Array.from(normalizedSet);
    if (normalizedUrls.length === 0) {
      log("no valid URLs after normalization");
      return;
    }

    const state = await loadState();
    const newUrls = normalizedUrls.filter((u) => !state[u]);

    if (newUrls.length === 0) {
      log("all URLs already seen in state, nothing new to queue");
      try {
        await message.react("✅");
      } catch {}
      return;
    }

    // queue/urls.txt に追加
    for (const url of newUrls) {
      await appendUrlToQueue(url);
      state[url] = { lastQueuedAt: new Date().toISOString() };
    }
    await saveState(state);

    // queue_worker を 1 回まわす（AUTO_INGEST=1 の場合のみ）
    let workerError = null;
    if (AUTO_INGEST === "1") {
      try {
        await runQueueWorkerOnce();
      } catch (err) {
        workerError = err;
        errorLog("queue_worker.mjs failed:", err);
      }
    }

    // Discord へのフィードバック
    let content = "";

    if (newUrls.length > 0) {
      content += `📰 キュー追加: ${newUrls.length}件\n`;
      content += newUrls.map((u) => `- ${u}`).join("\n");
    }

    if (AUTO_INGEST === "1") {
      if (workerError) {
        content +=
          "\n\n⚠️ queue_worker.mjs の実行でエラーが発生しました。ログを確認してください。";
      } else {
        content += "\n\n✅ キューの処理まで実行しました。";
      }
    } else {
      content += "\n\n⏱ AUTO_INGEST=0 のため、キューのみ追加しました。";
    }

    try {
      await message.reply({ content });
    } catch (err) {
      errorLog("failed to reply:", err.message || err);
    }
  } catch (err) {
    errorLog("unhandled error in messageCreate handler:", err);
  }
});

client.login(token).catch((err) => {
  errorLog("failed to login to Discord:", err);
  process.exit(1);
});
