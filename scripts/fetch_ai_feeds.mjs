#!/usr/bin/env node
/**
 * fetch_ai_feeds.mjs
 * - sources/rss.txt からRSS/Atomを巡回
 * - URLを正規化して重複排除
 * - 軽い品質フィルタ（AI系っぽいキーワード/任意のallow/deny）
 * - seeds/ai-feeds-YYYY-MM-DD.txt を生成
 */
import fs from "node:fs/promises";
import path from "node:path";
import Parser from "rss-parser";

const ROOT = process.cwd();
const RSS_FILE = path.join(ROOT, "sources", "rss.txt");
const OUT_DIR = path.join(ROOT, "seeds");
const LIMIT = Number(process.env.FEEDS_LIMIT || 100); // 全体上限
const parser = new Parser();

const kw = [
  /(?:\b|_)(ai|llm|gpt|gemini|deepseek|transformer|diffusion|rag|agents?)(?:\b|_)/i
];

const allowDomains = new Set(
  (process.env.ALLOW || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
);

const denyDomains = new Set(
  (process.env.DENY || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
);

function normalize(url) {
  try {
    const u = new URL(url);
    u.hash = "";
    // 追跡パラメータ除去
    for (const p of [...u.searchParams.keys()]) {
      if (/^utm_|^fbclid$|^ref$|^igshid$/.test(p)) u.searchParams.delete(p);
    }
    // http→https
    u.protocol = "https:";
    // 末尾スラッシュ整理
    u.pathname = u.pathname.replace(/\/+$/, "");
    return u.toString();
  } catch {
    return null;
  }
}

function looksAIish(item) {
  const txt = `${item.title || ""} ${item.contentSnippet || ""}`.slice(0, 2000);
  return kw.some(re => re.test(txt));
}

function domainOf(url) {
  try { return new URL(url).hostname; } catch { return ""; }
}

async function readLines(file) {
  try {
    const t = await fs.readFile(file, "utf8");
    return t.split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith("#"));
  } catch {
    return [];
  }
}

(async () => {
  const feeds = await readLines(RSS_FILE);
  if (feeds.length === 0) {
    console.error(`No feeds in ${RSS_FILE}`);
    process.exit(1);
  }

  const seen = new Set();
  const out = [];

  for (const f of feeds) {
    try {
      const feed = await parser.parseURL(f);
      for (const it of feed.items || []) {
        if (!it.link) continue;
        const n = normalize(it.link);
        if (!n) continue;

        const host = domainOf(n);
        if (denyDomains.has(host)) continue;
        if (allowDomains.size && !allowDomains.has(host)) continue;

        if (!looksAIish(it) && allowDomains.size === 0) continue; // allow 指定が無い時はAIっぽさで絞る

        const key = host + new URL(n).pathname;
        if (seen.has(key)) continue;
        seen.add(key);

        out.push(n);
        if (out.length >= LIMIT) break;
      }
    } catch (e) {
      console.warn("feed error:", f, e.message);
    }
    if (out.length >= LIMIT) break;
  }

  await fs.mkdir(OUT_DIR, { recursive: true });
  const date = new Date().toISOString().slice(0,10);
  const outPath = path.join(OUT_DIR, `ai-feeds-${date}.txt`);
  await fs.writeFile(outPath, out.join("\n") + "\n", "utf8");
  console.log(`✅ seeds written: ${outPath} (${out.length})`);
})();
