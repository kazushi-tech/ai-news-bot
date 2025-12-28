// scripts/build_index.mjs
// news/ai/INDEX.md を生成
// 最新の日次ファイルリンク一覧 + 直近N件のヘッドライン

import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

const AI_NEWS_DIR = process.env.AI_NEWS_DIR;
if (!AI_NEWS_DIR) {
  console.error('[index] ERROR: AI_NEWS_DIR is not set');
  process.exit(1);
}

const NEWS_DIR = path.join(AI_NEWS_DIR, 'news', 'ai');
const ARTICLES_DIR = path.join(AI_NEWS_DIR, 'articles');
const MAX_HEADLINES = Number(process.env.AI_NEWS_MAX_INDEX_ITEMS || '30');

console.log('[index] AI_NEWS_DIR =', AI_NEWS_DIR);
console.log('[index] NEWS_DIR =', NEWS_DIR);
console.log('[index] MAX_HEADLINES =', MAX_HEADLINES);

async function getDailyFiles() {
  try {
    const entries = await fs.readdir(NEWS_DIR, { withFileTypes: true });
    return entries
      .filter(e => e.isFile() && e.name.match(/^\d{4}-\d{2}-\d{2}-AI-news\.md$/))
      .map(e => e.name)
      .sort()
      .reverse();  // 新しい順
  } catch {
    return [];
  }
}

async function getRecentArticles() {
  try {
    const entries = await fs.readdir(ARTICLES_DIR, { withFileTypes: true });
    const files = entries
      .filter(e => e.isFile() && e.name.endsWith('.md'))
      .map(e => e.name)
      .sort()
      .reverse()
      .slice(0, MAX_HEADLINES);

    const articles = [];

    for (const file of files) {
      const fullPath = path.join(ARTICLES_DIR, file);
      let raw;
      try {
        raw = await fs.readFile(fullPath, 'utf8');
      } catch {
        continue;
      }

      const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
      if (!m) continue;

      let fm;
      try {
        fm = YAML.parse(m[1]);
      } catch {
        continue;
      }

      if (!fm) continue;

      // 日付抽出
      let dateStr = '';
      if (fm.created) {
        dateStr = String(fm.created).slice(0, 10);
      }
      if (!dateStr) {
        const m2 = file.match(/^(\d{4}-\d{2}-\d{2})--/);
        if (m2) dateStr = m2[1];
      }

      articles.push({
        file,
        title: fm.title || file,
        date: dateStr,
        source: fm.source || '',
        tldr: fm.tldr || '',
        source_url: fm.source_url || ''
      });
    }

    return articles;
  } catch {
    return [];
  }
}

async function main() {
  await fs.mkdir(NEWS_DIR, { recursive: true });

  const dailyFiles = await getDailyFiles();
  const articles = await getRecentArticles();

  const lines = [];

  // Frontmatter
  lines.push('---');
  lines.push('kind: ai-news-index');
  lines.push(`updated: ${new Date().toISOString().slice(0, 10)}`);
  lines.push('---');
  lines.push('');

  // タイトル
  lines.push('# AI News Index');
  lines.push('');

  // 日次ファイルリンク一覧（最新10件）
  lines.push('## 📅 日次まとめ');
  lines.push('');
  
  const recentDays = dailyFiles.slice(0, 10);
  if (recentDays.length > 0) {
    for (const file of recentDays) {
      const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
      const dateStr = dateMatch ? dateMatch[1] : file;
      lines.push(`- [[${file.replace('.md', '')}|${dateStr}]]`);
    }
  } else {
    lines.push('_まだ日次まとめはありません_');
  }
  lines.push('');

  // 直近N件のヘッドライン
  lines.push(`## 📰 最新ニュース（直近${MAX_HEADLINES}件）`);
  lines.push('');

  if (articles.length > 0) {
    lines.push('| 日付 | タイトル | ソース |');
    lines.push('| --- | --- | --- |');
    
    for (const art of articles) {
      const titleCell = art.title.replace(/\|/g, '\\|').replace(/\n/g, ' ');
      const dateCell = art.date || '-';
      const sourceCell = art.source.replace(/\|/g, '\\|');
      const link = `[[articles/${art.file}|${titleCell}]]`;
      lines.push(`| ${dateCell} | ${link} | ${sourceCell} |`);
    }
  } else {
    lines.push('_まだニュースはありません_');
  }
  lines.push('');

  // フッタ
  lines.push('---');
  lines.push(`_最終更新: ${new Date().toISOString()}_`);

  const content = lines.join('\n');
  const outPath = path.join(NEWS_DIR, 'INDEX.md');

  await fs.writeFile(outPath, content, 'utf8');
  console.log(`[index] wrote news/ai/INDEX.md (${dailyFiles.length} daily files, ${articles.length} headlines)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
