// queue.jsonl を処理して記事生成
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatISO, format } from 'date-fns';
import { summarizeUrlJP } from './utils/dify.js';
import { loadItems, saveItems, ensureFileDir, readQueueLines, clearQueue } from './utils/store.js';
import { toAsciiSlug, ensureUniqueSlug } from './utils/slug.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'content/data');
const ARTICLES_DIR = path.join(ROOT, 'content/articles');
const NEWS_DIR = path.join(ROOT, 'content/news');
const ITEMS_PATH = path.join(DATA_DIR, 'items.json');
const QUEUE_PATH = path.join(DATA_DIR, 'queue.jsonl');

ensureFileDir(ARTICLES_DIR);
ensureFileDir(NEWS_DIR);

const queue = readQueueLines(QUEUE_PATH);
if (queue.length === 0) {
  console.log('Queue empty. Nothing to do.');
  process.exit(0);
}

const items = loadItems(ITEMS_PATH);
const existingSlugs = new Set(items.map(i => i.slug).filter(Boolean));
let built = 0;

for (const url of queue) {
  const item = items.find(i => i.url_norm === url);
  if (!item) continue;

  // Dify（日本語固定）
  let out = await summarizeUrlJP(url);
  if (out.lang && out.lang.toLowerCase() !== 'ja') {
    out = await summarizeUrlJP(url); // 1回だけリトライ
  }
  const { title_ja, summary_ja, key_points = [], lang = 'ja' } = out || {};
  if (!title_ja || !summary_ja) {
    item.needs_rebuild = true;
    item.last_seen = new Date().toISOString();
    continue;
  }

  const base = toAsciiSlug(title_ja);
  const slug = ensureUniqueSlug(base, existingSlugs);
  existingSlugs.add(slug);

  // 記事
  const articlePath = path.join(ARTICLES_DIR, `${slug}.md`);
  const nowISO = formatISO(new Date());
  const fm = [
    '---',
    `title: "${title_ja.replace(/"/g, '\\"')}"`,
    `slug: "${slug}"`,
    `date: "${nowISO}"`,
    `original_url: "${item.url_norm}"`,
    'lang: "ja"',
    '---'
  ].join('\n');

  const body = [
    fm,
    '',
    '## 要約',
    '',
    summary_ja.trim(),
    '',
    key_points.length ? '### キーポイント' : '',
    ...key_points.map(k => `- ${k}`),
    ''
  ].join('\n');

  fs.writeFileSync(articlePath, body, 'utf8');

  // 日次インデックス
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const newsPath = path.join(NEWS_DIR, `${dateStr}--AI-news.md`);
  if (!fs.existsSync(newsPath)) {
    const head = [
      `# AIニュース ${dateStr}`,
      '',
      '| 時刻 | 記事 | 元URL |',
      '|---|---|---|',
      ''
    ].join('\n');
    fs.writeFileSync(newsPath, head);
  }
  const hhmm = format(new Date(), 'HH:mm');
  fs.appendFileSync(newsPath, `| ${hhmm} | [${title_ja}](../articles/${slug}.md) | ${item.url_norm} |\n`);

  // items.json 更新
  item.title_ja = title_ja;
  item.summary_ja = summary_ja;
  item.key_points = key_points;
  item.lang = 'ja';
  item.slug = slug;
  item.needs_rebuild = false;
  item.last_seen = nowISO;

  built++;
}

saveItems(ITEMS_PATH, items);
clearQueue(QUEUE_PATH);
console.log(JSON.stringify({ built }, null, 2));
