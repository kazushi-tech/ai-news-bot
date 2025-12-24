#!/usr/bin/env node
// scripts/doctor_title_autofill_from_h1.mjs

import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const DRY_RUN = process.argv.includes('--dry-run');

const NEWS_ROOT = process.env.NEWS_ROOT
  ? path.resolve(process.cwd(), process.env.NEWS_ROOT)
  : path.resolve(process.cwd(), '..', 'ai-news');

const ARTICLES_DIR = path.resolve(NEWS_ROOT, 'articles');

console.log(`[doctor-title-h1] NEWS_ROOT    = ${NEWS_ROOT}`);
console.log(`[doctor-title-h1] ARTICLES_DIR = ${ARTICLES_DIR}`);
console.log(`[doctor-title-h1] DRY_RUN      = ${DRY_RUN}`);

const BAD_TITLES = [
  '抽出ポイント',
  '抜粋ポイント',
  '重要な示唆',
  '重要なポイント',
  'リスク・未確定要素',
  'メモ',
  '概要',
  '要約',
  'まとめ',
];

async function main() {
  const entries = await fs.readdir(ARTICLES_DIR, { withFileTypes: true });
  const files = entries.filter(e => e.isFile() && e.name.endsWith('.md')).map(e => e.name);

  console.log(`[doctor-title-h1] markdown articles found: ${files.length}`);

  let touched = 0;

  for (const file of files) {
    const fullPath = path.join(ARTICLES_DIR, file);
    const raw = await fs.readFile(fullPath, 'utf8');

    let parsed;
    try {
      parsed = matter(raw);
    } catch (err) {
      console.warn(
        `[doctor-title-h1] YAML parse error in articles/${file} — skip ${err.message}`
      );
      continue;
    }

    const data = parsed.data ?? {};
    const currentTitle = data.title;

    if (!needsTitleFix(currentTitle)) {
      continue;
    }

    const h1 = findFirstGoodH1(parsed.content);
    if (!h1) {
      continue;
    }

    data.title = h1;
    touched++;
    console.log(
      `[doctor-title-h1] set title from H1 in articles/${file} -> "${h1}"`
    );

    if (!DRY_RUN) {
      const out = matter.stringify(parsed.content, data, { lineWidth: 0 });
      await fs.writeFile(fullPath, out, 'utf8');
    }
  }

  console.log(`[doctor-title-h1] done. files_touched=${touched}`);
}

function needsTitleFix(title) {
  if (!title) return true;
  const t = String(title).trim();
  if (!t) return true;

  // URL っぽい
  if (/^["']?https?:\/\//i.test(t)) return true;

  const normalized = t.replace(/[「」『』]/g, '').trim();

  if (BAD_TITLES.includes(normalized)) return true;

  // あまりに短くてメタっぽい見出し
  if (normalized.length <= 4 && /ポイント|示唆|概要|メモ|要約|まとめ/.test(normalized)) {
    return true;
  }

  return false;
}

function findFirstGoodH1(content) {
  const lines = content.split('\n');
  for (const line of lines) {
    const m = line.match(/^#\s+(.*)$/);
    if (!m) continue;
    const candidate = m[1].trim();
    const normalized = candidate.replace(/[「」『』]/g, '').trim();
    if (!candidate) continue;
    if (BAD_TITLES.includes(normalized)) continue;
    if (normalized.length <= 4 && /ポイント|示唆|概要|メモ|要約|まとめ/.test(normalized))
      continue;
    return candidate;
  }
  return null;
}

main().catch(err => {
  console.error('[doctor-title-h1] fatal error', err);
  process.exit(1);
});
