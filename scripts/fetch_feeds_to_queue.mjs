// scripts/fetch_feeds_to_queue.mjs
// RSS / Atom フィードから AI ニュースの URL を集めて
// ai-news/queue/urls.txt に追加するだけのスクリプト。
// 実際の要約・Markdown化は queue_worker.mjs が担当する。

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import RSSParser from "rss-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====== パス設定 ======
const NEWS_ROOT =
  process.env.NEWS_ROOT ||
  path.resolve(__dirname, "..", "ai-news"); // ../ai-news をデフォルトに

const QUEUE_DIR = path.join(NEWS_ROOT, "queue");
const URLS_FILE = path.join(QUEUE_DIR, "urls.txt");
const PROCESSED_FILE = path.join(QUEUE_DIR, "processed.txt");
const FEEDS_FILE = path.join(NEWS_ROOT, "sources", "feeds.txt");

// ====== デフォルトのフィード一覧（あとで feeds.txt 側を編集すればOK） ======
const DEFAULT_FEEDS = [
  // 日本語圏 AI / テック（例）
  "https://www.itmedia.co.jp/news/subtop20.rdf",
  "https://japan.zdnet.com/rss/index.rdf",
  // "https://gigazine.net/news/rss_2.0/",  // AI無関係の記事が多いためコメントアウト

  // 海外 AI / テック（例）
  "https://www.theverge.com/rss/index.xml",
  "https://feeds.arstechnica.com/arstechnica/technology-lab",
  "https://www.wired.com/feed/category/business/latest/rss",
];

// ====== ユーティリティ ======
async function ensureDirExists(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function loadFeedUrls() {
  try {
    const raw = await fs.readFile(FEEDS_FILE, "utf8");
    const urls = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));
    if (urls.length > 0) {
      console.log(`[feeds] loaded ${urls.length} feed urls from sources/feeds.txt`);
      return urls;
    }
    // 空ファイルだったらデフォルトで埋める
    throw Object.assign(new Error("empty feeds.txt"), { code: "EMPTY" });
  } catch (err) {
    if (err.code === "ENOENT" || err.code === "EMPTY") {
      await ensureDirExists(path.dirname(FEEDS_FILE));
      const text = DEFAULT_FEEDS.join("\n") + "\n";
      await fs.writeFile(FEEDS_FILE, text, "utf8");
      console.log(
        `[feeds] created ${FEEDS_FILE} with ${DEFAULT_FEEDS.length} default feeds`
      );
      return DEFAULT_FEEDS;
    }
    throw err;
  }
}

async function loadKnownUrls() {
  const known = new Set();

  for (const file of [URLS_FILE, PROCESSED_FILE]) {
    try {
      const raw = await fs.readFile(file, "utf8");
      raw.split(/\r?\n/).forEach((line) => {
        const m = line.match(/https?:\/\/\S+/);
        if (m) known.add(m[0]);
      });
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
    }
  }

  console.log(
    `[feeds] known URLs loaded: ${known.size} (from urls.txt / processed.txt)`
  );
  return known;
}

// ====== メイン処理 ======
async function main() {
  console.log("[feeds] NEWS_ROOT =", NEWS_ROOT);

  await ensureDirExists(QUEUE_DIR);

  const feedUrls = await loadFeedUrls();
  const known = await loadKnownUrls();

  const parser = new RSSParser();
  const newlyFound = [];

  for (const feedUrl of feedUrls) {
    console.log(`[feeds] fetch: ${feedUrl}`);
    try {
      const feed = await parser.parseURL(feedUrl);

      for (const item of feed.items || []) {
        const link = item.link || item.guid;
        if (!link || !/^https?:\/\//.test(link)) continue;
        if (known.has(link)) continue;

        known.add(link);
        newlyFound.push(link);
      }
    } catch (err) {
      console.error(`[feeds] ❌ failed to fetch/parse feed: ${feedUrl}`);
      console.error("       ", err.message);
    }
  }

  if (newlyFound.length === 0) {
    console.log("[feeds] no new URLs found.");
    return;
  }

  // queue/urls.txt に追記
  const appendText = newlyFound.map((u) => u + "\n").join("");
  await fs.appendFile(URLS_FILE, appendText, "utf8");

  console.log(
    `[feeds] appended ${newlyFound.length} new URLs to ${URLS_FILE}`
  );
}

main().catch((err) => {
  console.error("[feeds] ❌ fatal error:", err);
  process.exit(1);
});
