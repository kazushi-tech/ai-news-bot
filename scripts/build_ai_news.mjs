import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import Parser from 'rss-parser';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { markdownTable } from 'markdown-table';
import stringSim from 'string-similarity';
import { summarizeLocal } from '../lib/summarize.mjs';
import { toJST, formatYMD, fetchFulltext, htmlToMd } from '../lib/utils.mjs';

dayjs.extend(utc); dayjs.extend(timezone);

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
const sinceDays = getFlag('--since-days', 7);

function hasFlag(n){ return argv.includes(n); }
function getFlag(n,d){ const i=argv.indexOf(n); return i>=0 ? Number(argv[i+1]) : d; }

const now = toJST(new Date());
const dateStr = formatYMD(now);

const sources = fs.readFileSync(path.join(ROOT, 'sources/rss.txt'),'utf8')
  .split('\n').map(s=>s.trim()).filter(s=>s && !s.startsWith('#'));

const entries = [];
for (const url of sources) {
  try {
    const feed = await parser.parseURL(url);
    for (const item of feed.items || []) {
      const pub = item.isoDate ? new Date(item.isoDate) : new Date();
      const age = (Date.now() - pub.getTime())/86400000;
      if (age > sinceDays) continue;
      const link = item.link || '';
      entries.push({
        title: item.title || '',
        url: link,
        source: new URL(link || feed.link || url).hostname,
        publishedAt: pub
      });
    }
  } catch(e){ console.warn('RSS error:', url, e.message); }
}

// URL正規化 → URLユニーク → タイトル類似で重複除去
const byUrl = new Map();
for (const it of entries) {
  const nu = normalizeUrl(it.url);
  if (!byUrl.has(nu)) byUrl.set(nu, { ...it, nu });
}
const uniqByUrl = [...byUrl.values()];
const uniq = dedupeByTitle(uniqByUrl, 0.9).slice(0, MAX);

const processed = [];
for (const item of uniq) {
  try {
    const { title: t2, content } = await fetchFulltext(item.url);
    const md = htmlToMd(content);
    const title = item.title || t2 || '(無題)';
    const summary = summarizeLocal(md);

    const slug = sanitizeSlug(title);
    const articlePath = path.join(NEWS_DIR, `${dateStr}--${slug}.md`);
    fs.writeFileSync(articlePath, renderArticle({ title, url: item.url, date: now, summary, md }));
    if (SAVE_FULL) fs.writeFileSync(path.join(FULL_DIR, `${slug}.md`), `# ${title}\n\n${md}`);

    processed.push({ title, url: item.url, source: item.source, summary, articlePath, publishedAt: item.publishedAt });
  } catch(e){ console.warn('build item error:', item.url, e.message); }
}

const dailyFile = path.join(NEWS_DIR, `${dateStr}--AI-news.md`);
if (USE_JP_COLUMNS) {
  const table = markdownTable(
    [['タイトル','記事','引用元','要約'],
     ...processed.map(r => [
       `[${r.title}](${r.url})`,
       `[記事ページへ](${path.basename(r.articlePath)})`,
       `[引用元へ](${r.url})`,
       r.summary || '—'
     ])],
    { align: ['l','c','c','l'] }
  );
  const header = `# ${formatYMD(now)} - AIニュース`;
  fs.writeFileSync(dailyFile, `${header}\n\n${table}\n`);
} else {
  fs.writeFileSync(dailyFile, `# ${formatYMD(now)} - AI News\n\n(日本語カラムを使うには --jp-columns を付けてください)\n`);
}

console.log(`OK: ${processed[0]?.title || '-'} / Processed ${processed.length} item(s.)`);

// helpers
function normalizeUrl(u){
  try {
    const url = new URL(u);
    url.hash = '';
    const bad = ['utm_','gclid','fbclid','igshid','mc_','ref','ref_src','spm'];
    for (const k of [...url.searchParams.keys()]) if (bad.some(b => k.startsWith(b))) url.searchParams.delete(k);
    url.pathname = url.pathname.replace(/\/+$/,'');
    return url.toString();
  } catch { return u; }
}
function dedupeByTitle(items, thr=0.9){
  const res=[]; const k=v=>(v||'').toLowerCase().replace(/\s+/g,' ').trim();
  for (const it of items){
    const hit = res.find(r => stringSim.compareTwoStrings(k(r.title), k(it.title)) >= thr);
    if (!hit) res.push(it);
  }
  return res;
}
function sanitizeSlug(s){
  return (s||'').toLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu,'-').replace(/^-+|-+$/g,'').slice(0,80);
}
function renderArticle({ title, url, date, summary, md }){
  const ymd = formatYMD(date);
  return `# ${title}

プロパティ  
- **リンク**: ${url}  
- **日付**: ${ymd}  

## 引用元
${url}

## 要約
${summary}

## 詳細レポート
${md}
`;
}