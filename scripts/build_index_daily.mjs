// scripts/build_index_daily.mjs
// DラボAIチャンネル風の日次インデックス生成
// 新形式: news/ai/YYYY-MM-DD-AI-news.md に 6列テーブル + 詳細セクション

import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import { NEWS_ROOT, ARTICLES_DIR, NEWS_AI_DIR } from './lib/paths.mjs';

const AI_NEWS_DIR = NEWS_ROOT;
const NEWS_DIR = NEWS_AI_DIR;  // news/ai/ に出力
const MAX_PER_HOST = Number(process.env.AI_NEWS_MAX_PER_HOST || '5');

console.log('[daily] AI_NEWS_DIR =', AI_NEWS_DIR);
console.log('[daily] ARTICLES_DIR =', ARTICLES_DIR);
console.log('[daily] NEWS_DIR   =', NEWS_DIR);
console.log('[daily] MAX_PER_HOST =', MAX_PER_HOST);

function escapeCell(text = '') {
  return String(text)
    .replace(/\r?\n/g, ' ')
    .replace(/\|/g, '\\|');
}

async function loadArticles() {
  const entries = await fs.readdir(ARTICLES_DIR, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith('.md'))
    .map((e) => e.name)
    .sort(); // 安定ソート

  const articles = [];

  for (const file of files) {
    const fullPath = path.join(ARTICLES_DIR, file);

    let raw;
    try {
      raw = await fs.readFile(fullPath, 'utf8');
    } catch (err) {
      console.error('[daily] skip (read error)', file, '-', err.message);
      continue;
    }

    const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
    if (!m) {
      console.log('[daily] skip (no frontmatter)', file);
      continue;
    }

    let fm;
    try {
      fm = YAML.parse(m[1]);
    } catch (err) {
      console.log('[daily] skip (YAML parse error)', file + ':', err.message);
      continue;
    }

    if (!fm || !fm.source_url) {
      console.log('[daily] skip (no source_url)', file);
      continue;
    }

    // 日付 (created > date > ファイル名)
    let dateStr = '';
    if (fm.created) {
      dateStr = String(fm.created).slice(0, 10);
    } else if (fm.date) {
      dateStr = String(fm.date).slice(0, 10);
    }
    if (!dateStr) {
      const m2 = file.match(/^(\d{4}-\d{2}-\d{2})--/);
      if (m2) dateStr = m2[1];
    }
    if (!dateStr) {
      console.log('[daily] skip (no date)', file);
      continue;
    }

    // ホスト
    let host = fm.host;
    if (!host) {
      try {
        host = new URL(fm.source_url).host;
      } catch {
        host = '';
      }
    }

    const relPath = `articles/${file}`;
    
    // Title の fallback: URL なら別の方法で取得
    let title = fm.title || file.replace(/\.md$/, '');
    if (title && /^https?:\/\//.test(title)) {
      const slugMatch = file.match(/^\d{4}-\d{2}-\d{2}--[^-]+?--(.+)\.md$/);
      if (slugMatch) {
        title = decodeURIComponent(slugMatch[1])
          .replace(/-/g, ' ')
          .replace(/_/g, ' ');
      } else {
        title = file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}--/, '');
      }
    }

    // 本文からbulletを抽出（詳細セクション用）
    const bodyMatch = raw.match(/---\n[\s\S]*?\n---\n([\s\S]*)/);
    const bodyText = bodyMatch ? bodyMatch[1] : '';
    const bullets = bodyText
      .split('\n')
      .filter(line => line.trim().startsWith('- ') || line.trim().startsWith('> - '))
      .slice(0, 3)
      .map(line => line.replace(/^>\s*/, '').trim());

    articles.push({
      file,
      relPath,
      date: dateStr,
      host,
      title,
      source_url: fm.source_url,
      source: fm.source || host,
      tldr: fm.tldr || '',
      tags: fm.tags || ['ai-news'],
      importance: fm.importance || 3,  // Default to medium importance
      why_it_matters: fm.why_it_matters || null,
      reliability: fm.reliability ||null,
      reliability_reason: fm.reliability_reason || null,
      bullets
    });
  }

  return articles;
}

