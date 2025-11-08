#!/usr/bin/env node
/*
docs/ai-news-bot 配下の summary.md を集計し、
docs/news/YYYY-MM-DD--AI-news.md に静的テーブルを生成/更新します。
依存パッケージなし（簡易YAMLパーサ）。
*/
import fs from 'node:fs/promises';
import path from 'node:path';

const DOCS_ROOT = path.resolve(process.cwd(), 'docs');
const SRC_DIR = path.join(DOCS_ROOT, 'ai-news-bot');
const OUT_DIR = path.join(DOCS_ROOT, 'news');

function ensure(str) { return str == null ? '' : String(str); }

async function walk(dir) {
  const out = [];
  const ents = await fs.readdir(dir, { withFileTypes: true });
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p));
    else if (e.isFile() && e.name === 'summary.md') out.push(p);
  }
  return out;
}

function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?/);
  const data = {};
  let body = md;
  if (m) {
    const yaml = m[1];
    body = md.slice(m[0].length);
    for (const line of yaml.split(/\r?\n/)) {
      if (!line.trim() || line.trim().startsWith('#')) continue;
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const k = line.slice(0, idx).trim();
      let v = line.slice(idx + 1).trim();
      if (/^\[.*\]$/.test(v)) { try { v = JSON.parse(v); } catch { /* noop */ } }
      else if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      data[k] = v;
    }
  }
  return { data, body };
}

function ymd(dstr) {
  const d = new Date(dstr || Date.now());
  if (isNaN(d.getTime())) return undefined;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/** 本文の先頭の一文（句点/ピリオド/!/? まで）を返し、max を超えたら省略 */
function firstSentence(text, max = 140) {
  const t = ensure(text).replace(/\s+/g, ' ').trim();
  if (!t) return '';
  const m = t.match(/^.*?[。．.!?！？]/); // 句読点の直後まで
  let s = m ? m[0] : t.slice(0, max);
  if (s.length > max) s = s.slice(0, max - 1) + '…';
  return s;
}

function mdRow({ date, title, url, source, summary }) {
  const titleCell = url ? `[${title}](${url})` : title;
  const sumCell = ensure(summary).replace(/\|/g, '\\|');
  const srcCell = ensure(source).replace(/\|/g, '\\|');
  return `| ${date} | ${titleCell} | ${srcCell} | ${sumCell} |`;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const files = await walk(SRC_DIR);
  const rows = [];

  for (const f of files) {
    const md = await fs.readFile(f, 'utf8');
    const { data, body } = parseFrontmatter(md);

    const stat = await fs.stat(f);
    const date = ymd(data.date) || ymd(stat.mtime);
    const title = ensure(data.title || data.headline || path.basename(path.dirname(f)));
    const url = ensure(data.url || data.link || data.href || '');
    const source = ensure(data.source || data.site || data.publisher || '');
    const summary = firstSentence(body, 140);

    rows.push({ date, title, url, source, summary });
  }

  // 日付降順
  rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const today = ymd(Date.now());
  const outFile = path.join(OUT_DIR, `${today}--AI-news.md`);

  const header =
`# AI news (${today})

| 日付 | タイトル | 出典 | 概要 |
|---|---|---|---|
`;
  const table = rows.map(mdRow).join('\n');
  await fs.writeFile(outFile, header + table + '\n', 'utf8');
}

// ← ここは関数の外。最後に実行。
main().catch((e) => { 
  console.error(e);
  process.exit(1);
});
