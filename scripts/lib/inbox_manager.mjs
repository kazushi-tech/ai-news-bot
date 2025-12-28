// scripts/lib/inbox_manager.mjs
// Inboxファイル（state/url_inbox.md）の読み書きユーティリティ

import fs from 'node:fs/promises';
import path from 'node:path';
import { STATE_DIR } from './paths.mjs';

const INBOX_FILE = path.join(STATE_DIR, 'url_inbox.md');

/**
 * Inbox行をパース
 * Format: - [ ] YYYY-MM-DD [Title](URL) *(Source)*
 */
function parseInboxLine(line) {
  const match = line.match(/^- \[([ x~])\] (\d{4}-\d{2}-\d{2}) \[(.+?)\]\((.+?)\) \*\((.+?)\)\*$/);
  if (!match) return null;
  
  const [, status, date, title, url, source] = match;
  return {
    status: status === ' ' ? 'pending' : status === 'x' ? 'approved' : 'rejected',
    date,
    title,
    url,
    source,
    rawLine: line
  };
}

/**
 * Inboxファイルを読み込んで候補リストを返す
 * @param {string} filterStatus - 'pending', 'approved', 'rejected', or 'all'
 */
export async function loadInbox(filterStatus = 'pending') {
  try {
    const content = await fs.readFile(INBOX_FILE, 'utf8');
    const lines = content.split('\n');
    
    const candidates = [];
    let candidateId = 1;
    
    for (const line of lines) {
      const parsed = parseInboxLine(line);
      if (!parsed) continue;
      
      if (filterStatus === 'all' || parsed.status === filterStatus) {
        candidates.push({
          id: `A${String(candidateId).padStart(3, '0')}`,
          ...parsed,
          candidateId: candidateId
        });
        candidateId++;
      }
    }
    
    return candidates;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

/**
 * Inbox内の特定URLのステータスを更新
 * @param {string} url - 更新対象のURL
 * @param {string} newStatus - 'approved' (x), 'rejected' (~), 'pending' ( )
 */
export async function updateInboxStatus(url, newStatus) {
  try {
    const content = await fs.readFile(INBOX_FILE, 'utf8');
    const lines = content.split('\n');
    
    const statusChar = newStatus === 'approved' ? 'x' : newStatus === 'rejected' ? '~' : ' ';
    let updated = false;
    
    const newLines = lines.map(line => {
      const parsed = parseInboxLine(line);
      if (parsed && parsed.url === url) {
        updated = true;
        return line.replace(/^- \[.\]/, `- [${statusChar}]`);
      }
      return line;
    });
    
    if (updated) {
      await fs.writeFile(INBOX_FILE, newLines.join('\n'), 'utf8');
      return true;
    }
    
    return false;
  } catch (err) {
    console.error('[inbox] Failed to update status:', err);
    return false;
  }
}

/**
 * URLからInbox候補情報を取得
 */
export async function findInboxCandidate(url) {
  const candidates = await loadInbox('all');
  return candidates.find(c => c.url === url);
}
