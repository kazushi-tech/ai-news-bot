// scripts/lib/paths.mjs
// 共通パス定義 - 全スクリプトで統一して使用
// Vault Root = ai-news-bot/ (.obsidian がある場所)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// REPO_ROOT = ai-news-bot/ (このファイルの親の親)
export const REPO_ROOT = path.resolve(__dirname, '..', '..');

/**
 * Vault root（.obsidianがある場所）を自動検出
 * 
 * 優先順位：
 * 1. NEWS_ROOT 環境変数（設定されていればそれを使用）
 * 2. AI_NEWS_DIR 環境変数（後方互換、非推奨）
 * 3. process.cwd() から上方向に .obsidian を探索
 * 4. REPO_ROOT（スクリプトの場所から2階層上）をフォールバック
 */
function findVaultRoot() {
  // 1. 環境変数チェック（後方互換）
  if (process.env.NEWS_ROOT) {
    const resolved = path.resolve(process.env.NEWS_ROOT);
    console.log('[paths] Using NEWS_ROOT from env:', resolved);
    return resolved;
  }
  
  // AI_NEWS_DIR も後方互換のためチェック（非推奨だが動作させる）
  if (process.env.AI_NEWS_DIR) {
    const resolved = path.resolve(process.env.AI_NEWS_DIR);
    console.log('[paths] Using AI_NEWS_DIR from env (deprecated, use NEWS_ROOT):', resolved);
    return resolved;
  }
  
  // 2. .obsidian を探索（上方向に最大5階層）
  let currentDir = process.cwd();
  const maxLevels = 5;
  const searchedDirs = [];
  
  for (let i = 0; i < maxLevels; i++) {
    searchedDirs.push(currentDir);
    
    const obsidianPath = path.join(currentDir, '.obsidian');
    
    try {
      const stat = fs.statSync(obsidianPath);
      if (stat.isDirectory()) {
        console.log('[paths] Found .obsidian at:', currentDir);
        return currentDir;
      }
    } catch {
      // .obsidian が存在しないので次へ
    }
    
    const parentDir = path.dirname(currentDir);
    
    // ルートディレクトリに到達したら終了
    if (parentDir === currentDir) {
      break;
    }
    
    currentDir = parentDir;
  }
  
  // 3. フォールバック: REPO_ROOT
  console.warn('[paths] WARNING: .obsidian not found in:', searchedDirs);
  console.warn('[paths] Falling back to REPO_ROOT:', REPO_ROOT);
  console.warn('[paths] This may cause issues if the current directory is not the Vault root.');
  console.warn('[paths] Consider setting NEWS_ROOT environment variable or running from the Vault root.');
  
  return REPO_ROOT;
}

// NEWS_ROOT: Vault root を自動検出
export const NEWS_ROOT = findVaultRoot();

// 各ディレクトリ
export const ARTICLES_DIR = path.join(NEWS_ROOT, 'articles');
export const NEWS_DIR = path.join(NEWS_ROOT, 'news');
export const NEWS_AI_DIR = path.join(NEWS_DIR, 'ai');
export const WEEKLY_DIR = path.join(NEWS_ROOT, 'weekly');
export const QUEUE_DIR = path.join(NEWS_ROOT, 'queue');
export const STATE_DIR = path.join(NEWS_ROOT, 'state');
export const DATA_DIR = path.join(NEWS_ROOT, '.data');
export const TEMPLATES_DIR = path.join(NEWS_ROOT, '_templates');

// 重複排除ストア
export const DEDUPE_FILE = path.join(DATA_DIR, 'news_dedupe.json');

// ログ出力用
export function logPaths() {
  console.log('[paths] REPO_ROOT    =', REPO_ROOT);
  console.log('[paths] NEWS_ROOT    =', NEWS_ROOT);
  console.log('[paths] ARTICLES_DIR =', ARTICLES_DIR);
  console.log('[paths] NEWS_DIR     =', NEWS_DIR);
  console.log('[paths] NEWS_AI_DIR  =', NEWS_AI_DIR);
  console.log('[paths] WEEKLY_DIR   =', WEEKLY_DIR);
  console.log('[paths] STATE_DIR    =', STATE_DIR);
  
  // .obsidian の存在確認
  const obsidianPath = path.join(NEWS_ROOT, '.obsidian');
  try {
    fs.statSync(obsidianPath);
    console.log('[paths] ✓ .obsidian found at NEWS_ROOT');
  } catch {
    console.warn('[paths] ⚠ .obsidian NOT found at NEWS_ROOT - may not be Vault root');
  }
}
