#!/usr/bin/env node
/**
 * fetch_ai_feeds.mjs
 * 良質AIソースのRSS/Atomを集約 → 品質フィルタ → URLを seeds/ai-feeds-YYYY-MM-DD.txt に出力
 * その後は summarize.yml の seed_file に渡せば自動要約（Gemini 2.5-flash固定）
 */

import fs from "node:fs/promises";
import path from "node:path";
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 20000,
  headers: { "user-agent": "ai-news-bot/1.0" }
});

// ★まずは堅い一次ソース中心（必要に応じて増やせる）
const FEEDS = [
  // 研究
  "https://arxiv.org/rss/cs.AI",
  "https://arxiv.org/rss/cs.LG",
  "https://arxiv.org/rss/cs.CL",
  "https://arxiv.org/rss/stat.ML",

  // 公式リサーチ/ブログ
  "https://ai.googleblog.com/atom.xml",
  "https://www.deepmind.com/blog/rss.xml",
  "https://www.anthropic.com/feed.xml",
  "https://ai.meta.com/blog/feed.xml",
  "https://openai.com/blog/rss.xml",
  "https://huggingface.co/blog/feed.xml",

  // ツール/エコシステム
  "https://github.blog/feed/",
];

const TRUST = {
  "arxiv.org": 4,
  "ai.googleblog.com": 4,
  "deepmind.com": 4,
  "anthropic.com": 4,
  "ai.meta.com": 3,
  "openai.com": 3,
  "huggingface.co": 3,
  "github.blog": 2,
};

function hostOf(u) { try { return new URL(u).host.replace(/^www\./, ""); } catch { return ""; } }
function jaRatio(s) { const m = String(s||"").match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/g); return (m?m.length:0)/(String(s||"").length||1); }
function score(item) {
  const host = hostOf(item.link);
  let s = (TRUST[host] || 0);
  const len = (item.contentSnippet || item.content || item.summary || "").length;
  if (len > 300) s += 1;                // 最低限の本文量
  if (jaRatio(item.title) > 0.2) s += 1; // 日本語記事も優先（任意）
  return s;
}
function norm(u) { try { const url = new URL(u); url.hash=""; url.search=""; return url.toString(); } catch { return u; } }

const today = new Date().toISOString().slice(0,10);
const outDir = "seeds";
await fs.mkdir(outDir, { recursive: true });
const outFile = path.join(outDir, `ai-feeds-${today}.txt`);

const seen = new Set();
const picked = [];

for (const feed of FEEDS) {
  try {
    const f = await parser.parseURL(feed);
    for (const it of f.items || []) {
      const link = it.link || it.guid;
      if (!link) continue;
      const k = norm(link);
      if (seen.has(k)) continue;

      // スコアリング（閾値は 3）
      if (score(it) >= 3) {
        seen.add(k);
        picked.push({ link: k, host: hostOf(k), title: it.title || "" });
      }
    }
  } catch (e) {
    console.error("feed error:", feed, e.message);
  }
}

// 重複・ホストごと上限など調整（例: 各ホストmax 8件）
const byHost = new Map();
for (const p of picked) {
  const arr = byHost.get(p.host) || [];
  if (arr.length < 8) arr.push(p);
  byHost.set(p.host, arr);
}
const flat = [...byHost.values()].flat();

// 書き出し（URLだけ1行ずつ）
await fs.writeFile(outFile, flat.map(p => p.link).join("\n") + "\n", "utf8");
console.log(`✅ seeds written: ${outFile} (${flat.length} urls)`);
