#!/usr/bin/env node
// scripts/fetch_ai_candidates.mjs
//
// 各種 AI 関連 RSS から「AI っぽい記事候補」を集めて、
// Obsidian Vault 内 (ai-news/news/intake/) に Markdown で候補リストを出す。
// → どれを ingest するかは人間（かずし）が選ぶ前提。
// → Vault / Daily 生成ロジックには一切手を出さない。

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { XMLParser } from "fast-xml-parser";

const NEWS_ROOT = process.env.NEWS_ROOT
  ? path.resolve(process.cwd(), process.env.NEWS_ROOT)
  : path.resolve(process.cwd(), "..", "ai-news");

const ARTICLES_DIR = path.resolve(NEWS_ROOT, "articles");
const NEWS_DIR = path.resolve(NEWS_ROOT, "news");
// intake 用のサブフォルダ。Vault はそのままで、news/ 配下に小さなフォルダだけ追加。
const INTAKE_DIR = path.resolve(NEWS_DIR, "intake");

console.log(`[fetch] NEWS_ROOT    = ${NEWS_ROOT}`);
console.log(`[fetch] ARTICLES_DIR  = ${ARTICLES_DIR}`);
console.log(`[fetch] NEWS_DIR      = ${NEWS_DIR}`);
console.log(`[fetch] INTAKE_DIR    = ${INTAKE_DIR}`);

// ===== ユーティリティ =====

function todayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// RSS から「最近 N 日以内」の記事だけ見る
const RECENT_DAYS = 30;

// AI 判定ロジック（build_index_daily と同じ系統）
const TITLE_AI_REGEXES = [
  /AI/iu,
  /ＡＩ/u,
  /人工知能/u,
  /生成AI/iu,
  /生成ＡＩ/u,
  /大規模言語モデル/u,
  /LLM/iu,
  /ChatGPT/iu,
  /Gemini/iu,
  /Claude/iu,
  /Copilot/iu,
  /Neural Network/iu,
  /ニューラルネット/iu,
  /機械学習/u,
  /深層学習/u,
  /ディープラーニング/u,
  /画像生成/u,
  /音声生成/u,
  /テキスト生成/u
];

function looksLikeAiFromText(text) {
  const t = String(text || "");
  return TITLE_AI_REGEXES.some((re) => re.test(t));
}

async function loadSourcesConfig() {
  const configPath = path.resolve(process.cwd(), "config", "ai_sources.json");
  let raw;
  try {
    raw = await fs.readFile(configPath, "utf8");
  } catch (err) {
    throw new Error(
      `[fetch] ❌ failed to read config/ai_sources.json: ${
        err && err.message ? err.message : String(err)
      }`
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `[fetch] ❌ invalid JSON in config/ai_sources.json: ${
        err && err.message ? err.message : String(err)
      }`
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error("[fetch] ❌ ai_sources.json must be an array");
  }

  return parsed;
}

async function collectExistingArticleUrls() {
  const urls = new Set();

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
        let raw;
        try {
          raw = await fs.readFile(full, "utf8");
        } catch (err) {
          console.warn(
            `[fetch] ⚠️ failed to read article ${full}: ${
              err && err.message ? err.message : String(err)
            }`
          );
          continue;
        }

        try {
          const parsed = matter(raw);
          const fm = parsed.data ?? {};
          if (fm.url) {
            urls.add(String(fm.url).trim());
          } else if (fm.source_url) {
            urls.add(String(fm.source_url).trim());
          }
        } catch (err) {
          console.warn(
            `[fetch] ⚠️ YAML parse error in article ${full}: ${
              err && err.message ? err.message : String(err)
            }`
          );
        }
      }
    }
  }

  await walk(ARTICLES_DIR);

  console.log(`[fetch] existing article URLs: ${urls.size}`);
  return urls;
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

async function fetchRss(url) {
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    console.warn(
      `[fetch] ⚠️ failed to fetch RSS ${url}: ${
        err && err.message ? err.message : String(err)
      }`
    );
    return null;
  }

  if (!res.ok) {
    console.warn(
      `[fetch] ⚠️ RSS HTTP error ${url}: ${res.status} ${res.statusText}`
    );
    return null;
  }

  const text = await res.text();
  try {
    return xmlParser.parse(text);
  } catch (err) {
    console.warn(
      `[fetch] ⚠️ failed to parse RSS XML for ${url}: ${
        err && err.message ? err.message : String(err)
      }`
    );
    return null;
  }
}

