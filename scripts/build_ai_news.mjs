// scripts/build_ai_news.mjs
// URL一覧（sources/url_inbox.md）から最大N件を処理し、Obsidian向けMarkdownをnews/へ生成します。
// 依存: jsdom, @mozilla/readability, node-fetch, iconv-lite, jschardet, minimist, dayjs, sanitize-filename, gray-matter, turndown

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import iconv from 'iconv-lite';
import jschardet from 'jschardet';
import minimist from 'minimist';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import he from 'he';
import TurndownService from 'turndown';
import crypto from 'crypto';
import matter from 'gray-matter';
import sanitize from 'sanitize-filename';

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = 'Asia/Tokyo';

const args = minimist(process.argv.slice(2), {
  boolean: ['jp-columns', 'save-fulltext'],
  alias: { max: 'm' },
  default: { max: 1 }
});

const ROOT_OUT = process.env.VAULT_DIR ? path.join(process.env.VAULT_DIR, 'news') : 'news';
const INBOX = 'sources/url_inbox.md';
const SEEN = '.cache/seen.json';

// Utilities
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function sha1(s) { return crypto.createHash('sha1').update(s).digest('hex'); }
function toDateSafe(s) {
  const d = dayjs(s);
  return d.isValid() ? d.tz(TZ).format() : null;
}
function splitSentencesJPEN(text) {
  // very simple JP/EN splitter
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];
  const parts = normalized
    .replace(/。/g, '。|')
    .replace(/！/g, '！|')
    .replace(/？/g, '？|')
    .replace(/\. /g, '.| ')
    .replace(/\? /g, '?| ')
    .replace(/! /g, '!| ')
    .split('|')
    .map(s => s.trim())
    .filter(Boolean);
  return parts;
}
function pickTopSentences(text, k = 5) {
  const sents = splitSentencesJPEN(text);
  if (sents.length === 0) return [];
  const keywords = [
    'AI','ＡＩ','生成','GenAI','LLM','モデル','学習','推論','発表','公開','オープンソース',
    'OSS','研究','論文','ベンチマーク','評価','API','API','GPU','NVIDIA','Google','OpenAI',
    'Anthropic','Meta','Apple','Microsoft','マイクロソフト','規制','政策','資金','買収','提携'
  ];
  const scored = sents.map((s, i) => {
    let score = 0;
    for (const kw of keywords) if (s.includes(kw)) score += 2;
    if (/\d+(\.\d+)?%/.test(s)) score += 1;
    if (/\b\d{4}\b/.test(s)) score += 1;
    if (s.length < 200) score += 0.5; // brevity
    return { s, score, i };
  });
  scored.sort((a,b)=> b.score - a.score || a.i - b.i);
  return scored.slice(0, k).map(x => x.s);
}

