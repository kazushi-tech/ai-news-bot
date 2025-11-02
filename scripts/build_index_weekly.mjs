#!/usr/bin/env node
/**
 * build_index_weekly.mjs
 * news/**.md（frontmatter付き）を走査し、直近7日分を indexes/weekly/YYYY-MM-DD.md に集計する。
 * 依存ライブラリなし（Node 20 / ESM）。
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, ".."); // scripts/ の一つ上
const NEWS_DIR = path.join(repoRoot, "news");
const OUT_DIR = path.join(repoRoot, "indexes", "weekly");

/** JSTで今日の日付を返す */
function nowJst() {
  const t = Date.now() + 9 * 60 * 60 * 1000;
  return new Date(t);
}
function ymd(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function parseFrontmatter(md) {
  // ---\n...\n--- の最初のブロックだけを素朴に解釈
  const m = md.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([A-Za-z0-9_\-]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    const k = kv[1].trim();
    let v = kv[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    out[k] = v;
  }
  return out;
}

async function listMdFiles(dir) {
  const out = [];
  async function walk(p) {
    const ents = await fs.readdir(p, { withFileTypes: true });
    for (const e of ents) {
      const fp = path.join(p, e.name);
      if (e.isDirectory()) await walk(fp);
      else if (e.isFile() && e.name.toLowerCase().endsWith(".md")) out.push(fp);
    }
  }
  try {
    await walk(dir);
  } catch {
    // news/ がないなど
  }
  return out;
}

function inLast7Days(jstDateStr, todayJst) {
  if (!jstDateStr) return false;
  // 入力は YYYY-MM-DD 想定 (frontmatter: date)
  const m = jstDateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  const today = new Date(Date.UTC(todayJst.getUTCFullYear(), todayJst.getUTCMonth(), todayJst.getUTCDate()));
  const diff = (today - d) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 6; // 今日含め過去6日＝直近7日
}

function mdTable(rows) {
  const head = `| 日付 | 媒体 | タイトル | 出典 |\n|---|---|---|---|`;
  const lines = rows.map((r) => {
    const t = r.title || "(no title)";
    const src = r.source_url ? `[link](${r.source_url})` : "";
    return `| ${r.date || ""} | ${r.host || ""} | ${t} | ${src} |`;
  });
  return [head, ...lines].join("\n");
}

async function main() {
  const today = nowJst();
  const outName = ymd(today) + ".md";
  await fs.mkdir(OUT_DIR, { recursive: true });

  const files = await listMdFiles(NEWS_DIR);
  const rows = [];
  for (const f of files) {
    const txt = await fs.readFile(f, "utf8").catch(() => "");
    if (!txt) continue;
    const fm = parseFrontmatter(txt);
    if (!inLast7Days(fm.date, today)) continue;
    rows.push({
      file: f,
      title: fm.title,
      date: fm.date,
      host: fm.host,
      source_url: fm.source_url,
    });
  }
  // 日付降順
  rows.sort((a, b) => (a.date < b.date ? 1 : -1));

  const body = rows.length
    ? mdTable(rows)
    : "_該当期間のニュースはありませんでした。_";

  const md = `---
title: "Weekly Index ${ymd(today)}"
tags: [ai-news, weekly-index]
---

# 直近7日のAIニュース一覧 (${ymd(today)})
> 自動生成。編集不要。

${body}
`;
  const outPath = path.join(OUT_DIR, outName);
  await fs.writeFile(outPath, md, "utf8");
  console.log(`[ok] wrote ${outPath} (${rows.length} items)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
