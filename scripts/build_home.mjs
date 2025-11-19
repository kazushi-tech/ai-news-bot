// ai-news-bot/scripts/build_home.mjs
// AI News ホームダッシュボード生成スクリプト
// - Daily:  ai-news-bot/daily/*.md
// - Weekly: ai-news/weekly/*.md
// - 出力:   ai-news-bot/index.md

import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const BOT_ROOT = process.cwd(); // /Users/omats/git-check/myapp/ai-news-bot
const NEWS_ROOT = path.resolve(BOT_ROOT, '..', 'ai-news');

const DAILY_DIR = path.join(BOT_ROOT, 'daily');       // ★ ここを使う（旧: ai-news/daily）
const WEEKLY_DIR = path.join(NEWS_ROOT, 'weekly');    // 週次は現状 ai-news/weekly
const OUTPUT_PATH = path.join(BOT_ROOT, 'index.md');

function log(...args) {
  console.log('[home]', ...args);
}

// 安全な readdir（ディレクトリが無ければ空配列を返す）
async function safeReadDir(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && e.name.endsWith('.md'))
      .map((e) => e.name);
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      log('dir not found (ok):', dir);
      return [];
    }
    throw err;
  }
}

function dateFromFilename(name) {
  const m = name.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

function weekFromFilename(name) {
  // 例: 2025-11-19.md / 2025-W46--AI-news.md どちらでも
  const m =
    name.match(/^(\d{4}-W?\d{2})/) ||
    name.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

function buildObsidianLink(vaultRelPath, label) {
  // vault: myapp 固定前提
  const encoded = encodeURIComponent(vaultRelPath)
    // Obsidian は / をそのまま扱ってくれるのでここだけ戻す
    .replace(/%2F/g, '%2F');
  return `[${label}](obsidian://open?vault=myapp&file=${encoded})`;
}

async function loadDaily() {
  const files = await safeReadDir(DAILY_DIR);
  const result = [];

  for (const file of files) {
    const full = path.join(DAILY_DIR, file);
    const raw = await fs.readFile(full, 'utf8');
    const { data } = matter(raw);

    const date = (data.date || dateFromFilename(file) || '').toString().slice(0, 10);
    if (!date) continue;

    const title = data.title || file.replace(/\.md$/, '');
    const relPath = path.posix.join('ai-news-bot', 'daily', file);

    result.push({
      file,
      date,
      title,
      relPath,
    });
  }

  // 新しい日付順
  result.sort((a, b) => b.date.localeCompare(a.date));
  return result;
}

async function loadWeekly() {
  const files = await safeReadDir(WEEKLY_DIR);
  const result = [];

  for (const file of files) {
    const full = path.join(WEEKLY_DIR, file);
    const raw = await fs.readFile(full, 'utf8');
    const { data } = matter(raw);

    const week = (data.week || weekFromFilename(file) || '').toString();
    if (!week) continue;

    const title = data.title || file.replace(/\.md$/, '');
    const relPath = path.posix.join('ai-news', 'weekly', file);

    result.push({
      file,
      week,
      title,
      relPath,
    });
  }

  // 新しい週順（文字列比較で十分）
  result.sort((a, b) => b.week.localeCompare(a.week));
  return result;
}

function renderHome({ weekly, daily }) {
  const latestWeekly = weekly.slice(0, 3);
  const recentDaily = daily.slice(0, 10);

  let md = '';
  md += `---\n`;
  md += `title: "AI News Home"\n`;
  md += `---\n\n`;
  md += `# AI News\n\n`;

  // Weekly セクション
  md += `## 最新 Weekly\n\n`;
  if (latestWeekly.length === 0) {
    md += `（Weekly がまだ生成されていません）\n\n`;
  } else {
    md += `| 週 | Weeklyページ |\n`;
    md += `| --- | --- |\n`;
    for (const w of latestWeekly) {
      const link = buildObsidianLink(w.relPath, w.title);
      md += `| ${w.week} | ${link} |\n`;
    }
    md += `\n`;
  }

  // Daily セクション
  md += `## 最近の Daily\n\n`;
  if (recentDaily.length === 0) {
    md += `（Daily がまだ生成されていません）\n\n`;
  } else {
    md += `| 日付 | Dailyページ |\n`;
    md += `| --- | --- |\n`;
    for (const d of recentDaily) {
      const link = buildObsidianLink(d.relPath, d.title);
      md += `| ${d.date} | ${link} |\n`;
    }
    md += `\n`;
  }

  return md;
}

async function main() {
  log('BOT_ROOT   =', BOT_ROOT);
  log('NEWS_ROOT  =', NEWS_ROOT);
  log('DAILY_DIR  =', DAILY_DIR);
  log('WEEKLY_DIR =', WEEKLY_DIR);

  const [daily, weekly] = await Promise.all([loadDaily(), loadWeekly()]);

  log(`daily count  = ${daily.length}`);
  log(`weekly count = ${weekly.length}`);

  const md = renderHome({ weekly, daily });
  await fs.writeFile(OUTPUT_PATH, md, 'utf8');

  log('wrote:', OUTPUT_PATH);
}

main().catch((err) => {
  console.error('[home] ERROR:', err);
  process.exit(1);
});
