#!/usr/bin/env node
/**
 * build_index_daily.mjs
 * 指定日の要約 md から日次インデックスを生成
 * 出力列: タイトル | 記事ページへ | 引用元
 * ファイル名規約: summary/YYYY-MM-DD--host--slug.md（先頭の日付で判定）
 * 既定出力: news/daily/YYYY-MM-DD--AI-news.md
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
const DATE = args.date || new Date().toISOString().slice(0, 10);
const SUMMARY_DIR = args.summaryDir || "summary";
const OUT = args.out || `news/daily/${DATE}--AI-news.md`;
const VAULT = args.vault || "news"; // “読む用”Vault名（obsidian://open 用）
const LINK_MODE = (args.link || "obsidian").toLowerCase(); // obsidian|wiki|publish

/* ---------- utils ---------- */
async function* walk(dir) {
  for (const d of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(p);
    else if (d.isFile()) yield p;
  }
}
const isTarget = p => path.basename(p).startsWith(`${DATE}--`) && p.endsWith(".md");

function mkArticleLink(filePath) {
  // “news” Vault内の fulltext/ に記事 md がある前提でリンクする（無ければファイル名だけでOK）
  const basename = path.basename(filePath);
  const inNews = `fulltext/${basename}`; // news/fulltext にコピーされる想定
  if (LINK_MODE === "wiki") return `[[${inNews}|記事ページへ]]`;
  if (LINK_MODE === "obsidian") {
    const fileParam = encodeURIComponent(inNews);
    const vaultParam = encodeURIComponent(VAULT);
    return `[記事ページへ](obsidian://open?vault=${vaultParam}&file=${fileParam})`;
  }
  // publish 等に拡張したい場合はここに分岐を足す
  return `[[${inNews}|記事ページへ]]`;
}

/* ---------- collect ---------- */
const files = [];
for await (const p of walk(SUMMARY_DIR)) if (isTarget(p)) files.push(p);
files.sort(); // 安定

const rows = [];
for (const p of files) {
  const raw = await fs.readFile(p, "utf8");
  const fm = matter(raw).data || {};
  const title = (fm.title || fm.headline || path.basename(p).replace(/\.md$/, "")).toString().trim();
  const source = (fm.source || fm.url || fm.link || "").toString().trim();
  const srcLink = source ? `[引用元へ](${source})` : "";
  rows.push(`| ${title} | ${mkArticleLink(p)} | ${srcLink} |`);
}

/* ---------- render ---------- */
const md = `---
title: ${DATE} — AI News
tags: [ai-news, daily-index]
---

# ${DATE} — AI News

> **自動生成**（編集不要）

| タイトル | 記事ページへ | 引用元 |
|---|---|---|
${rows.join("\n")}
`;

await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, md, "utf8");
console.log(`daily index written: ${OUT}`);
