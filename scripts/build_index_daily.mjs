#!/usr/bin/env node
/**
 * build_index_daily.mjs (Publish用)
 * summary/*.md を集計し、news/YYYY-MM-DD--AI-news.md を生成
 * 列: タイトル | 記事(内部リンク) | 引用元(外部リンク) | 要約(<=140字)
 * 使い方:
 *   node scripts/build_index_daily.mjs
 *   node scripts/build_index_daily.mjs --date=2025-11-02
 *   node scripts/build_index_daily.mjs --no-snippet            // 3列版
 */

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

/* ---------- utils ---------- */
const z = n => String(n).padStart(2, "0");
const fmtDate = d => `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}`;
const parseArgs = (argv) => {
  const out = { noSnippet: false };
  for (const a of argv.slice(2)) {
    if (a.startsWith("--date=")) out.date = a.split("=")[1];
    if (a === "--no-snippet") out.noSnippet = true;
  }
  return out;
};
const stripMd = (s="") =>
  s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
   .replace(/[*_`>#]/g, "")                // marks
   .replace(/\s+/g, " ")
   .trim();
const escapeCell = (s="") => String(s).replace(/\|/g, "\\|").replace(/\r?\n|\r/g, " ");
const shorten = (s="", n=140) => (s = s.trim(), s.length>n ? s.slice(0,n-1)+"…" : s);
const wikiLinkFor = (fp, label) => `[[${fp.replace(/\.md$/i,"")}|${label}]]`;

function extractSnippet(md) {
  // TL;DR の先頭2行 → Key Points → 冒頭
  const pick = (re) => {
    const m = md.match(re);
    if (!m) return null;
    const bullets = m[1]
      .split(/\r?\n/)
      .map(l => l.replace(/^\s*-\s?/, "").trim())
      .filter(Boolean);
    return bullets.length ? bullets.slice(0,2).map(stripMd).join(" / ") : null;
  };
  return (
    pick(/^\s*#\s*TL;DR[\s\r\n]+((?:-\s?.*(?:\r?\n|$))+)/im) ||
    pick(/^\s*##\s*Key Points[\s\r\n]+((?:-\s?.*(?:\r?\n|$))+)/im) ||
    stripMd(md).slice(0, 200)
  );
}

/* ---------- gather ---------- */
const { date: dateArg, noSnippet } = parseArgs(process.argv);

const summaryDir = "summary";
let files = [];
try {
  for (const f of await fs.readdir(summaryDir)) {
    if (f.toLowerCase().endsWith(".md")) files.push(path.join(summaryDir, f));
  }
} catch { console.error("summary/ が見つかりません"); process.exit(1); }
if (!files.length) { console.error("summary/ にファイルがありません"); process.exit(0); }

const rows = [];
for (const fp of files) {
  const raw = await fs.readFile(fp, "utf8");
  const { data: fm, content } = matter(raw);
  const date = (fm.date || "").toString().slice(0,10);
  if (!date) continue;
  rows.push({
    file: fp,
    date,
    title: (fm.title || path.basename(fp)).toString(),
    host: (fm.host || "").toString(),
    source_url: (fm.source_url || "").toString(),
    model: (fm.model || "").toString(),
    snippet: extractSnippet(content),
  });
}

// 対象日
let targetDate = dateArg;
if (!targetDate) {
  const latest = rows.slice().sort((a,b)=> a.date<b.date?1:-1)[0];
  targetDate = latest?.date || fmtDate(new Date());
}

// 当日分
const items = rows.filter(r=>r.date===targetDate)
  .sort((a,b)=> a.title.localeCompare(b.title));

if (!items.length) { console.error(`対象日の記事がありません: ${targetDate}`); process.exit(0); }

/* ---------- render ---------- */
const pageTitle = `${targetDate}--AI-news`;
let md = `---\n`;
md += `title: "${pageTitle.replace(/"/g,'\\"')}"\n`;
md += `date: "${targetDate}"\n`;
md += `type: "ai-news-daily"\n`;
md += `---\n\n`;
md += `> 合計: **${items.length} 本**　モデル: gemini-2.5-flash 固定\n\n`;

if (noSnippet) {
  // 3列
  md += `| タイトル | 記事 | 引用元\n`;
  md += `|:--|:--:|:--:\n`;
  for (const it of items) {
    const t = escapeCell(stripMd(it.title));
    const article = wikiLinkFor(it.file, "記事ページへ");
    const cite = it.source_url ? `[引用元へ](${it.source_url})` : escapeCell(it.host || "");
    md += `| ${t} | ${article} | ${cite}\n`;
  }
} else {
  // 4列
  md += `| タイトル | 記事 | 引用元 | 要約\n`;
  md += `|:--|:--:|:--:|:--\n`;
  for (const it of items) {
    const t = escapeCell(stripMd(it.title));
    const article = wikiLinkFor(it.file, "記事ページへ");
    const cite = it.source_url ? `[引用元へ](${it.source_url})` : escapeCell(it.host || "");
    const snip = escapeCell(shorten(stripMd(it.snippet||""), 140));
    md += `| ${t} | ${article} | ${cite} | ${snip}\n`;
  }
}

md += `\n---\nこのページは自動生成（summary/ のfrontmatter + 本文から集計）。\n`;

/* ---------- write ---------- */
await fs.mkdir("news", { recursive: true });
const outPath = path.join("news", `${targetDate}--AI-news.md`);
await fs.writeFile(outPath, md, "utf8");
console.log("✔ index page →", outPath);
