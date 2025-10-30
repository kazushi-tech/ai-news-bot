// quality gates
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ITEMS = path.join(ROOT, 'content/data/items.json');
const NEWS_DIR = path.join(ROOT, 'content/news');
const ARTICLES_DIR = path.join(ROOT, 'content/articles');

const items = JSON.parse(fs.readFileSync(ITEMS, 'utf8'));
const seen = new Set();
for (const it of items) {
  if (seen.has(it.url_hash)) throw new Error('Duplicate url_hash in items.json');
  seen.add(it.url_hash);
}

// 日本語っぽさ
const jp = /[一-鿐ぁ-んァ-ヶー]/;
for (const it of items) {
  if (!it.summary_ja) continue;
  if (!jp.test(it.summary_ja)) throw new Error(`summary_ja not Japanese-ish: ${it.slug}`);
}

// 記事ファイル重複なし
if (fs.existsSync(ARTICLES_DIR)) {
  const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'));
  if (files.length !== new Set(files).size) throw new Error('Duplicate article filenames');
}

// 日次のテーブル確認（緩め）
if (fs.existsSync(NEWS_DIR)) {
  for (const f of fs.readdirSync(NEWS_DIR).filter(f => f.endsWith('.md'))) {
    const t = fs.readFileSync(path.join(NEWS_DIR, f), 'utf8');
    if (!t.includes('| 時刻 | 記事 | 元URL |')) throw new Error(`${f}: table header missing`);
  }
}

console.log('validate: OK');