function groupByDate(articles) {
  const map = new Map();
  for (const art of articles) {
    if (!map.has(art.date)) map.set(art.date, []);
    map.get(art.date).push(art);
  }
  // 各日付内で importance でソート（高→低）、同importance内でファイル名順
  for (const list of map.values()) {
    list.sort((a, b) => {
      const impA = a.importance || 3;
      const impB = b.importance || 3;
      if (impA !== impB) return impB - impA;  // Descending (high to low)
      return a.file.localeCompare(b.file);
    });
  }
  return map;
}

function applyHostCap(list) {
  if (!MAX_PER_HOST || MAX_PER_HOST <= 0) {
    return { limited: list, beforeCap: list.length };
  }

  const hostCounts = new Map();
  const limited = [];

  for (const art of list) {
    const host = art.host || '';
    const count = hostCounts.get(host) || 0;
    if (count >= MAX_PER_HOST) continue;

    hostCounts.set(host, count + 1);
    limited.push(art);
  }

  return { limited, beforeCap: list.length };
}

async function writeDaily(date, list, beforeCap) {
  if (!list.length) return;

  // 新形式: YYYY-MM-DD-AI-news.md (ハイフン1つ)
  const fileName = `${date}-AI-news.md`;
  const outPath = path.join(NEWS_DIR, fileName);

  // Week number calculation for navigation
  const dateObj = new Date(date + 'T00:00:00Z');
  const weekNum = getWeekNumber(dateObj);
  const weekId = `${dateObj.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;

  // Topics & Sources aggregation
  const tagCounts = new Map();
  const sourceCounts = new Map();
  
  for (const art of list) {
    // Tags
    if (Array.isArray(art.tags)) {
      art.tags.forEach(tag => {
        if (tag && tag !== 'ai-news') {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        }
      });
    }
    // Sources
    if (art.source) {
      sourceCounts.set(art.source, (sourceCounts.get(art.source) || 0) + 1);
    }
  }

  // 前日/翌日のDaily検索
  const adjacent = await findAdjacentDailies(date);

  const lines = [];
  
  // Frontmatter
  lines.push('---');
  lines.push(`date: ${date}`);
  lines.push('kind: ai-news');
  lines.push(`article_count: ${list.length}`);
  lines.push('timezone: Asia/Tokyo');
  lines.push('---');
  lines.push('');
  
  // タイトル
  lines.push(`# AI News (${date})`);
  lines.push('');
  
  // 説明callout
  lines.push('> [!tip] このページについて');
  lines.push('> この日に収集されたAI/ML関連ニュースの一覧です。重要度順に並べています。');
  lines.push('');
  
  // Navigation
  lines.push(`[[index|← ホームに戻る]] | [[weekly/${weekId}--AI-weekly|📰 今週のまとめ]]`);
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // Section header
  lines.push(`## 📰 今日のニュース (${list.length}件)`);
  lines.push('');
  
  // 6列テーブル
  lines.push('| Title | 記事ページへ | 引用元へ | Tags | Imp | Source |');
  lines.push('| --- | --- | --- | --- | --- | --- |');
  
  list.forEach((art) => {
    const titleCell = escapeCell(art.title);
    const articleLink = `[[${art.relPath}|→]]`;
    const sourceLink = `[🔗](${art.source_url})`;
    
    // Tags: カンマ区切り文字列（ai-newsを除外）
    const tagsStr = Array.isArray(art.tags)
      ? art.tags.filter(t => t !== 'ai-news').join(', ')
      : '';
    
    // Importance: 1-5の数値
    const impStr = art.importance || '';
    
    // Source: host/domain
    const sourceStr = art.source || art.host || '';
    
    lines.push(`| ${titleCell} | ${articleLink} | ${sourceLink} | ${tagsStr} | ${impStr} | ${sourceStr} |`);
  });
  
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // Topics Summary - callout形式
  if (tagCounts.size > 0) {
    const topTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => `**#${tag}** (${count}件)`)
      .join(' · ');
    
    lines.push('> [!info] 📊 Today\'s Topics');
    lines.push(`> ${topTags}`);
    lines.push('');
  }
  
  lines.push('---');
  lines.push('');
  
  // 詳細セクション
  lines.push('## 📄 詳細');
  lines.push('');
  
  list.forEach((art, idx) => {
    const num = idx + 1;
    
    lines.push(`### ${num}) [${art.title}](${art.source_url})`);
    
    if (art.bullets && art.bullets.length > 0) {
      art.bullets.forEach(bullet => {
        lines.push(bullet);
      });
    } else {
      lines.push('> -');
    }
    
    // Why it matters
    if (art.why_it_matters) {
      lines.push(`**Why it matters:** ${art.why_it_matters}`);
    }
    
    // 信頼度
    if (art.reliability) {
      const label = { high: '高', mid: '中', low: '低' }[art.reliability] || art.reliability;
      const reason = art.reliability_reason ? `（${art.reliability_reason}）` : '';
      lines.push(`**信頼度:** ${label}${reason}`);
    }
    
    // 記事ページへのリンク
    lines.push(`📄 [[articles/${art.file}|詳細を読む]]`);
    lines.push('');
  });

  // 下部ナビゲーション（前日/翌日）
  const navLinks = [];
  if (adjacent.prev) {
    navLinks.push(`[[${adjacent.prev.path}|← ${adjacent.prev.date}]]`);
  }
  navLinks.push(`[[index|📍 ホーム]]`);
  if (adjacent.next) {
    navLinks.push(`[[${adjacent.next.path}|${adjacent.next.date} →]]`);
  }
  
  lines.push(navLinks.join(' | '));
  lines.push('');

  const content = lines.join('\n');

  await fs.writeFile(outPath, content, 'utf8');
  console.log(
    `[daily] wrote news/ai/${fileName} (${list.length} articles, ${beforeCap} before host cap, ${MAX_PER_HOST}/host/day)`
  );
}

