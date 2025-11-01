// ingest.js - repository_dispatch と workflow_dispatch(--urls) の両対応
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { normalizeUrl } from './utils/url.js';
import { loadItems, saveItems, ensureFileDir, appendQueueLine } from './utils/store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../content/data');
const ITEMS_PATH = path.join(DATA_DIR, 'items.json');
const QUEUE_PATH = path.join(DATA_DIR, 'queue.jsonl');

ensureFileDir(ITEMS_PATH);
ensureFileDir(QUEUE_PATH);
if (!fs.existsSync(ITEMS_PATH)) fs.writeFileSync(ITEMS_PATH, '[]');

function parseUrls(arg) {
  if (!arg) return [];
  return String(arg).split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
}

// CLI --urls 取得
const i = process.argv.indexOf('--urls');
const urlsFromCli = i !== -1 ? parseUrls(process.argv[i + 1]) : [];

// queue.json からの読込（必要なら）

function sha1(s) { return crypto.createHash('sha1').update(s).digest('hex'); }
function uniq(a) { return [...new Set(a)]; }
function splitMaybe(s) { return String(s).split(/[,\s\n]+/).map(v => v.trim()).filter(Boolean); }
function extractUrlsFromAny(obj) {
  try {
    const s = JSON.stringify(obj);
    const m = s.match(/https?:\/\/[^\s"'<>()]+/g) || [];
    return uniq(m);
  } catch { return []; }
}

let urls = [];

// 1) repository_dispatch payload
const eventPath = process.env.GITHUB_EVENT_PATH;
try {
  if (eventPath && fs.existsSync(eventPath)) {
    const evt = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    const cp = evt?.client_payload ?? {};

    // よくある形：urls / url / text
    if (Array.isArray(cp.urls)) urls.push(...cp.urls);
    else if (cp.urls) urls.push(...splitMaybe(cp.urls));
    else if (cp.url) urls.push(...splitMaybe(cp.url));
    else if (cp.text) urls.push(...splitMaybe(cp.text));

    // それでも無ければ、payload全体を正規表現で総なめ抽出
    if (urls.length === 0) urls.push(...extractUrlsFromAny(cp));
  }
} catch { /* ignore */ }

// 2) workflow_dispatch の inputs.urls（--urls 経由）
const idx = process.argv.indexOf('--urls');
if (idx > -1) urls.push(...splitMaybe(process.argv.slice(idx + 1).join(' ')));

urls = uniq(urls).filter(Boolean);
if (urls.length === 0) {
  console.error('No URLs provided (client_payload.* or --urls).');
  process.exit(1);
}

const items = loadItems(ITEMS_PATH);
const byHash = new Map(items.map(i => [i.url_hash, i]));
let newCount = 0;

for (const raw of urls) {
  const url_norm = normalizeUrl(raw);
  const url_hash = sha1(url_norm);
  const now = new Date().toISOString();

  if (!byHash.has(url_hash)) {
    items.push({
      url_original: raw,
      url_norm,
      url_hash,
      slug: '',
      title_ja: '',
      summary_ja: '',
      key_points: [],
      lang: 'ja',
      created_at: now,
      last_seen: now,
      needs_rebuild: true
    });
    appendQueueLine(QUEUE_PATH, url_norm);
    newCount++;
  } else {
    byHash.get(url_hash).last_seen = now;
  }
}

saveItems(ITEMS_PATH, items);
console.log(JSON.stringify({ received: urls.length, new_items: newCount }, null, 2));
