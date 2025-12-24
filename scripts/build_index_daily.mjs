// scripts/build_index_daily.mjs
// DラボAIチャンネル風の日次インデックス生成
// 形式: news/YYYY-MM-DD--AI-news.md に 3列テーブル (タイトル | 記事 | 引用元)

import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

const AI_NEWS_DIR = process.env.AI_NEWS_DIR;
if (!AI_NEWS_DIR) {
  console.error('[daily] ERROR: AI_NEWS_DIR is not set');
  process.exit(1);
}

const ARTICLES_DIR = path.join(AI_NEWS_DIR, 'articles');
const NEWS_DIR = path.join(AI_NEWS_DIR, 'news');
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
      // title が URL の場合は、より読みやすい fallback を使う
      // 1. ファイル名から推測（YYYY-MM-DD--host--slug → slug を人間可読に）
      // 2. または "(title missing)" として後で気づけるように
      const slugMatch = file.match(/^\d{4}-\d{2}-\d{2}--[^-]+?--(.+)\.md$/);
      if (slugMatch) {
        // slug をデコードして人間可読にする試み
        title = decodeURIComponent(slugMatch[1])
          .replace(/-/g, ' ')
          .replace(/_/g, ' ');
      } else {
        title = file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}--/, '');
      }
    }

    articles.push({
      file,
      relPath,
      date: dateStr,
      host,
      title,
      source_url: fm.source_url,
      tldr: fm.tldr || '',
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
  // 各日付内でファイル名順
  for (const list of map.values()) {
    list.sort((a, b) => a.file.localeCompare(b.file));
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

  const fileName = `${date}--AI-news.md`;
  const outPath = path.join(NEWS_DIR, fileName);

  const header = `# ${date}--AI-news\n\n`;
  const tableHeader = '| タイトル | 記事 | 引用元 |\n| --- | --- | --- |\n';

  const rows = list.map((art) => {
    // news/ から articles/ への相対パス
    const relPath = `../articles/${art.file}`;
    const titleText = escapeCell(art.title);  // frontmatter の日本語タイトル優先

    // Dラボ形式に完全一致 + Obsidian WikiLink化
    // タイトル列: [[articles/ファイル名|タイトル]]
    const titleCell = `[[articles/${art.file}|${titleText}]]`;
    // 記事列: [[articles/ファイル名|記事ページへ]]
    const articleCell = `[[articles/${art.file}|記事ページへ]]`;
    // 引用元列: [元記事](url) （外部リンクはMarkdown形式のまま）
    const citeCell = `[元記事](${art.source_url})`;

    return `| ${titleCell} | ${articleCell} | ${citeCell} |`;
  });

  const content = header + tableHeader + rows.join('\n') + '\n';

  await fs.writeFile(outPath, content, 'utf8');
  console.log(
    `[daily] wrote news/${fileName} (${list.length} articles, ${beforeCap} before host cap, ${MAX_PER_HOST}/host/day)`
  );
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
