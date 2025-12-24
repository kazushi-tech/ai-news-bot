#!/usr/bin/env node
// scripts/cleanup_articles_remove_extracted.mjs

import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const NEWS_ROOT = process.env.NEWS_ROOT
  ? path.resolve(process.cwd(), process.env.NEWS_ROOT)
  : path.resolve(process.cwd(), '..', 'ai-news');

const ARTICLES_DIR = path.resolve(NEWS_ROOT, 'articles');

console.log(`[cleanup] NEWS_ROOT    = ${NEWS_ROOT}`);
console.log(`[cleanup] ARTICLES_DIR = ${ARTICLES_DIR}`);

let totalFiles = 0;
let parsedOk = 0;
let skippedYamlError = 0;
let skippedOther = 0;
let changedFiles = 0;
let unchangedFiles = 0;

/**
 * 再帰的に .md を集める
 */
async function collectMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await collectMarkdownFiles(fullPath);
      files.push(...nested);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * [!tldr], [!cite] のコールアウトブロックを削除
 * - 典型的な Obsidian の callout（> [!tldr] ...）を想定
 * - まれに [!tldr] だけで始まるブロックも一応ケア
 */
function removeCalloutBlocks(content) {
  const lines = content.split('\n');
  const targetTypes = ['tldr', 'cite'];

  const isCalloutStart = (line) => {
    const trimmed = line.trimStart();
    if (!trimmed.startsWith('[!') && !trimmed.startsWith('>')) return false;

    // "> [!tldr]" / ">[!tldr]" / "[!tldr]" をまとめて検出
    const lower = trimmed.toLowerCase();
    return targetTypes.some((type) => lower.includes(`[!${type}`));
  };

  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (isCalloutStart(line)) {
      // この行から callout ブロックの終わりまでスキップ
      const isBlockquoteStyle = line.trimStart().startsWith('>');
      i += 1;

      if (isBlockquoteStyle) {
        // 連続した ">" で始まる行を飛ばす
        while (i < lines.length) {
          const l = lines[i];
          if (l.trim() === '') {
            // 空行は callout の一部として削除してしまう
            i += 1;
            continue;
          }
          if (l.trimStart().startsWith('>')) {
            i += 1;
            continue;
          }
          break;
        }
      } else {
        // "[!tldr]" から始まるだけのパターンの場合
        // 次の「見出し or 空行」までをざっくり削除
        while (i < lines.length) {
          const l = lines[i];
          if (l.trim() === '') {
            i += 1;
            break;
          }
          if (l.startsWith('#')) {
            break;
          }
          i += 1;
        }
      }

      continue;
    }

    result.push(line);
    i += 1;
  }

  return result.join('\n');
}

/**
 * 「抽出テキスト（スクレイピング済み本文の一部）」セクション以降を削除
 * 基本的にこのセクションは末尾にある想定なので、見つかった行以降をすべて削除する。
 */
function removeExtractedTextSection(content) {
  const lines = content.split('\n');

  const idx = lines.findIndex((line) =>
    line.includes('抽出テキスト（スクレイピング済み本文の一部')
  );

  if (idx === -1) {
    return content;
  }

  // 見出し行（たぶん "## 抽出テキスト（スクレイピング済み本文の一部）"）以降を全部削除
  const remaining = lines.slice(0, idx);
  return remaining.join('\n');
}

/**
 * 連続する空行を1行に圧縮し、前後の余計な空白もほどよく削る
 */
function normalizeBlankLines(content) {
  const lines = content.split('\n');
  const result = [];
  let blankCount = 0;

  for (const line of lines) {
    if (line.trim() === '') {
      if (blankCount === 0) {
        result.push('');
      }
      blankCount += 1;
    } else {
      result.push(line);
      blankCount = 0;
    }
  }

  // 先頭・末尾の空行を削除
  while (result.length > 0 && result[0].trim() === '') {
    result.shift();
  }
  while (result.length > 0 && result[result.length - 1].trim() === '') {
    result.pop();
  }

  return result.join('\n') + '\n';
}

/**
 * 単一ファイルのクリーンアップ処理
 */
async function processFile(filePath) {
  totalFiles += 1;
  const relPath = path.relative(NEWS_ROOT, filePath);

  let raw;
  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch (err) {
    console.warn(`[cleanup] ⚠️ read error: ${relPath}: ${err.message}`);
    skippedOther += 1;
    return;
  }

  let parsed;
  try {
    parsed = matter(raw);
  } catch (err) {
    console.warn(
      `[cleanup] ⚠️ YAML parse error in ${relPath}: ${err.message} (skipped)`
    );
    skippedYamlError += 1;
    return;
  }

  parsedOk += 1;

  const originalContent = parsed.content || '';
  let newContent = originalContent;

  // 1. [!tldr], [!cite] callout 削除
  newContent = removeCalloutBlocks(newContent);

  // 2. 抽出テキストセクション以降を削除
  newContent = removeExtractedTextSection(newContent);

  // 3. 空行整形
  newContent = normalizeBlankLines(newContent);

  if (newContent === originalContent) {
    unchangedFiles += 1;
    return;
  }

  const newRaw = matter.stringify(newContent, parsed.data);

  try {
    await fs.writeFile(filePath, newRaw, 'utf8');
    changedFiles += 1;
    console.log(`[cleanup] updated: ${relPath}`);
  } catch (err) {
    console.warn(`[cleanup] ⚠️ write error: ${relPath}: ${err.message}`);
    skippedOther += 1;
  }
}

/**
 * メイン
 */
async function main() {
  console.log('[cleanup] start');

  const files = await collectMarkdownFiles(ARTICLES_DIR);
  console.log(`[cleanup] found markdown files: ${files.length}`);

  for (const file of files) {
    // YAML が壊れているファイルなどは processFile 内でスキップ
    // スクリプト全体は止めない
    // eslint-disable-next-line no-await-in-loop
    await processFile(file);
  }

  console.log('----------------------------------------');
  console.log('[cleanup] summary');
  console.log(`[cleanup] total files          = ${totalFiles}`);
  console.log(`[cleanup] parsed OK            = ${parsedOk}`);
  console.log(`[cleanup] skipped (YAML error) = ${skippedYamlError}`);
  console.log(`[cleanup] skipped (other)      = ${skippedOther}`);
  console.log(`[cleanup] changed files        = ${changedFiles}`);
  console.log(`[cleanup] unchanged files      = ${unchangedFiles}`);
  console.log('[cleanup] done');
}

main().catch((err) => {
  console.error('[cleanup] fatal error:', err);
  process.exit(1);
});
