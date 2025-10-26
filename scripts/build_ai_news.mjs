#!/usr/bin/env node
// inbox の未処理URLを本文抽出→要約→詳細(news/YYYY-MM-DD-*.md)＋一覧(news/YYYY-MM-DD--AI-news.md)を生成
// 依存: jsdom, @mozilla/readability

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------- CLI flags ----------------
const argv = process.argv.slice(2);
const getFlag = (name, dflt = undefined) => {
  const idx = argv.findIndex(a => a === `--${name}` || a.startsWith(`--${name}=`));
  if (idx === -1) return dflt;
  const v = argv[idx].includes('=') ? argv[idx].split('=')[1] : argv[idx + 1];
  if (v === undefined || v.startsWith('--')) return dflt;
  return v;
};
const MAX = Number(getFlag('max', 2));
const DRY = argv.includes('--dry-run');
const UA = getFlag('ua', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36');
const TIMEOUT_MS = Number(getFlag('timeout', 15000));
const JP_COLUMNS = argv.includes('--jp-columns');
const DATE_OVERRIDE = getFlag('date'); // YYYY-MM-DD 固定日付で出力したいとき
const SAVE_FULLTEXT = argv.includes('--save-fulltext'); // 配信者スタイル：本文テキストも保存

// ---------------- Paths ----------------
const ROOT = process.cwd();
const VAULT_DIR = process.env.VAULT_DIR || '';
const OUT_BASE = VAULT_DIR && fs.existsSync(VAULT_DIR) ? VAULT_DIR : ROOT;
const NEWS_DIR = path.join(OUT_BASE, 'news');
const SRC_DIR = path.join(ROOT, 'sources'); // inbox はリポジトリ側を使う
const CACHE_DIR = path.join(ROOT, '.cache');
const INBOX = path.join(SRC_DIR, 'url_inbox.md');
const SEEN = path.join(CACHE_DIR, 'seen.json');

fs.mkdirSync(NEWS_DIR, { recursive: true });
fs.mkdirSync(CACHE_DIR, { recursive: true });
if (!fs.existsSync(INBOX)) fs.writeFileSync(INBOX, '');
if (!fs.existsSync(SEEN)) fs.writeFileSync(SEEN, '{}');

// ---------------- Utils ----------------
function toJstDate(d=new Date()){
  const tz = 'Asia/Tokyo';
  const pad = n => String(n).padStart(2,'0');
  const dt = new Date(d.toLocaleString('en-US', { timeZone: tz }));
  const y = dt.getFullYear();
  const m = pad(dt.getMonth()+1);
  const da = pad(dt.getDate());
  const h = pad(dt.getHours());
  const mi = pad(dt.getMinutes());
  return { ymd: `${y}-${m}-${da}`, hm: `${h}:${mi}`, js: dt };
}

function slugify(s){
  return (s||'').toLowerCase().replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff\s-]/g,'')
    .replace(/[\s_]+/g,'-').replace(/-+/g,'-').slice(0,80) || 'article';
}

function estReadingMin(text){
  const chars = (text||'').replace(/\s+/g,'').length;
  return Math.max(1, Math.round(chars / 600));
}

function pickTags(text, url){
  const t = `${text} ${url}`.toLowerCase();
  const tags = new Set();
  const addIf = (cond, tag) => { if (cond) tags.add(tag); };
  addIf(/openai|chatgpt|sora|o1\b|o3\b/.test(t), 'openai');
  addIf(/google|gemini|deepmind/.test(t), 'google');
  addIf(/meta|llama/.test(t), 'meta');
  addIf(/nvidia|gpu|h100|b200|sm_/.test(t), 'nvidia');
  addIf(/anthropic|claude/.test(t), 'anthropic');
  addIf(/microsoft|copilot/.test(t), 'microsoft');
  addIf(/benchmark|mmlu|arena|eval|ベンチ/.test(t), 'benchmark');
  addIf(/微調整|fine[- ]?tune|蒸留|distill/.test(t), 'finetune');
  addIf(/推論|inference|最適化|量子化|quant/.test(t), 'inference');
  addIf(/政策|規制|著作|copyright|lawsuit|訴訟/.test(t), 'policy');
  addIf(/japan|\.jp\b|日本|国内/.test(t), 'japan');
  addIf(/us\b|america|米国/.test(t), 'us');
  addIf(/eu\b|europe|欧州/.test(t), 'eu');
  return Array.from(tags);
}

