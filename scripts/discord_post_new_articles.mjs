// scripts/discord_post_new_articles.mjs
// まだ Discord にポストしていない ai-news/articles/*.md を探して
// 最大 MAX_POSTS_PER_RUN 件を Discord チャンネルにポストする。
// ポスト済みのファイル名は NEWS_ROOT/state/discord_posted.txt で管理。
// 429 レートリミットを避けるため、各投稿の間に POST_INTERVAL_MS ミリ秒のウェイトを入れる。

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====== 環境変数 ======
const NEWS_ROOT =
  process.env.NEWS_ROOT || path.resolve(__dirname, "..", "ai-news");
const DISCORD_TOKEN = process.env.DISCORD_TOKEN || "";
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || "";

// 1回の実行でポストする最大件数（デフォルト 30）
const MAX_POSTS_PER_RUN = Number(
  process.env.DISCORD_MAX_POSTS_PER_RUN || "30"
);

// 各メッセージの間に入れるウェイト（ミリ秒）
// 1.2 秒なら 30件送っても 36秒くらい → Discord のレートリミットをかなり踏みにくい
const POST_INTERVAL_MS = Number(
  process.env.DISCORD_POST_INTERVAL_MS || "1200"
);

// ====== パス周り ======
const ARTICLES_DIR = path.join(NEWS_ROOT, "articles");
const STATE_DIR = path.join(NEWS_ROOT, "state");
const STATE_FILE = path.join(STATE_DIR, "discord_posted.txt");

// ====== ユーティリティ ======
function log(...args) {
  console.log("[discord_post]", ...args);
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureStateFile() {
  try {
    await fs.mkdir(STATE_DIR, { recursive: true });
    await fs.access(STATE_FILE);
  } catch {
    // なければ空ファイルを作る
    await fs.writeFile(STATE_FILE, "", "utf8");
  }
}

async function loadPostedSet() {
  await ensureStateFile();
  const text = await fs.readFile(STATE_FILE, "utf8");
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const set = new Set();
  for (const line of lines) {
    // 旧バージョンとの互換のため、そのままの行と basename の両方を登録する
    set.add(line);
    set.add(path.basename(line));
  }
  return set;
}

async function loadArticleFiles() {
  const files = await fs.readdir(ARTICLES_DIR);
  return files
    .filter((f) => f.endsWith(".md"))
    .sort()   // ファイル名でソート → 日付入りなので古い順
    .reverse(); // 新しい順にしたいので reverse
}

// ---- frontmatter / TL;DR 抜き出し ----
function parseFrontmatterAndBody(mdText) {
  if (!mdText.startsWith("---")) return { frontmatter: {}, body: mdText };
  const end = mdText.indexOf("\n---", 3);
  if (end === -1) return { frontmatter: {}, body: mdText };

  const fmBlock = mdText.slice(3, end).trim();
  const body = mdText.slice(end + 4); // "---\n" のぶんを飛ばす

  const fmLines = fmBlock.split(/\r?\n/);
  const frontmatter = {};
  for (const line of fmLines) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    let value = m[2].trim();
    // 先頭と末尾のクォートを外す
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    frontmatter[key] = value;
  }
  return { frontmatter, body };
}

function extractTldr(frontmatter, body) {
  if (frontmatter.tldr) return frontmatter.tldr;

  const lines = body.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#")) continue; // 見出しはスキップ
    if (trimmed.startsWith(">")) continue; // コールアウト引用はスキップ
    return trimmed;
  }
  return "";
}

function buildDiscordContent(fileName, frontmatter, tldr) {
  const url = frontmatter.url || frontmatter.source_url || "";
  const title = frontmatter.title || fileName.replace(/\.md$/, "");
  const host = frontmatter.host || "";

  let line1 = `📰 **${title}**`;
  if (host) line1 += `  \n🌐 ${host}`;
  if (url) line1 += `  \n🔗 ${url}`;

  let body = line1;
  if (tldr) {
    body += `\n\n**TL;DR**\n${tldr}`;
  }

  return body;
}

// ---- Discord 送信本体 ----
async function postToDiscord(fileName) {
  const fullPath = path.join(ARTICLES_DIR, fileName);
  const md = await fs.readFile(fullPath, "utf8");
  const { frontmatter, body } = parseFrontmatterAndBody(md);
  const tldr = extractTldr(frontmatter, body);
  const content = buildDiscordContent(fileName, frontmatter, tldr);

  const res = await fetch(
    `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${DISCORD_TOKEN}`,
      },
      body: JSON.stringify({ content }),
    }
  );

  if (res.status === 429) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`Discord API error 429: ${JSON.stringify(data)}`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Discord API error ${res.status}: ${text.slice(0, 200)}`
    );
  }
}

// ---- メイン処理 ----
async function main() {
  if (!DISCORD_TOKEN || !DISCORD_CHANNEL_ID) {
    console.error(
      "[discord_post] ❌ DISCORD_TOKEN または DISCORD_CHANNEL_ID が設定されていません (.env を確認してください)"
    );
    process.exit(1);
  }

  log("NEWS_ROOT =", NEWS_ROOT);

  const postedSet = await loadPostedSet();
  const articleFiles = await loadArticleFiles();

  const pending = articleFiles.filter((f) => !postedSet.has(f));
  if (pending.length === 0) {
    log("未ポスト記事: 0 件 (今回はポストなし)");
    return;
  }

  const toPost = pending.slice(0, MAX_POSTS_PER_RUN);
  log(`未ポスト記事: ${pending.length} 件 / 今回ポスト: ${toPost.length} 件`);

  const newlyPosted = [];

  for (const file of toPost) {
    try {
      await postToDiscord(file);
      log(`✅ posted: ${file}`);
      newlyPosted.push(file);
    } catch (err) {
      log(`❌ Discord 送信失敗 (${file}): ${err.message}`);
    }

    // 各メッセージの間にウェイトを入れてレートリミットを避ける
    await sleep(POST_INTERVAL_MS);
  }

  if (newlyPosted.length > 0) {
    const textToAppend = newlyPosted.join("\n") + "\n";
    await fs.appendFile(STATE_FILE, textToAppend, "utf8");
    const relPath = path.relative(process.cwd(), STATE_FILE);
    log(`state 更新: ${newlyPosted.length} 件を ${relPath} に追記しました。`);
  } else {
    log("state 更新なし（新規ポスト 0 件）");
  }
}

main().catch((err) => {
  console.error("[discord_post] ❌ unexpected error:", err);
  process.exit(1);
});
