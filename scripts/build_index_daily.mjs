#!/usr/bin/env node
/**
 * build_index_daily.mjs (Publish用：デフォ3列)
 * summary/*.md を集計し、news/YYYY-MM-DD--AI-news.md を生成
 * 列: タイトル | 記事(内部リンク) | 引用元(外部リンク)
 *
 * 使い方:
 *   node scripts/build_index_daily.mjs                   # 最新日付で3列
 *   node scripts/build_index_daily.mjs --date=2025-11-02 # 指定日
 *   node scripts/build_index_daily.mjs --with-snippet    # 4列(要約あり)
 */

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

/* ---------- utils ---------- */
const z = (n) => String(n).padStart(2, "0");
const fmtDate = (d) =>
  `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;

function parseArgs(argv) {
  const o = { withSnippet: false };
  for (const a of argv.slice(2)) {
    if (a.startsWith("--date=")) o.date = a.split("=")[1];
    if (a === "--with-snippet") o.withSnippet = true;
  }
  return o;
}

const escapeCell = (s) =>
  String(s || "")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n|\r/g, " ");

const stripMd = (s) =>
  String(s || "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const shorten = (s, n = 140) => (
  (s = String(s || "").trim()), s.length > n ? s.slice(0, n - 1) + "…" : s
);

/** Obsidian内部リンクを堅牢化（Windowsの \ を / に統一） */
const wiki = (fp, label) =>
  `[[${String(fp).replace(/\\/g, "/").replace(/\.md$/i, "")}|${label}]]`;

/** frontmatter の date を "YYYY-MM-DD" に丸める（Date/文字列両対応） */
function ymd(v) {
  if (!v) return "";
  if (v instanceof Date && !isNaN(v)) return v.toISOString().slice(0, 10);
  const s = String(v);
  const m = s.match(/\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : "";
}

function pickSnippet(md) {
  const sec = (re) => {
    const m = md.match(re);
    if (!m) return null;
    const bullets = m[1]
      .split(/\r?\n/)
      .map((l) => l.replace(/^\s*-\s?/, "").trim())
      .filter(Boolean);
    return bullets.length
      ? bullets.slice(0, 2).map(stripMd).join(" / ")
      : null;
  };
  return (
    sec(/^\s*#\s*TL;DR[\s\r\n]+((?:-\s?.*(?:\r?\n|$))+)/im) ||
    sec(/^\s*##\s*Key Points[\s\r\n]+((?:-\s?.*(?:\r?\n|$))+)/im) ||
    stripMd(md).slice(0, 200)
  );
}

/* ---------- gather ---------- */
const { date: dateArg, withSnippet } = parseArgs(process.argv);
const dir = "summary";
const files = (await fs.readdir(dir))
  .filter((f) => f.toLowerCase().endsWith(".md"))
  .map((f) => path.join(dir, f));

if (!files.length) {
  console.error("summary/ にファイルがありません");
  process.exit(0);
}

const rows = [];
for (const fp of files) {
  const raw = await fs.readFile(fp, "utf8");
  const { data: fm, content } = matter(raw);
  const date = ymd(fm.date);
  if (!date) continue;
  rows.push({
    file: fp,
    date,
    title: (fm.title || path.basename(fp)).toString(),
    host: (fm.host || "").toString(),
    src: (fm.source_url || "").toString(),
    model: (fm.model || "").toString(),
    snippet: pickSnippet(content),
  });
}

let target = dateArg;
if (!target) {
  const latest = rows.slice().sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  target = latest?.date || fmtDate(new Date());
}

const items = rows
  .filter((r) => r.date === target)
  .sort((a, b) => a.title.localeCompare(b.title));

if (!items.length) {
  console.error(`対象日の記事がありません: ${target}`);
  process.exit(0);
}

/* ---------- render ---------- */
const pageTitle = `${target}--AI-news`;
let md = `---\n`;
md += `title: "${pageTitle.replace(/"/g, '\\"')}"\n`;
md += `date: "${target}"\n`;
md += `type: "ai-news-daily"\n`;
md += `---\n\n`;
md += `> 合計: **${items.length} 本**　モデル: gemini-2.5-flash 固定\n\n`;

if (!withSnippet) {
  md += `| タイトル | 記事 | 引用元 |\n|:--|:--:|:--:|\n`;
  for (const it of items) {
    const t = escapeCell(stripMd(it.title));
    const art = wiki(it.file, "記事ページへ"); // 内部リンク固定
    const cite = it.src ? `[引用元へ](${it.src})` : escapeCell(it.host || "");
    md += `| ${t} | ${art} | ${cite} |\n`;
  }
} else {
  md += `| タイトル | 記事 | 引用元 | 要約 |\n|:--|:--:|:--:|:--|\n`;
  for (const it of items) {
    const t = escapeCell(stripMd(it.title));
    const art = wiki(it.file, "記事ページへ"); // 内部リンク固定
    const cite = it.src ? `[引用元へ](${it.src})` : escapeCell(it.host || "");
    const sn = escapeCell(shorten(stripMd(it.snippet), 140));
    md += `| ${t} | ${art} | ${cite} | ${sn} |\n`;
  }
}

md += `\n---\nこのページは自動生成（summary/ のfrontmatter + 本文から集計）。\n`;

/* ---------- write ---------- */
await fs.mkdir("news", { recursive: true });
const out = path.join("news", `${target}--AI-news.md`);
await fs.writeFile(out, md, "utf8");
console.log("✔ index page →", out);