function splitSentences(text){
  if (!text) return [];
  const parts = text
    .replace(/\s+/g,' ')
    .split(/(?<=[。．！？!?])\s+|(?<=[.?!])\s+(?=[A-Z0-9])/g);
  return parts.map(s => s.trim()).filter(Boolean);
}

function extractSummary(text){
  const sents = splitSentences(text);
  const first = sents[0] || '';
  const hasNumber = sents.filter(s => /\d[\d,]*(?:\.\d+)?%?|億|万/.test(s)).slice(0,4);
  const keywordSents = sents.filter(s => /(LLM|GPT|AI|生成|推論|微調整|OpenAI|Google|Meta|NVIDIA|Anthropic|Claude|Gemini|Llama|Copilot|MMLU)/i.test(s)).slice(0,6);
  const bullets = Array.from(new Set([first, ...hasNumber, ...keywordSents]))
    .filter(Boolean)
    .slice(0,6);
  const tldr = bullets.join(' ').slice(0, 220);
  return { tldr, bullets };
}

async function fetchHtml(url){
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow', signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    return { html, finalUrl: res.url || url };
  } finally { clearTimeout(t); }
}

function extractMeta(doc){
  const get = sel => doc.querySelector(sel)?.getAttribute('content') || '';
  const title = doc.querySelector('title')?.textContent?.trim() || get('meta[property="og:title"],meta[name="twitter:title"]') || '';
  const site_name = get('meta[property="og:site_name"]');
  const published = get('meta[property="article:published_time"],meta[name="date"],meta[itemprop="datePublished"]') || '';
  return { title, site_name, published_at: published };
}

function markdownEscape(s=''){ return s.replace(/[\[\]<>]/g, m => ({'[':'\\[',']':'\\]','<':'&lt;','>':'&gt;'}[m])); }

async function processUrl(url, dateStr){
  const { html, finalUrl } = await fetchHtml(url);
  const dom = new JSDOM(html, { url: finalUrl });
  const doc = dom.window.document;
  const reader = new Readability(doc);
  const article = reader.parse();
  const meta = extractMeta(doc);
  const text = (article?.textContent || '').trim();
  const contentHtml = article?.content || '';
  const title = meta.title || article?.title || (new URL(finalUrl)).hostname;
  const domain = (new URL(finalUrl)).hostname.replace(/^www\./,'');
  const tags = pickTags(text, finalUrl);
  const { tldr, bullets } = extractSummary(text);
  const word_count = text.replace(/\s+/g,' ').split(' ').length + Math.round(text.length/2);
  const reading_min = estReadingMin(text);
  const site_name = meta.site_name || domain;
  const fetched_at = new Date().toISOString();
  const published_at = meta.published_at || '';

  // ファイル名・戻りリンク
  const slug = slugify(title) || slugify(domain);
  const detailName = `${dateStr}-${slug}.md`;
  const detailPath = path.join(NEWS_DIR, detailName);
  const indexName = `${dateStr}--AI-news.md`;
  const indexPath = path.join(NEWS_DIR, indexName);

  const front = [
    '---',
    `title: "${markdownEscape(title)}"`,
    `date: ${dateStr}`,
    `source_url: ${finalUrl}`,
    `domain: ${domain}`,
    'publish: true',
    `tags: [${tags.join(', ')}]`,
    `word_count: ${word_count}`,
    `reading_min: ${reading_min}`,
    `fetched_at: ${fetched_at}`,
    `published_at: "${published_at}"`,
    `site_name: "${markdownEscape(site_name)}"`,
    '---',
  ].join('\n');

  const fullTextBlock = SAVE_FULLTEXT
    ? `\n## Full text (extracted)\n\n${text}\n`
    : '';

  const md = `${front}\n\n## TL;DR\n\n${tldr}\n\n## Key points\n\n${bullets.map(b => `- ${b}`).join('\n')}\n${fullTextBlock}\n## Source\n\n[${markdownEscape(site_name)}](${finalUrl})\n\n## 戻りリンク\n\n← [[${indexName}]]\n`;

  return { detailName, detailPath, indexName, indexPath, title, domain, tags, tldr, md, finalUrl };
}

