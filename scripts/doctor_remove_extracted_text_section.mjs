#!/usr/bin/env node
// scripts/doctor_remove_extracted_text_section.mjs

import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const DRY_RUN = process.argv.includes('--dry-run');

const NEWS_ROOT = process.env.NEWS_ROOT
  ? path.resolve(process.cwd(), process.env.NEWS_ROOT)
  : path.resolve(process.cwd(), '..', 'ai-news');

const ARTICLES_DIR = path.resolve(NEWS_ROOT, 'articles');

console.log(`[doctor-extracted-text] NEWS_ROOT    = ${NEWS_ROOT}`);
console.log(`[doctor-extracted-text] ARTICLES_DIR = ${ARTICLES_DIR}`);
console.log(`[doctor-extracted-text] DRY_RUN      = ${DRY_RUN}`);

async function main() {
  const entries = await fs.readdir(ARTICLES_DIR, { withFileTypes: true });
  const files = entries.filter(e => e.isFile() && e.name.endsWith('.md')).map(e => e.name);

  console.log(`[doctor-extracted-text] markdown articles found: ${files.length}`);

  let touched = 0;
  let removedTotal = 0;

  for (const file of files) {
    const fullPath = path.join(ARTICLES_DIR, file);
    const raw = await fs.readFile(fullPath, 'utf8');

    let parsed;
    try {
      parsed = matter(raw);
    } catch (err) {
      console.warn(
        `[doctor-extracted-text] YAML parse error in articles/${file} — skip ${err.message}`
      );
      continue;
    }

    const { content } = parsed;
    const { newContent, removed } = stripExtractedSections(content);

    if (removed === 0) continue;

    removedTotal += removed;
    touched++;
    console.log(
      `[doctor-extracted-text] removed ${removed} extracted-text section(s) in articles/${file}`
    );

    if (!DRY_RUN) {
      const out = matter.stringify(newContent, parsed.data, { lineWidth: 0 });
      await fs.writeFile(fullPath, out, 'utf8');
    }
  }

  console.log(
    `[doctor-extracted-text] done. files_touched=${touched}, sections_removed=${removedTotal}`
  );
}

/**
 * 「抽出テキスト」セクションを削除
 * - パターン1: 見出し `## 抽出テキスト ...` 〜 次の `#` / `##` 直前まで
 * - パターン2: `> [!quote] 抽出テキスト ...` から、次に `>` じゃない行が続くところまで
 */
function stripExtractedSections(content) {
  let removedCount = 0;
  let result = content;

  // 見出しパターン
  const headingPattern =
    /(^|\n)##\s.*抽出テキスト[^\n]*\n[\s\S]*?(?=\n#{1,6}\s|\n$|$)/g;

  result = result.replace(headingPattern, (match, p1) => {
    removedCount++;
    return p1 ? `${p1}\n` : '\n';
  });

  // callout / 引用ブロックパターン
  const calloutPattern =
    /(^|\n)>\s*(?:\[[^\]]+\]\s*)?.*抽出テキスト[^\n]*\n[\s\S]*?(?=\n(?!>|\s*$)|$)/g;

  result = result.replace(calloutPattern, (match, p1) => {
    removedCount++;
    return p1 ? `${p1}\n` : '\n';
  });

  if (removedCount > 0) {
    // 連続空行を潰す
    result = result.replace(/\n{3,}/g, '\n\n');
  }

  return { newContent: result, removed: removedCount };
}

main().catch(err => {
  console.error('[doctor-extracted-text] fatal error', err);
  process.exit(1);
});
