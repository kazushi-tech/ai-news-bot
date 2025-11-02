#!/usr/bin/env node
/**
 * build_index_daily.mjs
 * 目的: summary/内の要約MDを1日分まとめて news/YYYY-MM-DD--AI-news.md を生成
 * 前提: 各 summary/*.md の frontmatter に { title, date, host, source_url, model } が入っている
 *
 * 使い方:
 *   # 今日(もしくは最新summaryのdate)で生成
 *   node scripts/build_index_daily.mjs
 *
 *   # 明示的に日付指定
 *   node scripts/build_index_daily.mjs --date=2025-11-02
 */

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const TZ = process.env.TZ || "Asia/Tokyo";

/* -------- helpers -------- */
function fmtDate(d) {
  // YYYY-MM-DD
  const z = (n) => String(n).padStart(2, "0");
  const yy = d.getFullYear();
  const mm = z(d.getMonth() + 1);
  const dd = z(d.getDate());
  return `${yy}-${mm}-${dd}`;
}

function parseArgs(argv) {
  const out = {};
  for (const a of argv.slice(2)) {
    if (a.startsWith("--date=")) out.date = a.split("=")[1];
  }
  return out;
}

function escapeCell(s = "") {
  return String(s).replace(/\|/g, "\\|");
}

function wikiLinkFor(filepath, display) {
  // ObsidianのWikiリンク [[summary/xxxx|表示名]]
  const noExt = filepath.replace(/\.md$/i, "");
  return `[[${noExt}|${display}]]`;
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

/* -------- main -------- */
const { date: dateArg } = parseArgs(process.argv);

// summary配下のファイル列挙
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
if (files.length === 0) {
  console.error("summary/ にファイルがありません");
  process.exit(1);
}

// 全件読み込み
const rows = [];
for (const fp of files) {
  const raw = await fs.readFile(fp, "utf8");
  const fm = matter(raw).data || {};
  const date = (fm.date || "").toString().slice(0, 10);
  const title = (fm.title || path.basename(fp)).toString();
  const host = (fm.host || "").toString();
  const model = (fm.model || "").toString();
  const src = (fm.source_url || "").toString();
  if (!date) continue;

  rows.push({
    file: fp,
    date,
    title,
    host,
    model,
    source_url: src,
  });
}

// 対象日を決める：--date 指定 or 最新summaryのdate
let targetDate = dateArg;
if (!targetDate) {
  const latest = rows
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  targetDate = latest?.date || fmtDate(new Date());
}

// 対象日の記事だけに絞る
const items = rows
  .filter((r) => r.date === targetDate)
  .sort((a, b) =>
    a.host === b.host ? a.title.localeCompare(b.title) : a.host.localeCompare(b.host)
  );

if (items.length === 0) {
  console.error(`対象日の記事がありません: ${targetDate}`);
  process.exit(0);
}

// Markdown本体を作る
const title = `${targetDate} — AI News`;
let md = `---\n`;
md += `title: "${title.replace(/"/g, '\\"')}"\n`;
md += `date: "${targetDate}"\n`;
md += `type: "ai-news-daily"\n`;
md += `---\n\n`;

md += `> 合計: **${items.length} 本** 　モデル: gemini-2.5-flash 固定\n\n`;

// テーブル（記事｜出典｜元リンク｜モデル）
md += `| # | 記事 | 出典 | 元リンク | モデル |\n`;
md += `|---:|:-----|:-----|:--------|:------|\n`;
items.forEach((it, idx) => {
  const disp = escapeCell(it.title);
  const link = wikiLinkFor(it.file, disp);
  const host = escapeCell(it.host);
  const src = it.source_url ? `[link](${it.source_url})` : "";
  const model = escapeCell(it.model || "");
  md += `| ${idx + 1} | ${link} | ${host} | ${src} | ${model} |\n`;
});

md += `\n---\n`;
md += `このページは自動生成（summary/ のfrontmatterから集計）。\n`;

// 出力
const newsDir = "news";
await ensureDir(newsDir);
const outPath = path.join(newsDir, `${targetDate}--AI-news.md`);
await fs.writeFile(outPath, md, "utf8");
console.log("✔ index page →", outPath);
