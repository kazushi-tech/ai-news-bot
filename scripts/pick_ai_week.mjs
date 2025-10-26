#!/usr/bin/env node
// RSS → AI関連をスコアリングして sources/url_inbox.md に "- [ ] URL" を追記
// Node >= 20（v24 推奨）。依存: fast-xml-parser

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { XMLParser } from 'fast-xml-parser';

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
const DAYS = Number(getFlag('days', 7));
const LIMIT = Number(getFlag('limit', 20));
const DRY = argv.includes('--dry-run');
const UA = getFlag('ua', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36');
const TIMEOUT_MS = Number(getFlag('timeout', 12000));

// ---------------- Paths ----------------
const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'sources');
const INBOX = path.join(SRC_DIR, 'url_inbox.md');

// ---------------- Feeds ----------------
// Paywall/403が多い媒体は一部コメントアウト済み。必要に応じて追加してください。
const FEEDS = [
  // 日本語メディア
  'https://gigazine.net/news/rss_2.0/',
  'https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml',
  'https://japan.cnet.com/rss/index.rdf',
  'https://japan.techcrunch.com/feed/',
  'https://wired.jp/rssfeeder/',
  'https://ascii.jp/rss.xml',
  // 英語メディア
  'https://feeds.arstechnica.com/arstechnica/technology-lab',
  'https://www.theverge.com/rss/index.xml',
  'https://www.cnbc.com/id/19854910/device/rss/rss.html',
  'https://techcrunch.com/feed/',
];

// ---------------- Keyword & scoring ----------------
const KEYWORDS = [
  'AI','人工知能','生成','生成AI','LLM','GPT','Transformer','RAG','拡張','推論','微調整','ファインチューニング',
  'OpenAI','ChatGPT','o1','o3','Sora','Anthropic','Claude','Google','Gemini','DeepMind','Microsoft','Copilot',
  'Meta','Llama','NVIDIA','GPU','H100','B200','TPU','Apple','Amazon',
  'MMLU','ベンチマーク','モデル','推論最適化','量子化','蒸留','政策','規制','著作権','著作物','訴訟','法廷'
];

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '', trimValues: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchText(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA }, signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

function normUrl(u){
  try { const x = new URL(u); x.hash = ''; return x.toString(); } catch { return u; }
}

function parseFeed(xml, url){
  const j = parser.parse(xml);
  // RSS 2.0
  const rssItems = j?.rss?.channel?.item || [];
  // Atom
  const atomItems = j?.feed?.entry || [];
  const items = (Array.isArray(rssItems) ? rssItems : [rssItems]).filter(Boolean).map(i => ({
    title: i.title, link: i.link?.href || i.link, description: i.description || i['content:encoded'], pubDate: i.pubDate, categories: i.category,
  }));
  const itemsA = (Array.isArray(atomItems) ? atomItems : [atomItems]).filter(Boolean).map(i => ({
    title: i.title, link: (Array.isArray(i.link) ? i.link[0]?.href : i.link?.href) || i.link, description: i.summary || i.content, pubDate: i.updated || i.published, categories: i.category,
  }));
  return items.concat(itemsA).map(it => ({ ...it, feed: url }));
}

function score(item){
  const t = `${item.title ?? ''} ${item.description ?? ''}`.toLowerCase();
  let s = 0;
  for (const k of KEYWORDS){ if (t.includes(k.toLowerCase())) s += (k.length > 4 ? 3 : 2); }
  // タイトルに AI/LLM など強ヒットを加点
  for (const k of ['ai','llm','gpt','生成','人工知能']){ if ((item.title||'').toLowerCase().includes(k)) s += 4; }
  // 新しさボーナス/古さペナルティ（DAYS を使って範囲外を軽く減点）
  const ageDays = (()=>{ try{ return (Date.now() - new Date(item.pubDate).getTime())/86400000 }catch{ return 7 }})();
  if (Number.isFinite(ageDays)) {
    s += Math.max(0, 7 - ageDays);
    if (ageDays > DAYS) s -= 2;
  }
  return s;
}

async function main(){
  // ensure dirs
  fs.mkdirSync(SRC_DIR, { recursive: true });
  if (!fs.existsSync(INBOX)) fs.writeFileSync(INBOX, '');

  const existing = new Set(
    fs.readFileSync(INBOX, 'utf8')
      .split(/\r?\n/)
      .map(l => {
        const m = l.match(/https?:\S+/);
        if (!m) return null;
        const u = m[0].replace(/#.*$/, '');
        return normUrl(u);
      })
      .filter(Boolean)
  );

  const collected = [];
  for (const f of FEEDS){
    try{
      const xml = await fetchText(f);
      const items = parseFeed(xml, f);
      for (const it of items){
        if (!it.link) continue;
        const url = normUrl(it.link);
        if (existing.has(url)) continue;
        collected.push({ ...it, url });
      }
      await sleep(250);
    }catch(e){
      console.error('[feed error]', f, e.message);
    }
  }

  // スコア→重複排除（titleの粗い重複も回避）
  const seenTitle = new Set();
  const uniq = [];
  for (const it of collected){
    const k = (it.title||'').trim().toLowerCase().replace(/\s+/g,' ');
    if (seenTitle.has(k)) continue;
    seenTitle.add(k);
    uniq.push({ ...it, _score: score(it) });
  }

  uniq.sort((a,b)=> b._score - a._score);
  const pick = uniq.slice(0, LIMIT);

  if (DRY){
    console.log(`(dry-run) would append ${pick.length} URLs to sources/url_inbox.md`);
    for (const p of pick){ console.log('-', p.title, '\n  ', p.url); }
    return;
  }

  const lines = fs.readFileSync(INBOX, 'utf8').split(/\r?\n/);
  for (const p of pick){
    lines.push(`- [ ] ${p.url}`);
  }
  fs.writeFileSync(INBOX, lines.join('\n'));
  console.log(`Appended ${pick.length} URL(s) to sources/url_inbox.md`);
}

main().catch(e=>{ console.error(e); process.exit(1); });