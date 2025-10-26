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
  if (v === undefined || (typeof v === 'string' && v.startsWith('--'))) return dflt;
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

// ---------------- Parser ----------------
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  trimValues: true,
  processEntities: true,
});

// ---------------- Utils ----------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 安全な文字列化（Object/undefined/null → "" を含め常に string）
const toStr = (v) => {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  // fast-xml-parser の #text パターンも拾う
  if (typeof v === 'object' && '#text' in v) return String(v['#text'] ?? '');
  return String(v);
};
const toLower = (v) => toStr(v).toLowerCase().trim();
const stripTags = (html) => toStr(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

// 追跡系クエリを除去（utm_* / fbclid / gclid / mc_* など）
function cleanUrl(u) {
  try {
    const x = new URL(u);
    const rm = new Set([
      'utm_source','utm_medium','utm_campaign','utm_term','utm_content','utm_name',
      'fbclid','gclid','mc_cid','mc_eid','ncid','yclid','ref','ref_src','ref_url'
    ]);
    [...x.searchParams.keys()].forEach(k => { if (rm.has(k) || k.startsWith('utm_')) x.searchParams.delete(k); });
    // #fragment は不要
    x.hash = '';
    return x.toString();
  } catch { return u; }
}
function normUrl(u) { return cleanUrl(u); }

// Fetch（UA/timeout付き）
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

// Feed parse（RSS/Atom両対応 + 相対URL補完）
function parseFeed(xml, feedUrl) {
  const j = parser.parse(xml);

  // RSS 2.0
  const rssItems = j?.rss?.channel?.item || [];
  // Atom
  const atomItems = j?.feed?.entry || [];

  const rss = (Array.isArray(rssItems) ? rssItems : [rssItems]).filter(Boolean).map(i => {
    const title = toStr(i.title);
    const desc = toStr(i.description || i['content:encoded']);
    const linkRaw = i.link?.href || i.link;
    const link = resolveLink(linkRaw, feedUrl);
    const pubDate = i.pubDate;
    const categories = i.category;
    return { title, link, description: desc, pubDate, categories, feed: feedUrl };
  });

  const atom = (Array.isArray(atomItems) ? atomItems : [atomItems]).filter(Boolean).map(i => {
    const title = toStr(i.title);
    const desc = toStr(i.summary || i.content);
    let linkRaw = null;
    if (Array.isArray(i.link)) {
      // rel="alternate" 優先
      const alt = i.link.find(l => (l.rel ?? 'alternate') === 'alternate') || i.link[0];
      linkRaw = alt?.href ?? alt;
    } else {
      linkRaw = i.link?.href || i.link;
    }
    const link = resolveLink(linkRaw, feedUrl);
    const pubDate = i.updated || i.published;
    const categories = i.category;
    return { title, link, description: desc, pubDate, categories, feed: feedUrl };
  });

  return rss.concat(atom);
}

function resolveLink(linkRaw, base) {
  const s = toStr(linkRaw).trim();
  if (!s) return '';
  try { return new URL(s, base).toString(); } catch { return s; }
}

// スコアリング（String() 正規化 + HTML除去）
function score(item) {
  const title = toStr(item.title);
  const desc = stripTags(item.description);
  const t = `${title} ${desc}`.toLowerCase();

  let s = 0;
  for (const k of KEYWORDS) {
    if (t.includes(k.toLowerCase())) s += (k.length > 4 ? 3 : 2);
  }
  // タイトル強ヒット
  for (const k of ['ai', 'llm', 'gpt', '生成', '人工知能']) {
    if (toLower(title).includes(k)) s += 4;
  }
  // 新しさ
  const ageDays = (() => {
    try { return (Date.now() - new Date(item.pubDate).getTime()) / 86400000; } catch { return 7; }
  })();
  if (Number.isFinite(ageDays)) {
    s += Math.max(0, 7 - ageDays);
    if (ageDays > DAYS) s -= 2;
  }
  // 大手テック媒体の微加点（任意）
  const host = (() => { try { return new URL(item.link).host; } catch { return ''; } })();
  if (/theverge\.com|techcrunch\.com|arstechnica\.com|cnbc\.com|wired\.jp|ascii\.jp|gigazine\.net|itmedia\.co\.jp|cnet\.com/.test(host)) s += 1;

  return s;
}

// ---------------- Main ----------------
async function main() {
  // ensure dirs
  fs.mkdirSync(SRC_DIR, { recursive: true });
  if (!fs.existsSync(INBOX)) fs.writeFileSync(INBOX, '');

  // 既存URL（正規化済み）をロード
  const existing = new Set(
    fs.readFileSync(INBOX, 'utf8')
      .split(/\r?\n/)
      .map(l => {
        const m = l.match(/https?:\S+/);
        if (!m) return null;
        return normUrl(m[0]);
      })
      .filter(Boolean)
  );

  const collected = [];
  for (const f of FEEDS) {
    try {
      const xml = await fetchText(f);
      const items = parseFeed(xml, f);
      for (const it of items) {
        const url = normUrl(it.link);
        if (!url) continue;
        if (existing.has(url)) continue;
        collected.push({ ...it, url });
      }
      await sleep(250);
    } catch (e) {
      console.error('[feed error]', f, e.message || String(e));
    }
  }

  // 重複排除（URL / タイトルを正規化して判定）
  const seenUrl = new Set();
  const seenTitle = new Set();
  const uniq = [];

  for (const it of collected) {
    const kUrl = normUrl(it.url);
    if (seenUrl.has(kUrl)) continue;

    const kTitle = toLower(it.title).replace(/\s+/g, ' ').slice(0, 180);
    if (seenTitle.has(kTitle)) continue;

    seenUrl.add(kUrl);
    seenTitle.add(kTitle);

    uniq.push({ ...it, _score: score(it) });
  }

  // ソート & ピック
  uniq.sort((a, b) => b._score - a._score);
  const pick = uniq.slice(0, LIMIT);

  if (DRY) {
    console.log(`(dry-run) would append ${pick.length} URL(s) to sources/url_inbox.md`);
    for (const p of pick) {
      console.log('-', toStr(p.title) || '(no title)');
      console.log('  ', p.url);
    }
    return;
  }

  // 追記
  const lines = fs.readFileSync(INBOX, 'utf8').split(/\r?\n/);
  for (const p of pick) {
    lines.push(`- [ ] ${p.url}`);
  }
  // 末尾に改行を保証
  const out = lines.join('\n').replace(/\s*$/, '') + '\n';
  fs.writeFileSync(INBOX, out, 'utf8');

  console.log(`Appended ${pick.length} URL(s) to sources/url_inbox.md`);
}

main().catch(e => { console.error(e); process.exit(1); });
