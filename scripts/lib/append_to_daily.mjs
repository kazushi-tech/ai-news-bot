// scripts/lib/append_to_daily.mjs
// 日次ファイルへの追記モジュール
// TABLE_ROW と DETAILS を既存日次ファイルに追記（なければ新規作成）
// ファイルロック付き・原子的書き込み対応

import fs from 'node:fs/promises';
import path from 'node:path';
import { withLock, atomicWrite } from './file_lock.mjs';

/**
 * 今日の日付を YYYY-MM-DD 形式で取得（Asia/Tokyo）
 */
export function todayYYYYMMDD() {
  const now = new Date();
  // JST = UTC + 9時間
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

/**
 * 日次ファイルのテンプレート（ヘッダー付き）を生成
 */
function createDailyTemplate(date) {
  return [
    '---',
    `date: ${date}`,
    'kind: ai-news',
    'timezone: Asia/Tokyo',
    '---',
    '',
    `# AI News (${date})`,
    '',
    '| # | タイトル | ソース | 要約(1行) | タグ | URL |',
    '| --- | --- | --- | --- | --- | --- |',
    '',
    '---',
    '',
    '## 詳細',
    ''
  ].join('\n');
}

/**
 * テーブル行を生成
 */
export function formatTableRow({ n, title, source, oneLineSummary, tags, url }) {
  const escapeCell = (text) => String(text || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const tagsStr = Array.isArray(tags) ? tags.join(', ') : String(tags || '');
  
  return `| ${n} | ${escapeCell(title)} | ${escapeCell(source)} | ${escapeCell(oneLineSummary)} | ${tagsStr} | [リンク](${url}) |`;
}

/**
 * 詳細セクションを生成
 */
export function formatDetails({ n, title, url, bullets, whyItMatters, reliability, reliabilityReason }) {
  const lines = [];
  
  lines.push(`### ${n}) [${title}](${url})`);
  
  // bullets
  if (Array.isArray(bullets) && bullets.length > 0) {
    bullets.forEach(b => {
      lines.push(`- ${b}`);
    });
  }
  
  // Why it matters
  if (whyItMatters) {
    lines.push(`**Why it matters:** ${whyItMatters}`);
  }
  
  // 信頼度
  if (reliability) {
    const label = { high: '高', mid: '中', low: '低' }[reliability] || reliability;
    const reason = reliabilityReason ? `（${reliabilityReason}）` : '';
    lines.push(`**信頼度:** ${label}${reason}`);
  }
  
  lines.push('');
  
  return lines.join('\n');
}

/**
 * 日次ファイルから現在の連番を取得
 */
export async function getCurrentNumber(dailyPath) {
  try {
    const content = await fs.readFile(dailyPath, 'utf8');
    // テーブル行から最大の番号を探す
    const tableRowMatches = content.matchAll(/^\| (\d+) \|/gm);
    let maxN = 0;
    for (const match of tableRowMatches) {
      const num = parseInt(match[1], 10);
      if (num > maxN) maxN = num;
    }
    return maxN;
  } catch {
    return 0;
  }
}

/**
 * 日次ファイルに追記
 * @param {string} newsDir - news/ai ディレクトリのパス
 * @param {object} article - 記事データ
 * @param {string} [dateOverride] - 日付オーバーライド（テスト用）
 * @returns {{ dailyPath: string, n: number }}
 */
export async function appendToDaily(newsDir, article, dateOverride = null) {
  const date = dateOverride || todayYYYYMMDD();
  const filename = `${date}-AI-news.md`;
  const dailyPath = path.join(newsDir, filename);
  
  await fs.mkdir(newsDir, { recursive: true });
  
  // ファイルロック付きで処理
  return await withLock(dailyPath, async () => {
    // ファイル存在確認・新規作成
    let content;
    try {
      content = await fs.readFile(dailyPath, 'utf8');
    } catch {
      // 新規作成
      content = createDailyTemplate(date);
      await atomicWrite(dailyPath, content);
      console.log(`[append_to_daily] Created new daily file: ${filename}`);
    }
    
    // 連番取得
    const currentN = await getCurrentNumber(dailyPath);
    const n = currentN + 1;
    
    // テーブル行と詳細セクションを生成
    const tableRow = formatTableRow({
      n,
      title: article.title,
      source: article.source,
      oneLineSummary: article.oneLineSummary || article.tldr,
      tags: article.tags,
      url: article.url
    });
    
    const details = formatDetails({
      n,
      title: article.title,
      url: article.url,
      bullets: article.bullets,
      whyItMatters: article.whyItMatters,
      reliability: article.reliability,
      reliabilityReason: article.reliabilityReason
    });
    
    // ファイルを再読み込み
    content = await fs.readFile(dailyPath, 'utf8');
    
    // テーブル末尾を探す（空行 + --- の直前）
    const tableEndPattern = /(\| [^\n]+ \|\n)(\n---)/;
    const tableEndMatch = content.match(tableEndPattern);
    
    if (tableEndMatch) {
      const insertPos = content.indexOf(tableEndMatch[0]) + tableEndMatch[1].length;
      content = content.slice(0, insertPos) + tableRow + '\n' + content.slice(insertPos);
    } else {
      // テーブルヘッダー直後に追加（フォールバック）
      const headerPattern = /(\| --- \| --- \| --- \| --- \| --- \| --- \|\n)/;
      const headerMatch = content.match(headerPattern);
      if (headerMatch) {
        const insertPos = content.indexOf(headerMatch[0]) + headerMatch[0].length;
        content = content.slice(0, insertPos) + tableRow + '\n' + content.slice(insertPos);
      }
    }
    
    // ファイル末尾に詳細を追加
    content = content.trimEnd() + '\n\n' + details;
    
    // 原子的書き込み
    await atomicWrite(dailyPath, content);
    console.log(`[append_to_daily] Appended #${n} to ${filename}: ${article.title}`);
    
    return { dailyPath, n };
  });
}

