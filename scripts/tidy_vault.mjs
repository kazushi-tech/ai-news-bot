#!/usr/bin/env node
/**
 * tidy_vault.mjs
 * 目的:
 *  - summary 配下の index-daily-*.md / index-weekly*.md を news/ に移動/リネーム
 *  - 迷子のインデックス（例: Users/.../news/...）を救出
 *  - 必要フォルダを作成
 * 破壊的な削除はしない（上書きのみ）。事前に git commit を推奨。
 */

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

const ensureDirs = [
  "news/daily",
  "news/weekly",
  "summary",
  "seeds",
];

async function mkdirp(p) { await fs.mkdir(p, { recursive: true }); }
async function exists(p) { try { await fs.stat(p); return true; } catch { return false; } }

async function listFiles(dir) {
  const out = [];
  async function walk(d) {
    let entries;
    try { entries = await fs.readdir(d, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) await walk(p);
      else out.push(p);
    }
  }
  await walk(dir);
  return out;
}

function dateFromDaily(name) {
  const m = name.match(/index-daily-(\d{4}-\d{2}-\d{2})\.md$/i);
  return m ? m[1] : null;
}

function weeklyDateGuess(content) {
  // タイトル行の右端日付を採用（例: 週次ニュース索引 (2025-10-28 〜 2025-11-03)）
  const m = String(content).match(/(\d{4}-\d{2}-\d{2})\s*[\)\]]?\s*$/m);
  return m ? m[1] : null;
}

async function moveSafe(src, dest) {
  await mkdirp(path.dirname(dest));
  // 既に同名があれば上書き（怖ければバックアップするならここで rename）
  await fs.copyFile(src, dest);
  await fs.unlink(src);
  console.log(`→ ${src}  =>  ${dest}`);
}

(async () => {
  for (const d of ensureDirs) await mkdirp(d);

  const all = await listFiles(ROOT);

  // 1) daily: summary/やその他に散らばる index-daily-YYYY-MM-DD.md を news/daily/ へ
  const dailyCandidates = all.filter(p => /index-daily-\d{4}-\d{2}-\d{2}\.md$/i.test(p));
  for (const src of dailyCandidates) {
    const rel = path.relative(ROOT, src);
    const date = dateFromDaily(path.basename(src));
    if (!date) continue;
    const dest = path.join(ROOT, "news/daily", `${date}--AI-news.md`);
    await moveSafe(src, dest);
  }

  // 2) weekly: index-weekly*.md はニュースへ
  const weeklyCandidates = all.filter(p => /index-weekly.*\.md$/i.test(p));
  for (const src of weeklyCandidates) {
    const rel = path.relative(ROOT, src);
    const base = path.basename(src).toLowerCase();
    const txt = await fs.readFile(src, "utf8");

    // 週末日付を推定（なければ today 名）
    const d = weeklyDateGuess(txt) || new Date().toISOString().slice(0,10);

    // 最新にするファイル
    const destLatest = path.join(ROOT, "news", "index-weekly.md");
    await mkdirp(path.dirname(destLatest));
    await fs.writeFile(destLatest, txt, "utf8");
    console.log(`→ ${src}  =>  ${destLatest} (latest)`);

    // 履歴も保存
    const destHist = path.join(ROOT, "news/weekly", `${d}.md`);
    await fs.writeFile(destHist, txt, "utf8");
    console.log(`→ (history) ${destHist}`);

    // 元を削除
    await fs.unlink(src);
  }

  // 3) 迷子の /Users/.../news/* を救出（vault中に誤って作られた絶対パス断片）
  const strayNews = all.filter(p => /(^|\/)Users\/.+\/news\/.+\.md$/.test(p));
  for (const src of strayNews) {
    const tail = src.split(/\/news\//).pop(); // news/ より後ろ
    const dest = path.join(ROOT, "news", tail);
    await moveSafe(src, dest);
  }

  console.log("✅ tidy done.");
})();
