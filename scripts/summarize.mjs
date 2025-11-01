// scripts/summarize.mjs
// Node.js v20 以降（ESM）。追加の npm 依存は不要。

import fs from 'fs';
import path from 'path';

// --------- CLI 引数処理（--url でも 位置引数でもOK）---------
const args = process.argv.slice(2);
const idx = args.findIndex(a => a === '--url' || a === '-u');
const url = idx >= 0 ? args[idx + 1] : args[0];

if (!url) {
  console.error('Usage: node scripts/summarize.mjs --url <URL>  (or positional URL)');
  process.exit(1);
}
try {
  // URL 妥当性チェック（無効なら例外）
  new URL(url);
} catch {
  console.error(`Invalid URL: ${url}`);
  process.exit(1);
}

// --------- 取得＆要約っぽい処理（簡易）---------
function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(u) {
  return u
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

async function main() {
  console.log(`Fetching: ${url}`);
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  }
  const html = await res.text();
  const text = stripHtml(html);

  // ここでは超簡易的に頭から切り出し（本番はあなたの要約ロジックに置換）
  const excerpt = text.slice(0, 2000);
  const md = [
    `# Summary`,
    ``,
    `URL: ${url}`,
    ``,
    `## Extracted (truncated)`,
    ``,
    excerpt,
    ``,
  ].join('\n');

  // 出力
  const outDir = 'summary';
  fs.mkdirSync(outDir, { recursive: true });
  const base = slugify(url) || 'result';
  const mdPath = path.join(outDir, `${base}.md`);
  const htmlPath = path.join(outDir, `${base}.html`);

  fs.writeFileSync(mdPath, md);
  fs.writeFileSync(
    htmlPath,
    `<!doctype html><meta charset="utf-8"><title>Summary</title><pre>${escapeHtml(excerpt)}</pre>`
  );

  console.log(`Wrote: ${mdPath}`);
  console.log(`Wrote: ${htmlPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
