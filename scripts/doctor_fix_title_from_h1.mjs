#!/usr/bin/env node
// scripts/doctor_fix_title_from_h1.mjs
//
// 役割：articles の frontmatter.title が URL の場合、
//      本文の H1 からタイトルを取得して frontmatter に反映する。
//
// 実行例：
//   NEWS_ROOT=../ai-news node scripts/doctor_fix_title_from_h1.mjs [--dry-run]

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEWS_ROOT =
  process.env.NEWS_ROOT || path.resolve(__dirname, "..", "ai-news");
const ARTICLES_DIR = path.join(NEWS_ROOT, "articles");

const DRY_RUN = process.argv.includes("--dry-run");

console.log(`[doctor-fix-title] NEWS_ROOT = ${NEWS_ROOT}`);
console.log(`[doctor-fix-title] ARTICLES_DIR = ${ARTICLES_DIR}`);
console.log(`[doctor-fix-title] DRY_RUN = ${DRY_RUN}`);

// ====== util ======

function extractFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n/);
  if (!match) return null;

  const yamlText = match[1];
  const bodyStart = match[0].length;
  const body = content.slice(bodyStart);

  // 簡易 YAML パース（title と source_url のみ）
  const titleMatch = yamlText.match(/^title:\s*(.+)$/m);
  const sourceUrlMatch = yamlText.match(/^source_url:\s*(.+)$/m);

  let title = titleMatch ? titleMatch[1].trim() : '';
  let sourceUrl = sourceUrlMatch ? sourceUrlMatch[1].trim() : '';

  // YAML マルチライン（>-）の処理
  if (title.startsWith('>-')) {
    const multiLineMatch = yamlText.match(/^title:\s*>-\r?\n\s+(.+)$/m);
    if (multiLineMatch) {
      title = multiLineMatch[1].trim();
    }
  }
  if (sourceUrl.startsWith('>-')) {
    const multiLineMatch = yamlText.match(/^source_url:\s*>-\r?\n\s+(.+)$/m);
    if (multiLineMatch) {
      sourceUrl = multiLineMatch[1].trim();
    }
  }

  // クォート除去
  title = title.replace(/^['"]|['"]$/g, '');
  sourceUrl = sourceUrl.replace(/^['"]|['"]$/g, '');

  return { title, sourceUrl, yamlText, body, fullFrontmatter: match[0] };
}

function extractH1FromBody(body) {
  const h1Match = body.match(/^#\s+(.+)$/m);
  return h1Match ? h1Match[1].trim() : null;
}

function isUrlLike(str) {
  return /^https?:\/\//.test(str);
}

async function fixArticleTitle(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const fm = extractFrontmatter(content);

  if (!fm) {
    return { status: 'skip', reason: 'no frontmatter' };
  }

  // title が URL でない場合はスキップ
  if (!fm.title || !isUrlLike(fm.title)) {
    return { status: 'skip', reason: 'title is not URL' };
  }

  // H1 からタイトルを取得
  const h1Title = extractH1FromBody(fm.body);
  if (!h1Title) {
    return { status: 'skip', reason: 'no H1 found' };
  }

  // 新しい frontmatter を作成
  const newYaml = fm.yamlText.replace(
    /^title:\s*>-\r?\n\s+.+$/m,
    `title: "${h1Title}"`
  ).replace(
    /^title:\s*['"]?https?:\/\/.+['"]?$/m,
    `title: "${h1Title}"`
  );

  const newContent = `---\n${newYaml}\n---\n${fm.body}`;

  if (DRY_RUN) {
    console.log(`[doctor-fix-title] would fix: ${path.basename(filePath)}`);
    console.log(`  old title: ${fm.title.slice(0, 80)}`);
    console.log(`  new title: ${h1Title.slice(0, 80)}`);
    return { status: 'would-fix', oldTitle: fm.title, newTitle: h1Title };
  }

  await fs.writeFile(filePath, newContent, 'utf8');
  console.log(`[doctor-fix-title] fixed: ${path.basename(filePath)}`);
  console.log(`  old title: ${fm.title.slice(0, 80)}`);
  console.log(`  new title: ${h1Title.slice(0, 80)}`);

  return { status: 'fixed', oldTitle: fm.title, newTitle: h1Title };
}

// ====== メイン処理 ======

async function main() {
  const files = await fs.readdir(ARTICLES_DIR);
  const mdFiles = files.filter((f) => f.endsWith('.md'));

  console.log(`\n[doctor-fix-title] checking ${mdFiles.length} articles...\n`);

  let fixedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const file of mdFiles) {
    const filePath = path.join(ARTICLES_DIR, file);

    try {
      const result = await fixArticleTitle(filePath);

      if (result.status === 'fixed' || result.status === 'would-fix') {
        fixedCount++;
      } else {
        skippedCount++;
      }
    } catch (err) {
      console.error(`[doctor-fix-title] error in ${file}:`, err.message);
      errorCount++;
    }
  }

  console.log(`\n[doctor-fix-title] done.`);
  console.log(`  fixed: ${fixedCount}`);
  console.log(`  skipped: ${skippedCount}`);
  console.log(`  errors: ${errorCount}`);
}

main().catch((err) => {
  console.error('[doctor-fix-title] FATAL:', err);
  process.exit(1);
});
