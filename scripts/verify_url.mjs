#!/usr/bin/env node
// scripts/verify_url.mjs
// URL1件を投入し、生成物を確認するドライランモード付きコマンド

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { normalizeUrl, hashUrl } from './lib/url_normalizer.mjs';
import { REPO_ROOT, NEWS_ROOT, ARTICLES_DIR, DEDUPE_FILE } from './lib/paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CLI Args
const url = process.argv[2];
const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');

if (!url || url.startsWith('--')) {
  console.log(`
Usage: node scripts/verify_url.mjs <URL> [--dry-run] [--force]

Options:
  --dry-run   生成せず、処理内容のプレビューのみ
  --force     重複チェックをスキップして強制生成

Examples:
  node scripts/verify_url.mjs https://example.com/article --dry-run
  node scripts/verify_url.mjs https://example.com/article --force
`);
  process.exit(1);
}

async function loadDedupe() {
  try {
    const data = await fs.readFile(DEDUPE_FILE, 'utf8');
    return JSON.parse(data);
  } catch { return { hashes: {} }; }
}

async function findArticle(urlHash) {
  const dedupe = await loadDedupe();
  if (dedupe.hashes[urlHash]) {
    return dedupe.hashes[urlHash];
  }
  return null;
}

async function runSummarize(targetUrl) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['scripts/summarize_article.mjs', targetUrl], {
      cwd: REPO_ROOT,
      stdio: 'inherit',
      env: { ...process.env }
    });
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Exit ${code}`)));
    child.on('error', reject);
  });
}

async function main() {
  console.log('='.repeat(60));
  console.log('URL Verification Tool');
  console.log('='.repeat(60));
  console.log();
  
  console.log('Input URL:', url);
  const normalized = normalizeUrl(url);
  const urlHash = hashUrl(url);
  
  console.log('Normalized:', normalized);
  console.log('Hash:', urlHash);
  console.log();
  
  // 重複チェック
  const existing = await findArticle(urlHash);
  if (existing && !FORCE) {
    console.log('⚠️  Already processed:');
    console.log('   Article:', existing.articleFile || '(unknown)');
    console.log('   Date:', existing.timestamp || '(unknown)');
    console.log();
    console.log('Use --force to regenerate.');
    return;
  }
  
  if (DRY_RUN) {
    console.log('🔍 DRY-RUN MODE');
    console.log();
    console.log('Would perform:');
    console.log('  1. Fetch article content');
    console.log('  2. Extract with Readability');
    console.log('  3. Summarize with Gemini');
    console.log('  4. Generate article file in articles/');
    console.log('  5. Update dedupe store');
    console.log();
    console.log('No files will be created.');
    return;
  }
  
  console.log('🚀 Running summarization...');
  console.log();
  
  try {
    await runSummarize(url);
    console.log();
    console.log('✅ Success!');
    
    // 生成されたファイルを探す
    const files = await fs.readdir(ARTICLES_DIR);
    const recent = files
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse()
      .slice(0, 3);
    
    console.log();
    console.log('Recently created files:');
    for (const f of recent) {
      const stat = await fs.stat(path.join(ARTICLES_DIR, f));
      console.log(`  ${f} (${stat.size} bytes)`);
    }
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
}

main().catch(console.error);
