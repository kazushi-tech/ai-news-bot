#!/usr/bin/env node
/**
 * build_index_weekly.mjs
 * 直近7日（または --from/--to）から週次インデックスを生成（重複は URL で排除）
 * 出力列: タイトル | 記事ページへ | 引用元
 * 既定出力: news/weekly/YYYY-MM-DD.md
 */

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

/* ---------- args ---------- */
const args = Object.fromEntries(
  process.argv.slice(2).map(a => {
    const [k, ...v] = a.replace(/^--/, "").split("=");
    return [k, v.length ? v.join("=") : true];
  })
);
const today = new Date();
const to = args.to || today.toISOString().slice(0, 10);
const from = args.from || new Date(today.getTime() - 6 * 86400000).toISOString().slice(0, 10);
const SUMMARY_DIR = args.summaryDir || "summary";
const OUT = args.out || `news/weekly/${to}.md`;
const VAULT = args.vault || "news";
const LINK_MODE = (args.link || "obsidian").toLowerCase();

/* ---------- utils ---------- */
function ymd(s) { return s.toISOString().slice(0, 10); }
function cmpDesc(a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; }

async function* walk(dir) {
  for (const d of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(p);
    else if (d.isFile()) yield p;
  }
}

function inRangeByPrefix(basename, fromYmd, toYmd) {
  const m = basename.match(/^(\d{4}-\d{2}-\d{2})--/);
  if (!m) return false;
  const d = m[1];
  return d >= fromYmd && d <= toYmd;
}

function mkArticleLink(filePath) {
  const basename = path.basename(filePath);
  const inNews = `fulltext/${basename}`; // news/fulltext に記事 md がある前提
  if (LINK_MODE === "wiki") return `[[${inNews}|記事ページへ]]`;
  if (LINK_MODE === "obsidian") {
    const fileParam = encodeURIComponent(inNews);
    const vaultParam = encodeURIComponent(VAULT);
    return `[記事ページへ](obsidian://open?vault=${vaultParam}&file=${fileParam})`;
  }
  return `[[${inNews}|記事ページへ]]`;
}

/* ---------- collect ---------- */
const all = [];
for await (const p of walk(SUMMARY_DIR)) {
  const base = path.basename(p);
  if (base.endsWith(".md") && inRangeByPrefix(base, from, to)) {
    const raw = await fs.readFile(p, "utf8");
    const fm = matter(raw).data || {};
    const title = (fm.title || fm.headline || base.replace(/\.md$/, "")).toString().trim();
    const source = (fm.source || fm.url || fm.link || "").toString().trim();
    const date = base.slice(0, 10);
    all.push({ p, base, date, title, source });
  }
}

/* ---------- dedupe by URL (prefer Japanese-looking domains) ---------- */
const pick = [];
const seen = new Map(); // url -> index
const preferJa = url => /\.co\.jp\b|ja\./i.test(url || "");

for (const item of all.sort(cmpDesc)) {
  const key = item.source || item.base; // URL なければファイル名で準ユニーク
  if (!seen.has(key)) {
    seen.set(key, pick.length);
    pick.push(item);
  } else {
    // 既存より日本語っぽいソースを優先
    const idx = seen.get(key);
    if (!preferJa(pick[idx].source) && preferJa(item.source)) {
      pick[idx] = item;
    }
  }
}

/* ---------- render ---------- */
const rows = pick
  .sort(cmpDesc)
  .map(({ p, title, source }) => {
    const srcLink = source ? `[引用元へ](${source})` : "";
    return `| ${title} | ${mkArticleLink(p)} | ${srcLink} |`;
  });

const md = `---
title: Weekly Index ${to}
tags: [ai-news, weekly-index]
---

# 直近7日のAIニュース一覧 (${to})
> 自動生成。編集不要。

| タイトル | 記事ページへ | 引用元 |
|---|---|---|
${rows.join("\n")}
`;

await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, md, "utf8");
console.log(`weekly index written: ${OUT}`);
