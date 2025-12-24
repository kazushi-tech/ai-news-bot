// scripts/doctor_remove_disclaimers.mjs
// 記事本文中の「免責文」「モデル説明」的なパラグラフを削除する doctor スクリプト。
// --dry-run オプションで書き込みなしプレビューが可能。

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import matter from 'gray-matter';

const LOG_PREFIX = '[doctor-disclaimers]';
const DRY_RUN = process.argv.includes('--dry-run');

const DISCLAIMER_PATTERNS = [
  /本要約は/,
  /スクレイピング済みテキスト/,
  /この記事の要約は/,
  /モデルは記事の全文/,
  /ご利用にあたっての注意/,
];

function getNewsRoot() {
  const root = process.env.NEWS_ROOT;
  if (!root) {
    console.error(`${LOG_PREFIX} ERROR: NEWS_ROOT env var is not set.`);
    process.exit(1);
  }
  return root;
}

function hasFrontmatter(text) {
  return text.trimStart().startsWith('---');
}

async function collectMarkdownFiles(dir) {
  const results = [];
  async function walk(current) {
    let entries;
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch (err) {
      console.error(`${LOG_PREFIX} ERROR: readdir failed for ${current}`, err);
      return;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        results.push(full);
      }
    }
  }
  await walk(dir);
  return results;
}

function removeDisclaimersFromContent(content) {
  // 「空行2つ以上」でパラグラフに分割
  const blocks = content.split(/\n{2,}/);
  const kept = [];
  let removedCount = 0;

  for (const block of blocks) {
    const isDisclaimer = DISCLAIMER_PATTERNS.some((re) => re.test(block));
    if (isDisclaimer) {
      removedCount++;
      continue;
    }
    kept.push(block);
  }

  let updated = kept.join('\n\n');
  // 空行を整理（3行以上連続を2行に圧縮）
  updated = updated.replace(/\n{3,}/g, '\n\n');

  return { updated, removedCount };
}

async function main() {
  const NEWS_ROOT = getNewsRoot();
  const ARTICLES_DIR = path.resolve(NEWS_ROOT, 'articles');

  console.log(`${LOG_PREFIX} NEWS_ROOT    = ${NEWS_ROOT}`);
  console.log(`${LOG_PREFIX} ARTICLES_DIR = ${ARTICLES_DIR}`);
  console.log(`${LOG_PREFIX} DRY_RUN      = ${DRY_RUN}`);

  const files = await collectMarkdownFiles(ARTICLES_DIR);
  console.log(`${LOG_PREFIX} markdown articles found: ${files.length}`);

  let touchedFiles = 0;
  let totalRemovedBlocks = 0;

  for (const filePath of files) {
    const rel = path.relative(NEWS_ROOT, filePath);

    let raw;
    try {
      raw = await fs.readFile(filePath, 'utf8');
    } catch (err) {
      console.error(`${LOG_PREFIX} ERROR: readFile failed for ${rel}`, err);
      continue;
    }

    if (!hasFrontmatter(raw)) {
      // 免責は基本「要約ノート」にしかない想定なので、frontmatterがなければスキップ
      console.warn(`${LOG_PREFIX} skip (no frontmatter): ${rel}`);
      continue;
    }

    let parsed;
    try {
      parsed = matter(raw);
    } catch (err) {
      console.error(`${LOG_PREFIX} YAML parse error in ${rel} — skip`, err.message);
      continue;
    }

    const { data, content } = parsed;

    const { updated, removedCount } = removeDisclaimersFromContent(content);

    if (removedCount === 0) {
      continue;
    }

    touchedFiles++;
    totalRemovedBlocks += removedCount;

    if (DRY_RUN) {
      console.log(
        `${LOG_PREFIX} would remove ${removedCount} disclaimer block(s) from: ${rel}`,
      );
      continue;
    }

    const next = matter.stringify(updated, data);

    try {
      await fs.writeFile(filePath, next, 'utf8');
    } catch (err) {
      console.error(`${LOG_PREFIX} ERROR: writeFile failed for ${rel}`, err);
      continue;
    }

    console.log(
      `${LOG_PREFIX} removed ${removedCount} disclaimer block(s) from: ${rel}`,
    );
  }

  console.log(
    `${LOG_PREFIX} done. files_touched=${touchedFiles}, blocks_removed=${totalRemovedBlocks}`,
  );
}

main().catch((err) => {
  console.error(`${LOG_PREFIX} fatal error:`, err);
  process.exit(1);
});