/**
 * 前日・翌日のDailyファイルを検索
 */
async function findAdjacentDailies(currentDate) {
  const dateObj = new Date(currentDate + 'T00:00:00Z');
  
  // 前日
  const prevDateObj = new Date(dateObj);
  prevDateObj.setUTCDate(prevDateObj.getUTCDate() - 1);
  const prevDate = prevDateObj.toISOString().slice(0, 10);
  
  // 翌日
  const nextDateObj = new Date(dateObj);
  nextDateObj.setUTCDate(nextDateObj.getUTCDate() + 1);
  const nextDate = nextDateObj.toISOString().slice(0, 10);
  
  // ファイル存在チェック
  const prevFile = path.join(NEWS_DIR, `${prevDate}-AI-news.md`);
  const nextFile = path.join(NEWS_DIR, `${nextDate}-AI-news.md`);
  
  const [hasPrev, hasNext] = await Promise.all([
    fs.access(prevFile).then(() => true).catch(() => false),
    fs.access(nextFile).then(() => true).catch(() => false)
  ]);
  
  return {
    prev: hasPrev ? { date: prevDate, path: `news/ai/${prevDate}-AI-news` } : null,
    next: hasNext ? { date: nextDate, path: `news/ai/${nextDate}-AI-news` } : null
  };
}

// Week number helper
function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return weekNo;
}

async function main() {
  await fs.mkdir(NEWS_DIR, { recursive: true });

  const articles = await loadArticles();
  if (!articles.length) {
    console.log('[daily] no articles found');
    return;
  }

  const byDate = groupByDate(articles);
  const dates = [...byDate.keys()].sort();

  for (const date of dates) {
    const list = byDate.get(date);
    const { limited, beforeCap } = applyHostCap(list);
    await writeDaily(date, limited, beforeCap);
  }

  console.log('[daily] done. days generated:', dates.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
