#!/usr/bin/env node
/**
 * build_index_daily.mjs (Publish用テーブル版)
 * summary/*.md を集計し、news/YYYY-MM-DD--AI-news.md を生成。
 * 列: タイトル | 記事(内部) | 引用元(外部) | 要約(<=140字)
 *
 * 使い方:
 *   node scripts/build_index_daily.mjs              # 最新日付で生成
 *   node scripts/build_index_daily.mjs --date=2025-11-02
 */

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

function fmtDate(d) {
  const z = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}
function parseArgs(argv) {
  const out = {};
  for (const a of argv.slice(2)) if (a.startsWith("--date=")) out.date = a.split("=")[1];
  return out;
}
function escapeCell(s = "") {
  return String(s).replace(/\|/g, "\\|").replace(/\r?\n|\r/g, " ");
}
function stripMd(s = "") {
  // []() のリンク/強調/コード等をざっくり除去
  return s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
function shorten(s = "", n = 140) {
  const t = s.trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}
function wikiLinkFor(fp, display) {
  const noExt = fp.replace(/\.md$/i, "");
  return `[[${noExt}|${display}]]`;
}
function extractSnippetFromContent(md) {
  // TL;DR の箇条書きがあれば先頭2つを結合、なければ本文冒頭
  const m = md.match(/^\s*#\s*TL;DR[\s\r\n]+((?:-\s?.*(?:\r?\n|$))+)/im);
  if (m) {
    const bullets = m[1]
      .split(/\r?\n/)
      .map((l) => l.replace(/^\s*-\s?/, "").trim())
      .filter(Boolean);
    if (bullets.length) return bullets.slice(0, 2).map(stripMd).join(" / ");
  }
  // TL;DR が無い場合は Key Points 探索 or 冒頭200字
  const kp = md.match(/^\s*##\s*Key Points[\s\r\n]+((?:-\s?.*(?:\r?\n|$))+)/im);
  if (kp) {
    const bullets = kp[1]
      .split(/\r?\n/)
      .map((l) => l.replace(/^\s*-\s?/, "").trim())
      .filter(Boolean);
    if (bullets.length) return bullets.slice(0, 2).map(stripMd).join(" / ");
  }
  return stripMd(md).slice(0, 200);
}

async function ensureDir(d) { await fs.mkdir(d, { recursive: true }); }

// --- gather summary files
const { date: dateArg } = parseArgs(process.argv);
const summaryDir = "summary";
let files = [];
try {
  for (const f of await fs.readdir(summaryDir)) {
    if (f.toLowerCase().endsWith(".md")) files.push(path.join(summaryDir, f));
  }
} catch {
  console.error("summary/ が見つかりません");
  process.exit(1);
}
if (!files.length) { console.error("summary/ にファイルがありません"); process.exit(1); }

const rows = [];
for (const fp of files) {
  const raw = await fs.readFile(fp, "utf8");
  const { data: fm, content } = matter(raw);
  const date = (fm.date || "").toString().slice(0, 10);
  if (!date) continue;
  rows.push({
    file: fp,
    date,
    title: (fm.title || path.basename(fp)).toString(),
    host: (fm.host || "").toString(),
    source_url: (fm.source_url || "").toString(),
    model: (fm.model || "").toString(),
    snippet: extractSnippetFromContent(content),
  });
}

// decide target date
let targetDate = dateArg;
if (!targetDate) {
  const latest = rows.slice().sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  targetDate = latest?.date || fmtDate(new Date());
}

const items = rows.filter(r => r.date === targetDate)
  .sort((a, b) => a.title.localeCompare(b.title));

if (!items.length) {
  console.error(`対象日の記事がありません: ${targetDate}`);
  process.exit(0);
}

// --- build page
const title = `${targetDate}--AI-news`;
let md = `---\n`;
md += `title: "${title.replace(/"/g, '\\"')}"\n`;
md += `date: "${targetDate}"\n`;
md += `type: "ai-news-daily"\n`;
md += `---\n\n`;
md += `> 合計: **${items.length} 本**　モデル: gemini-2.5-flash 固定\n\n`;

md += `| タイトル | 記事 | 引用元 | 要約 |\n`;
md += `|:--|:--:|:--:|:--|\n`;
for (const it of items) {
  const title = escapeCell(stripMd(it.title));
  const article = wikiLinkFor(it.file, "記事ページへ");
  const cite = it.source_url ? `[引用元へ](${it.source_url})` : (it.host || "");
  const snippet = escapeCell(shorten(stripMd(it.snippet), 140));
  md += `| ${title} | ${article} | ${cite} | ${snippet} |\n`;
}

md += `\n---\nこのページは自動生成（summary/ のfrontmatter + 本文から集計）。\n`;

await ensureDir("news");
const outPath = path.join("news", `${targetDate}--AI-news.md`);
await fs.writeFile(outPath, md, "utf8");
console.log("✔ index page →", outPath);