function ensureIndex(indexPath, dateStr){
  if (fs.existsSync(indexPath)) return;
  const headers = JP_COLUMNS ? ['タイトル','記事','引用元','要約'] : ['Time','Title','Source','Tags'];
  const front = [
    '---',
    `title: "${dateStr} AI News"`,
    `date: ${dateStr}`,
    'publish: true',
    '---',
  ].join('\n');
  const body = `\n| ${headers.join(' | ')} |\n| --- | --- | --- | --- |\n`;
  fs.writeFileSync(indexPath, `${front}\n${body}`);
}

function appendIndexRow({ indexPath, hm, detailName, title, domain, tags, tldr, finalUrl }){
  const row = JP_COLUMNS
    ? `| [[${detailName}|${markdownEscape(title)}]] | [[${detailName}|詳細]] | [${domain}](${finalUrl}) | ${markdownEscape(tldr.slice(0,120))} |\n`
    : `| ${hm} | [[${detailName}|${markdownEscape(title)}]] | [${domain}](https://${domain}) | ${tags.join(', ')} |\n`;
  fs.appendFileSync(indexPath, row);
}

async function main(){
  const seen = JSON.parse(fs.readFileSync(SEEN, 'utf8') || '{}');
  const inboxLines = fs.readFileSync(INBOX, 'utf8').split(/\r?\n/);
  const uncheckedIdxs = [];
  for (let i=0;i<inboxLines.length;i++){
    const m = inboxLines[i].match(/^\s*- \[ \] (https?:\S+)/);
    if (m) uncheckedIdxs.push([i, m[1]]);
  }
  if (uncheckedIdxs.length === 0){
    console.log('No unchecked URLs found in sources/url_inbox.md');
    return;
  }

  const baseDate = DATE_OVERRIDE ? new Date(`${DATE_OVERRIDE}T00:00:00+09:00`) : new Date();
  const { ymd } = toJstDate(baseDate);

  let processed = 0;
  for (const [lineIdx, url] of uncheckedIdxs){
    if (processed >= MAX) break;
    if (seen[url]) continue; // duplicate skip

    try{
      const res = await processUrl(url, ymd);
      if (!DRY){
        ensureIndex(res.indexPath, ymd);
        fs.writeFileSync(res.detailPath, res.md);
        const { hm: nowHm } = toJstDate();
        appendIndexRow({ indexPath: res.indexPath, hm: nowHm, detailName: res.detailName, title: res.title, domain: res.domain, tags: res.tags, tldr: res.tldr, finalUrl: res.finalUrl });
        // inbox行を [x] に
        inboxLines[lineIdx] = inboxLines[lineIdx].replace('- [ ]', '- [x]');
        seen[url] = { date: new Date().toISOString(), detail: res.detailName };
      }
      console.log('OK:', res.title);
      processed++;
    }catch(e){
      console.error('FAIL:', url, e.message);
    }
  }

  if (!DRY){
    fs.writeFileSync(INBOX, inboxLines.join('\n'));
    fs.writeFileSync(SEEN, JSON.stringify(seen, null, 2));
  }

  console.log(`Processed ${processed} item(s).`);
}

main().catch(e=>{ console.error(e); process.exit(1); });