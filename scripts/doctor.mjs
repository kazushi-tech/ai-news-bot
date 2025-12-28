#!/usr/bin/env node
// scripts/doctor.mjs
// 生成物の存在チェック＆生成先表示

import fs from 'node:fs/promises';
import path from 'node:path';
import { 
  REPO_ROOT, NEWS_ROOT, ARTICLES_DIR, NEWS_DIR, 
  NEWS_AI_DIR, WEEKLY_DIR, logPaths 
} from './lib/paths.mjs';

async function countFiles(dir, ext = '.md') {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter(e => e.isFile() && e.name.endsWith(ext)).length;
  } catch {
    return 0;
  }
}

async function checkFile(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return { exists: true, size: stat.size, mtime: stat.mtime };
  } catch {
    return { exists: false };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('AI News Bot - Doctor');
  console.log('='.repeat(60));
  console.log();

  logPaths();
  console.log();

  // Vault check
  const obsidianPath = path.join(NEWS_ROOT, '.obsidian');
  const obsidianCheck = await checkFile(obsidianPath);
  console.log(`📁 Vault (.obsidian): ${obsidianCheck.exists ? '✅ Found' : '❌ NOT FOUND'}`);
  console.log();

  // index.md
  const indexPath = path.join(NEWS_ROOT, 'index.md');
  const indexCheck = await checkFile(indexPath);
  console.log(`📄 index.md: ${indexCheck.exists ? `✅ ${indexCheck.size} bytes` : '❌ NOT FOUND'}`);

  // articles/
  const articlesCount = await countFiles(ARTICLES_DIR);
  console.log(`📁 articles/: ${articlesCount > 0 ? `✅ ${articlesCount} files` : '⚠️  Empty or not found'}`);

  // news/
  const newsCount = await countFiles(NEWS_DIR);
  const newsAiCount = await countFiles(NEWS_AI_DIR);
  console.log(`📁 news/: ${newsCount > 0 ? `✅ ${newsCount} files` : '⚠️  Empty'}`);
  console.log(`📁 news/ai/: ${newsAiCount > 0 ? `✅ ${newsAiCount} files` : '⚠️  Empty'}`);

  // weekly/
  const weeklyCount = await countFiles(WEEKLY_DIR);
  console.log(`📁 weekly/: ${weeklyCount > 0 ? `✅ ${weeklyCount} files` : '⚠️  Empty'}`);

  console.log();
  console.log('='.repeat(60));

  // Check for files in WRONG location (parent directory)
  const parentArticles = path.resolve(NEWS_ROOT, '..', 'articles');
  const parentNews = path.resolve(NEWS_ROOT, '..', 'news');
  const parentArticlesCount = await countFiles(parentArticles);
  const parentNewsCount = await countFiles(parentNews);

  if (parentArticlesCount > 0 || parentNewsCount > 0) {
    console.log();
    console.log('⚠️  WARNING: Files found in PARENT directory (wrong location):');
    if (parentArticlesCount > 0) {
      console.log(`   ../articles/: ${parentArticlesCount} files`);
    }
    if (parentNewsCount > 0) {
      console.log(`   ../news/: ${parentNewsCount} files`);
    }
    console.log();
    console.log('   Run: npm run migrate:fix to move them to correct location');
  }

  console.log();
}

main().catch(console.error);
