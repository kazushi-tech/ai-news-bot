import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { markdownTable } from 'markdown-table';
import stringSim from 'string-similarity';
import { summarizeLocal } from '../lib/summarize.mjs';
import { toJST, formatYMD, fetchFulltext, htmlToMd } from '../lib/utils.mjs';

dayjs.extend(utc); dayjs.extend(timezone);

const ROOT = process.cwd();
const NEWS_DIR = path.join(ROOT, 'news');
const FULL_DIR = path.join(NEWS_DIR, 'fulltext');
const INBOX = path.join(ROOT, 'sources/url_inbox.md');
const SEEN = path.join(ROOT, '.cache/seen.json');

fs.mkdirSync(NEWS_DIR, { recursive: true });
fs.mkdirSync(FULL_DIR, { recursive: true });
fs.mkdirSync(path.dirname(SEEN), { recursive: true });

const argv = process.argv.slice(2);
const MAX = getFlag('--max', 1);
const SAVE_FULL = hasFlag('--save-fulltext');
const USE_JP_COLUMNS = hasFlag('--jp-columns');

function hasFlag(n){ return argv.includes(n); }
function getFlag(n, d){ const i=argv.indexOf(n); return i>=0 ? Number(argv[i+1]) : d; }

const now = toJST(new Date());
const dateStr = formatYMD(now);

const inboxText = fs.existsSync(INBOX) ? fs.readFileSync(INBOX,'utf8') : '';
const urls = [];
for (const line of inboxText.split('\n')) {
  const m = line.match(/^- \[ \] (https?:\/\/\S+)/);
  if (m) urls.push(m[1]);
}

const seen = loadSeen();
const picked = [];
for (const u of urls) {
  const nu = normalizeUrl(u);
  if (seen.has(nu)) continue;
  if (!picked.find(x => x.nu === nu)) picked.push({ url: u, nu });
  if (picked.length >= MAX) break;
}
if (picked.length === 0) {
  console.log('No new URL in inbox.');
  process.exit(0);
}

const processed = [];
for (const { url, nu } of picked) {
  try {
    const { title: t2, content } = await fetchFulltext(url);
    const md = htmlToMd(content);
    const title = t2 || url;

    const summary = summarizeLocal(md);

    const slug = sanitizeSlug(title);
    const articlePath = path.join(NEWS_DIR, `${dateStr}--${slug}.md`);
    fs.writeFileSync(articlePath, renderArticle({ title, url, date: now, summary, md }));

    if (SAVE_FULL) fs.writeFileSync(path.join(FULL_DIR, `${slug}.md`), `# ${title}\n\n${md}`);

    processed.push({ title, url, source: new URL(url).hostname, summary, articlePath, publishedAt: now, nu });
    seen.add(nu);
  } catch (e) {
    console.warn('clip build error:', url, e.message);
  }
}

const unique = dedupeByTitle(processed, 0.9);

const dailyFile = path.join(NEWS_DIR, `${dateStr}--AI-news.md`);
if (USE_JP_COLUMNS) {
  const headerJP = ['タイトル','記事','引用元','要約'];
  const rows = unique.map(r => [
    `[${r.title}](${r.url})`,
    `[記事ページへ](${path.basename(r.articlePath)})`,
    `[引用元へ](${r.url})`,
    r.summary || '—'
  ]);
  const table = markdownTable([headerJP, ...rows], { align: ['l','c','c','l'] });

  const todayH1 = `# ${formatYMD(now)} - AIニュース`;
  let mergedRows = [];
  if (fs.existsSync(dailyFile)) {
    const old = fs.readFileSync(dailyFile,'utf8').split('\n');
    const start = old.findIndex(l => /^\|\s*タイトル\s*\|\s*記事\s*\|\s*引用元\s*\|\s*要約\s*\|/.test(l));
    if (start !== -1) {
      for (let i=start+2;i<old.length;i++){
        const ln = old[i]; if (!ln.startsWith('|')) break;
        mergedRows.push( ln.split('|').slice(1,-1).map(c=>c.trim()) );
      }
    }
  }
  const key = r => `${r[0]}@@${r[2]}`;
  const map = new Map(mergedRows.map(r=>[key(r), r]));
  for (const r of rows) map.set(key(r), r);
  mergedRows = [...map.values()];
  const mergedTable = markdownTable([headerJP, ...mergedRows], { align: ['l','c','c','l'] });
  fs.writeFileSync(dailyFile, `${todayH1}\n\n${mergedTable}\n`);
}

const newInbox = inboxText.replace(/^- \[ \] (https?:\/\/\S+)/gm, (m, u) => {
  return picked.find(x => x.url === u) ? `- [x] ${u}` : m;
});
fs.writeFileSync(INBOX, newInbox);
fs.writeFileSync(SEEN, JSON.stringify([...seen], null, 2));

console.log(`OK: ${unique[0]?.title || '-'} / Processed ${unique.length} item(s.)`);

function loadSeen(){
  try {
    const a = JSON.parse(fs.readFileSync(SEEN,'utf8'));
    return new Set(Array.isArray(a) ? a : []);
  } catch { return new Set(); }
}
function normalizeUrl(u){
  try {
    const url = new URL(u);
    url.hash = '';
    const bad = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid','igshid','mc_cid','mc_eid','ref','ref_src','spm'];
    for (const k of [...url.searchParams.keys()]) if (bad.some(b => k.startsWith(b))) url.searchParams.delete(k);
    url.pathname = url.pathname.replace(/\/+$/,'');
    return url.toString();
  } catch { return u; }
}
function dedupeByTitle(items, thr=0.9){
  const res = [];
  for (const it of items) {
    const k = key(it.title);
    const hit = res.find(r => stringSim.compareTwoStrings(key(r.title), k) >= thr);
    if (!hit) res.push(it);
  }
  return res;
  function key(t){ return (t||'').toLowerCase().replace(/\s+/g,' ').trim(); }
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
function sanitizeSlug(s){
  return (s||'').toLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu,'-').replace(/^-+|-+$/g,'').slice(0,80);
}