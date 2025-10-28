#!/usr/bin/env node
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import Parser from 'rss-parser';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { table } from 'markdown-table';
import {
  toJST, formatYMD, weekRangeMonSun,
  fetchFulltext, htmlToMd, dedupe
} from '../lib/utils.mjs';
import { summarizeLocal, summarizeOpenAI } from '../lib/summarize.mjs';

dayjs.extend(utc);
dayjs.extend(timezone);

const parser = new Parser();
const ROOT = process.cwd();
const NEWS_DIR = path.join(ROOT, 'news');
const FULL_DIR = path.join(NEWS_DIR, 'fulltext');
fs.mkdirSync(NEWS_DIR, { recursive: true });
fs.mkdirSync(FULL_DIR, { recursive: true });

const argv = process.argv.slice(2);
const MAX = getFlag('--max', 20);
const SAVE_FULL = hasFlag('--save-fulltext');
const USE_JP_COLUMNS = hasFlag('--jp-columns');

function hasFlag(name) { return argv.includes(name); }
function getFlag(name, def) {
  const i = argv.indexOf(name);
  return i >= 0 ? Number(argv[i + 1]) : def;
}

const sources = fs.readFileSync(path.join(ROOT, 'sources/rss.txt'), 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'));

const sinceDays = getFlag('--since-days', 7);
const now = toJST(new Date());
const dateStr = formatYMD(now);

console.log('Build AI News:', { dateStr, MAX, sinceDays, SAVE_FULL });

const entries = [];
for (const url of sources) {
  try {
    const feed = await parser.parseURL(url);
    for (const item of feed.items || []) {
      const pub = item.isoDate ? new Date(item.isoDate) : new Date();
      if ((Date.now() - pub.getTime()) / 86400000 > sinceDays) continue;
      entries.push({
        title: item.title || '',
        url: item.link || '',
        source: new URL(item.link || feed.link || url).hostname,
        date: pub,
        publishedAt: pub
      });
    }
  } catch (e) {
    console.warn('RSS error:', url, e.message);
  }
}

// 重複除去
const items = dedupe(entries).slice(0, MAX);

// 本文抽出と要約
const processedItems = [];
for (const item of items) {
  try {
    const { title: t2, content } = await fetchFulltext(item.url);
    const md = htmlToMd(content);
    const title = item.title || t2 || '(無題)';
    const text = md;
    const summary = process.env.OPENAI_API_KEY
      ? await summarizeOpenAI(text)
      : summarizeLocal(text);
    item.summary = summary;
    const publishedAt = item.publishedAt || item.date || new Date();
    item.publishedAt = publishedAt;

    // 個別記事（保存）
    const slug = sanitizeSlug(title);
    const mdBody = renderArticle({ title, url: item.url, source: item.source, date: now, summary, md });
    const file = path.join(NEWS_DIR, `${dateStr}--${slug}.md`);
    fs.writeFileSync(file, mdBody);
    if (SAVE_FULL) {
      fs.writeFileSync(path.join(FULL_DIR, `${slug}.md`), `# ${title}\n\n${md}`);
    }

    processedItems.push({
      title,
      url: item.url,
      source: item.source,
      summary,
      lang: guessLang(md) || '—',
      articlePath: file,
      publishedAt
    });
  } catch (e) {
    console.warn('build item error:', item.url, e.message);
  }
}

// 日次インデックス（表）
const dailyFile = path.join(NEWS_DIR, `${dateStr}--AI-news.md`);
if (USE_JP_COLUMNS) {
  const mdTable = makeNewsTable(processedItems);
  const header = `# ${formatYMD(toJST())} — AIニュース`;
  fs.writeFileSync(dailyFile, `${header}\n\n${mdTable}\n`);
} else {
  fs.writeFileSync(dailyFile, renderTable(processedItems));
}

// 週次集約（Mon-Sun）
const wr = weekRangeMonSun(now);
const WEEK_DIR = path.join(NEWS_DIR, 'weekly', wr.label);
fs.mkdirSync(WEEK_DIR, { recursive: true });
const weeklyIndex = path.join(WEEK_DIR, 'index.md');
appendWeekly(weeklyIndex, processedItems, dateStr);

console.log(`OK: ${processedItems[0]?.title || '-'} / Processed ${processedItems.length} item(s.)`);


// ===== helpers =====

function renderArticle({ title, url, source, date, summary, md }) {
  const ymd = formatYMD(date);
  return `# ${title}

プロパティ  
- **リンク**: ${url}  
- **ソース**: ${source}  
- **日付**: ${ymd}  

## 引用元
${url}

${summary}

## 詳細レポート
${md}
`;
}

function renderTable(rows) {
  const headers = ['Title', 'Source', 'Lang', 'Tags', 'Article'];

  const lines = [];
  lines.push(`| ${headers.join(' | ')} |`);
  lines.push(`| ${headers.map(() => '---').join(' | ')} |`);

  for (const r of rows) {
    const articleLink = `[記事ページへ](${path.basename(r.articlePath)})`;
    const row = [
      `[${r.title}](${r.url})`,
      r.source,
      r.lang || '—',
      guessTags(r.source).join(','),
      articleLink
    ];
    lines.push(`| ${row.join(' | ')} |`);
  }
  return `# ${formatYMD(toJST())} — AIニュース\n\n${lines.join('\n')}\n`;
}

function toRow(item) {
  const published = item.publishedAt || Date.now();
  const dateJst = dayjs(published).tz('Asia/Tokyo').format('YYYY-MM-DD');
  return [
    dateJst,
    item.title || '',
    item.source || '',
    item.summary || '',
    item.url
  ];
}

function makeNewsTable(items) {
  const header = ['日付','タイトル','ソース','要約','URL'];
  const rows = items.map(toRow);
  return table([header, ...rows], { align: ['c','l','c','l','l'] });
}

function appendWeekly(weeklyIndex, rows, dateStr) {
  const title = `## ${dateStr}`;
  const block = rows.map((r) => `- [${r.title}](${path.basename(r.articlePath)}) — ${r.source}`).join('\n');
  const add = `${title}\n${block}\n\n`;
  if (!fs.existsSync(weeklyIndex)) {
    fs.writeFileSync(weeklyIndex, `# 週次インデックス（Mon-Sun）\n\n${add}`);
  } else {
    fs.appendFileSync(weeklyIndex, add);
  }
}

function sanitizeSlug(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// ざっくり言語推定（見た目用）
function guessLang(md = '') {
  const jp = /[一-龠ぁ-んァ-ヶ]/.test(md);
  const en = /[a-zA-Z]/.test(md);
  if (jp && en) return 'mixed';
  if (jp) return 'ja';
  if (en) return 'en';
  return '';
}

function guessTags(host = '') {
  if (/arxiv\.org/.test(host)) return ['Paper'];
  if (/huggingface/.test(host)) return ['HuggingFace','OSS'];
  if (/openai\.com/.test(host)) return ['OpenAI'];
  if (/deepmind|google/.test(host)) return ['Google'];
  return [];
}