function normalizeDate(dateLike) {
  if (!dateLike) return null;
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function isRecent(date) {
  if (!date) return false;
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= RECENT_DAYS;
}

function extractItemsFromFeed(feedJson) {
  if (!feedJson) return [];

  // RSS 2.0
  if (feedJson.rss && feedJson.rss.channel) {
    const ch = feedJson.rss.channel;
    const items = Array.isArray(ch.item) ? ch.item : ch.item ? [ch.item] : [];
    return items.map((it) => ({
      title: it.title ?? "",
      link: it.link ?? "",
      description: it.description ?? "",
      pubDate: it.pubDate ?? it["dc:date"] ?? null
    }));
  }

  // Atom
  if (feedJson.feed && feedJson.feed.entry) {
    const entries = Array.isArray(feedJson.feed.entry)
      ? feedJson.feed.entry
      : [feedJson.feed.entry];
    return entries.map((e) => ({
      title: e.title?._text ?? e.title ?? "",
      link: Array.isArray(e.link)
        ? e.link[0]["@_href"]
        : e.link && e.link["@_href"]
        ? e.link["@_href"]
        : "",
      description: e.summary ?? e.content ?? "",
      pubDate: e.updated ?? e.published ?? null
    }));
  }

  return [];
}

function escapeCell(value) {
  return String(value)
    .replace(/\r?\n|\r/g, "<br>")
    .replace(/\|/g, "\\|");
}

function escapeUrl(value) {
  return String(value).replace(/\)/g, "\\)");
}

async function main() {
  await fs.mkdir(INTAKE_DIR, { recursive: true });

  const sources = await loadSourcesConfig();
  const existingUrls = await collectExistingArticleUrls();

  const today = todayKey();
  const candidates = [];

  for (const src of sources) {
    // disabled: true のソースはスキップ
    if (src.disabled) {
      console.log(`[fetch] skipping disabled source ${src.id}`);
      continue;
    }

    const rssUrl = src.rss;
    if (!rssUrl) {
      console.warn(`[fetch] ⚠️ source ${src.id} has no rss url, skipping`);
      continue;
    }

    console.log(`[fetch] fetching ${src.id} (${rssUrl}) ...`);

    const feedJson = await fetchRss(rssUrl);
    if (!feedJson) continue;

    const items = extractItemsFromFeed(feedJson);
    console.log(
      `[fetch] source ${src.id}: raw items ${items.length}`
    );

    const perSource = [];
    for (const item of items) {
      const link = String(item.link || "").trim();
      const title = String(item.title || "").trim();
      const desc = String(item.description || "").trim();

      if (!link || !title) continue;

      const pub = normalizeDate(item.pubDate);
      if (!isRecent(pub)) continue;

      if (!looksLikeAiFromText(`${title}\n${desc}`)) continue;

      if (existingUrls.has(link)) continue;

      perSource.push({
        sourceId: src.id,
        sourceLabel: src.label || src.id,
        url: link,
        title,
        description: desc,
        pubDate: pub
      });
    }

    // 日ごとの上限
    const maxPerDay =
      typeof src.maxPerDay === "number" && src.maxPerDay > 0
        ? src.maxPerDay
        : 5;

    perSource.sort((a, b) => b.pubDate - a.pubDate);
    const limited = perSource.slice(0, maxPerDay);

    console.log(
      `[fetch] source ${src.id}: candidates after filter = ${limited.length}`
    );

    candidates.push(...limited);
  }

  if (candidates.length === 0) {
    console.log("[fetch] no candidates found for today, nothing to write.");
    return;
  }

  // 全体を新しい順に並べる
  candidates.sort((a, b) => b.pubDate - a.pubDate);

  const outPath = path.join(INTAKE_DIR, `${today}--candidates.md`);

  const lines = [];
  lines.push("---");
  lines.push(`title: AI News 候補 ${today}`);
  lines.push(`created: ${today}`);
  lines.push("kind: intake");
  lines.push("cssclass: ai-news-intake");
  lines.push("---");
  lines.push("");
  lines.push(`# AI News 候補 ${today}`);
  lines.push("");
  lines.push(
    "このリストは RSS から自動抽出した AI 記事候補です。気になるものだけ ingest してください。"
  );
  lines.push("");
  lines.push("| タイトル | ソース | 公開日 | URL | ingestコマンド |");
  lines.push("| --- | --- | --- | --- | --- |");

  for (const c of candidates) {
    const titleCell = escapeCell(c.title);
    const sourceCell = escapeCell(c.sourceLabel);
    const dateCell = c.pubDate.toISOString();
    const urlCell = `[link](${escapeUrl(c.url)})`;

    // ここは実際の ingest コマンドに合わせて調整してOK
    const ingestCmd = escapeCell(
      `npm run ingest:url -- "${c.url}"`
    );

    lines.push(
      `| ${titleCell} | ${sourceCell} | ${dateCell} | ${urlCell} | \`${ingestCmd}\` |`
    );
  }

  lines.push("");

  await fs.writeFile(outPath, lines.join("\n"), "utf8");

  console.log(
    `[fetch] wrote candidates: ${outPath} (items=${candidates.length})`
  );
}

main().catch((err) => {
  console.error("[fetch] ❌ fatal error:", err);
  process.exit(1);
});
