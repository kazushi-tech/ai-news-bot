// tools/discord-bot/index.mjs
import "dotenv/config";
import { Client, GatewayIntentBits, Events } from "discord.js";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT       = path.resolve(__dirname, "..", "..");     // リポジトリのルート
const SCRIPTS    = path.join(ROOT, "scripts");

// ----- 環境変数 -----
const TOKEN   = process.env.DISCORD_BOT_TOKEN;
const ALLOWED = (process.env.DISCORD_ALLOWED_CHANNELS ?? "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// 30分ごと等（分）。0 なら無効
const FEED_MIN  = Number(process.env.FEED_INTERVAL_MIN ?? 0);
// 1ティックで要約する本数（summarize_one を回す回数）
const FEED_LIMIT_PER_TICK = Number(process.env.FEED_LIMIT_PER_TICK ?? 5);

// index.md で Daily/Weekly を隠したい等の環境変数は scripts/* が参照するのでここでは何もしない
// 例: HOME_HIDE_DAILY=1 / HOME_HIDE_WEEKLY=1 / NEWS_ROOT=./ai-news など

// ----- ユーティリティ -----
function log(msg) {
  console.log(`[bot] ${msg}`);
}

function runNode(scriptName, args = []) {
  // scripts/*.mjs を node で実行
  const cmd = process.execPath; // 現在の node 実行ファイル
  const scriptPath = path.join(SCRIPTS, scriptName);
  return new Promise((resolve, reject) => {
    const ps = spawn(cmd, [scriptPath, ...args], {
      cwd: ROOT,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let out = "";
    ps.stdout.on("data", (d) => (out += d.toString()));
    ps.stderr.on("data", (d) => (out += d.toString()));
    ps.on("close", (code) => {
      if (code === 0) return resolve(out.trim());
      const err = new Error(`script ${scriptName} exited with ${code}`);
      err.out = out;
      reject(err);
    });
  });
}

const urlRe = /(https?:\/\/[^\s<>\]\)"]+)/g;
function pickUrls(s) {
  return (s.match(urlRe) || []).map((u) => u.trim());
}

// ----- Discord クライアント -----
if (!TOKEN) {
  console.error("DISCORD_BOT_TOKEN が未設定です");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// 同時実行ガード
let runningFeed = false;

async function feedTick() {
  if (!FEED_MIN) return; // 無効
  if (runningFeed) return;
  runningFeed = true;
  const t0 = Date.now();
  try {
    log(`feed tick start (limit=${FEED_LIMIT_PER_TICK})`);
    // 1) RSS 取得
    await runNode("ingest_rss.mjs");
    // 2) 要約 N 本
    for (let i = 0; i < FEED_LIMIT_PER_TICK; i++) {
      await runNode("summarize_one.mjs");
    }
    // 3) index 再生成（静的テーブル）
    await runNode("build_home.mjs");
    log(`feed tick done in ${Date.now() - t0}ms`);
  } catch (e) {
    log(`feed tick error: ${e.out || e.message}`);
  } finally {
    runningFeed = false;
  }
}

async function handleUrlsFromMessage(message, urls) {
  // 許可チャンネルのチェック
  if (ALLOWED.length && !ALLOWED.includes(message.channelId)) return;

  try {
    await message.reply("🧾 受領: URL解析を開始します…");
    // bot_ingest_url.mjs に丸投げ（まとめて処理）
    await runNode("bot_ingest_url.mjs", urls);
    // 1本だけ要約してすぐ見える化（残りはフィードで回る）
    await runNode("summarize_one.mjs");
    await runNode("build_home.mjs");
    await message.reply("✅ 要約ノート作成 & index更新が完了しました。");
  } catch (e) {
    await message.reply(`❌ 失敗: ${String(e.out || e.message).slice(0, 400)}`);
  }
}

// ----- 起動・イベント -----
client.once(Events.ClientReady, (c) => {
  log(`Discord bot ready as ${c.user.tag}`);
  if (FEED_MIN > 0) {
    log(`feed scheduler enabled: every ${FEED_MIN} min`);
    // すぐに1回実行して、その後インターバル
    feedTick().catch(() => {});
    setInterval(() => feedTick().catch(() => {}), FEED_MIN * 60 * 1000);
  } else {
    log("feed scheduler disabled (FEED_INTERVAL_MIN=0 or unset)");
  }
});

client.on(Events.MessageCreate, async (message) => {
  try {
    if (message.author.bot) return;
    const urls = pickUrls(message.content || "");
    if (urls.length) await handleUrlsFromMessage(message, urls);
  } catch (e) {
    log(`handler error: ${e.message}`);
  }
});

client.login(TOKEN);
