#!/usr/bin/env node
// scripts/migrate_fix.mjs
// 親ディレクトリ（../myapp/）に残った古いファイルを正しい場所（ai-news-bot/）へ移動

import fs from 'node:fs/promises';
import path from 'node:path';
import { REPO_ROOT, ARTICLES_DIR, NEWS_DIR } from './lib/paths.mjs';

const PARENT_DIR = path.resolve(REPO_ROOT, '..');
const OLD_ARTICLES_DIR = path.join(PARENT_DIR, 'articles');
const OLD_NEWS_DIR = path.join(PARENT_DIR, 'news');

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function migrateDirectory(source, target, label) {
  console.log(`\n[migrate] Checking ${label}: ${source}`);
  
  if (!await fileExists(source)) {
    console.log(`[migrate] ${label}: Not found (OK)`);
    return 0;
  }
  
  const entries = await fs.readdir(source, { withFileTypes: true });
  const files = entries.filter(e => e.isFile());
  
  if (files.length === 0) {
    console.log(`[migrate] ${label}: Empty directory`);
    return 0;
  }
  
  console.log(`[migrate] ${label}: Found ${files.length} files`);
  
  let moved = 0;
  let skipped = 0;
  
  for (const file of files) {
    const sourcePath = path.join(source, file.name);
    const targetPath = path.join(target, file.name);
    
    // Check if target already exists
    if (await fileExists(targetPath)) {
      console.log(`[migrate]   SKIP: ${file.name} (already exists in target)`);
      skipped++;
      continue;
    }
    
    // Move file
    try {
      await fs.mkdir(target, { recursive: true });
      await fs.rename(sourcePath, targetPath);
      console.log(`[migrate]   MOVE: ${file.name} → ${path.relative(REPO_ROOT, targetPath)}`);
      moved++;
    } catch (err) {
      console.error(`[migrate]   ERROR: Failed to move ${file.name}:`, err.message);
    }
  }
  
  console.log(`[migrate] ${label} Summary: ${moved} moved, ${skipped} skipped`);
  return moved;
}

async function main() {
  console.log('============================================================');
  console.log('AI News Bot - Migration Tool');
  console.log('============================================================\n');
  console.log('[migrate] REPO_ROOT =', REPO_ROOT);
  console.log('[migrate] Target ARTICLES_DIR =', ARTICLES_DIR);
  console.log('[migrate] Target NEWS_DIR =', NEWS_DIR);
  
  let totalMoved = 0;
  
  // Migrate articles
  totalMoved += await migrateDirectory(OLD_ARTICLES_DIR, ARTICLES_DIR, 'articles/');
  
  // Migrate news
  totalMoved += await migrateDirectory(OLD_NEWS_DIR, NEWS_DIR, 'news/');
  
  console.log('\n============================================================');
  if (totalMoved > 0) {
    console.log(`✅ Migration complete: ${totalMoved} files moved`);
    console.log('\nRun "npm run doctor" to verify.');
  } else {
    console.log('✅ No files to migrate (all clean)');
  }
  console.log('============================================================');
}

main().catch(err => {
  console.error('[migrate] Fatal error:', err);
  process.exit(1);
});
