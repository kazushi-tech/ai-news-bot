// scripts/lib/file_lock.mjs
// 簡易ファイルロック（同一日次ファイル更新の直列化）
// lockfile方式：.lock ファイルを作成し、解放時に削除

import fs from 'node:fs/promises';
import path from 'node:path';

const LOCK_TIMEOUT_MS = 30000; // 30秒
const RETRY_INTERVAL_MS = 100;

/**
 * ファイルロックを取得
 * @param {string} filePath - ロック対象ファイル
 * @returns {Promise<() => Promise<void>>} - ロック解放関数
 */
export async function acquireLock(filePath) {
  const lockPath = filePath + '.lock';
  const startTime = Date.now();
  
  while (true) {
    try {
      // O_EXCL: ファイルが存在しない場合のみ作成
      await fs.writeFile(lockPath, `${process.pid}\n${Date.now()}`, { flag: 'wx' });
      
      // ロック取得成功
      return async () => {
        try {
          await fs.unlink(lockPath);
        } catch {
          // 既に解放済み
        }
      };
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
      
      // タイムアウトチェック
      if (Date.now() - startTime > LOCK_TIMEOUT_MS) {
        // 古いロックの強制解除を試みる
        try {
          const lockContent = await fs.readFile(lockPath, 'utf8');
          const [, lockTime] = lockContent.split('\n');
          if (lockTime && Date.now() - parseInt(lockTime, 10) > LOCK_TIMEOUT_MS) {
            console.warn(`[lock] Stale lock detected, removing: ${lockPath}`);
            await fs.unlink(lockPath);
            continue;
          }
        } catch {
          // ロックファイル読み取り失敗、リトライ
        }
        throw new Error(`Lock timeout: ${filePath}`);
      }
      
      // リトライ
      await new Promise(r => setTimeout(r, RETRY_INTERVAL_MS));
    }
  }
}

/**
 * ロック付きでファイル操作を実行
 * @param {string} filePath
 * @param {() => Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function withLock(filePath, fn) {
  const release = await acquireLock(filePath);
  try {
    return await fn();
  } finally {
    await release();
  }
}

/**
 * 原子的ファイル書き込み（temp→rename）
 * @param {string} filePath
 * @param {string} content
 */
export async function atomicWrite(filePath, content) {
  const tempPath = filePath + '.tmp.' + process.pid;
  try {
    await fs.writeFile(tempPath, content, 'utf8');
    await fs.rename(tempPath, filePath);
  } catch (err) {
    // クリーンアップ
    try { await fs.unlink(tempPath); } catch {}
    throw err;
  }
}