function guessEncodingFromMeta(html) {
  const m1 = html.match(/<meta[^>]*charset=["']?([^"'>\s]+)/i);
  if (m1) return m1[1];
  const m2 = html.match(/<meta[^>]*http-equiv=["']?content-type["']?[^>]*content=["'][^"']*charset=([^"'>\s]+)/i);
  if (m2) return m2[1];
  return null;
}

async function fetchDecoded(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'ai-news-bot/0.1 (+https://github.com)',
      'accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  let encoding = null;

  const ct = res.headers.get('content-type') || '';
  const m = ct.match(/charset=([^;]+)/i);
  if (m) encoding = m[1].trim();

  if (!encoding) {
    // Try meta sniff (fast path using UTF-8 decode first)
    try {
      const headText = buf.slice(0, 32768).toString('utf8');
      const metaEnc = guessEncodingFromMeta(headText);
      if (metaEnc) encoding = metaEnc;
    } catch {}
  }
  if (!encoding) {
    const det = jschardet.detect(buf);
    encoding = det?.encoding || 'utf-8';
  }

  const encNorm = encoding.toLowerCase().replace(/_/g,'-');
  const supported = ['utf-8','shift_jis','euc-jp','windows-31j','iso-2022-jp','gbk','gb2312','big5'];
  const use = supported.includes(encNorm) ? encNorm : (encNorm.startsWith('utf') ? 'utf-8' : 'windows-31j');

  const decoded = iconv.decode(buf, use);
  return { html: decoded, encodingUsed: use, headers: Object.fromEntries(res.headers) };
}

function extractMeta(document) {
  const q = (sel) => document.querySelector(sel)?.getAttribute('content') || null;
  const titleTag = document.querySelector('title')?.textContent?.trim() || null;
  const ogTitle = q('meta[property="og:title"]') || q('meta[name="twitter:title"]');
  const title = ogTitle || titleTag || '';
  const siteName = q('meta[property="og:site_name"]') || null;
  const description = q('meta[name="description"]') || q('meta[property="og:description"]') || null;
  const published = q('meta[property="article:published_time"]')
    || q('meta[name="date"]')
    || q('meta[name="pubdate"]')
    || q('meta[name="publish_date"]')
    || q('meta[name="DC.date.issued"]')
    || q('meta[property="article:modified_time"]')
    || null;
  return { title, siteName, description, published };
}

function createFrontmatter(fields) {
  const order = [
    'publish','title','date','source_url','domain','tags','word_count','reading_min',
    'fetched_at','published_at','site_name','encoding_used'
  ];
  const lines = ['---'];
  for (const k of order) {
    if (fields[k] === undefined) continue;
    const v = fields[k];
    if (Array.isArray(v)) {
      lines.push(`${k}:`);
      for (const x of v) lines.push(`  - "${String(x).replace(/"/g, '\\"')}"`);
    } else {
      const val = String(v).replace(/"/g, '\\"');
      lines.push(`${k}: "${val}"`);
    }
  }
  lines.push('---','');
  return lines.join('\n');
}

function toSlug(str, max=80) {
  const s = he.decode(str).replace(/\s+/g,' ').trim().toLowerCase();
  const base = s
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf\- ]+/g,'')
    .replace(/ /g,'-')
    .replace(/-+/g,'-')
    .slice(0, max);
  return sanitize(base) || 'untitled';
}

function readingMinutesFromText(text) {
  // rough JP+EN: 800 JP chars/min or 200 wpm; choose larger time
  const chars = (text || '').replace(/\s+/g,'').length;
  const words = (text || '').trim().split(/\s+/).length;
  const jpMin = Math.max(1, Math.round(chars / 800));
  const enMin = Math.max(1, Math.round(words / 200));
  return Math.max(jpMin, enMin);
}

function shorten(str, n=240) {
  if (!str) return '';
  const s = str.replace(/\s+/g,' ').trim();
  if (s.length <= n) return s;
  return s.slice(0, n-1) + '…';
}

async function processUrl(url) {
  try {
    const { html, encodingUsed, headers } = await fetchDecoded(url);
    const dom = new JSDOM(html, { url });
    const meta = extractMeta(dom.window.document);
    const reader = new Readability(dom.window.document, { keepClasses: false });
    const article = reader.parse();

    const title = (meta.title || article?.title || 'Untitled').trim();
    const byline = article?.byline || '';
    const siteName = meta.siteName || dom.window.document.location.hostname;
    const text = (article?.textContent || '').trim();
    const length = text.length;
    const excerpt = meta.description || article?.excerpt || '';

    const domain = new URL(url).hostname;
    const publishedAt = meta.published ? toDateSafe(meta.published) : null;
    const fetchedAt = dayjs().tz(TZ).format();

    // summarize (rule-based)
    const bulletCandidates = pickTopSentences(text, 7);
    const bullets = bulletCandidates.slice(0, 5);
    const tldr = shorten(excerpt || bulletCandidates.slice(0, 3).join(' '), 300);

    // tags (heuristic)
    const lower = (title + ' ' + text).toLowerCase();
    const tags = [];
    if (/[^\w](llm|gpt|transformer|モデル|大規模言語|生成|genai)/i.test(lower)) tags.push('LLM');
    if (/(OSS|open source|オープンソース)/i.test(lower)) tags.push('OSS');
    if (/(arxiv|論文|paper|研究)/i.test(lower)) tags.push('Research');
    if (/(規制|policy|法|ガイドライン)/i.test(lower)) tags.push('Policy');
    if (/(benchmark|ベンチマーク|性能|スコア)/i.test(lower)) tags.push('Benchmark');
    if (!tags.length) tags.push('AI');

    // filenames
    const dateStr = dayjs().tz(TZ).format('YYYY-MM-DD');
    ensureDir(ROOT_OUT);
    const slug = toSlug(title);
    const hash = sha1(url).slice(0, 8);
    const detailName = `${dateStr}-${slug}-${hash}.md`;
    const detailPath = path.join(ROOT_OUT, detailName);

    // frontmatter
    const fm = createFrontmatter({
      publish: 'true',
      title,
      date: dateStr,
      source_url: url,
      domain,
      tags,
      word_count: String(text.split(/\s+/).length),
      reading_min: String(readingMinutesFromText(text)),
      fetched_at: fetchedAt,
      published_at: publishedAt || '',
      site_name: siteName,
      encoding_used: encodingUsed
    });

    const turndown = new TurndownService();
    const bodyMd = turndown.turndown(article?.content || '');

    const detailMd = [
      fm,
      `# ${title}`,
      byline ? `_by ${byline}_` : '',
      '',
      '## TL;DR',
      tldr,
      '',
      '## Key Points',
      ...bullets.map(b => `- ${b}`),
      '',
      '## Source',
      `[${siteName}](${url})`,
      ''
    ];

    if (args['save-fulltext']) {
      detailMd.push('## Full Text (extracted)\n');
      detailMd.push(bodyMd);
      detailMd.push('');
    }

    fs.writeFileSync(detailPath, detailMd.join('\n'), 'utf8');

    // update daily index
    const indexName = `${dateStr}--AI-news.md`;
    const indexPath = path.join(ROOT_OUT, indexName);
    const timeNow = dayjs().tz(TZ).format('HH:mm');
    let tableHeader;
    if (args['jp-columns']) {
      tableHeader = `| 時刻 | サイト | タイトル | TL;DR |\n|---|---|---|---|\n`;
    } else {
      tableHeader = `| Time | Site | Title | TL;DR |\n|---|---|---|---|\n`;
    }
    const row = `| ${timeNow} | ${siteName} | [${title}](${detailName}) | ${shorten(tldr, 160)} |`;

    if (!fs.existsSync(indexPath)) {
      fs.writeFileSync(indexPath, tableHeader + row + '\n', 'utf8');
    } else {
      const prev = fs.readFileSync(indexPath, 'utf8');
      // if header missing, add
      const next = (prev.includes('|---|---|---|---|') ? prev : (tableHeader + prev)) + row + '\n';
      fs.writeFileSync(indexPath, next, 'utf8');
    }

    return { ok: true, title, detailName };
  } catch (err) {
    return { ok: false, error: `${err}` };
  }
}

function parseInboxUrls(md) {
  const lines = md.split(/\r?\n/);
  const urls = [];
  const indices = [];
  const re = /^\s*-\s\[\s\]\s+(https?:\/\/\S+)/;
  lines.forEach((line, idx) => {
    const m = line.match(re);
    if (m) { urls.push(m[1]); indices.push(idx); }
  });
  return { lines, urls, indices };
}

function markProcessed(lines, idx) {
  // turn "- [ ]" to "- [x]"
  lines[idx] = lines[idx].replace('- [ ]', '- [x]');
  return lines;
}

async function main() {
  ensureDir(ROOT_OUT);
  const maxN = Number(args.max) || 1;
  const inbox = fs.existsSync(INBOX) ? fs.readFileSync(INBOX, 'utf8') : '';
  const { lines, urls, indices } = parseInboxUrls(inbox);

  if (!urls.length) {
    console.log('No pending URLs in sources/url_inbox.md');
    process.exit(0);
  }

  let processed = 0;
  for (let i = 0; i < urls.length && processed < maxN; i++) {
    const url = urls[i];
    const res = await processUrl(url);
    if (res.ok) {
      console.log(`OK: ${res.title}`);
      processed++;
      markProcessed(lines, indices[i]);
      // small delay to be polite
      await sleep(500);
    } else {
      console.log(`NG: ${url} -> ${res.error}`);
    }
  }

  fs.writeFileSync(INBOX, lines.join('\n'), 'utf8');
  console.log(`Processed ${processed} item(s).`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});