#!/usr/bin/env node
// scripts/doctor_title_fix_from_url.mjs
// - frontmatter.title が空 / "抽出ポイント" / URL / "">-"" みたいなゴミのとき
//   URL やファイル名からそこそこマシなタイトルを再設定する

import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

const NEWS_ROOT =
  process.env.NEWS_ROOT || path.resolve(process.cwd(), '../ai-news');
const ARTICLES_DIR = path.join(NEWS_ROOT, 'articles');
const DRY_RUN = process.argv.includes('--dry-run');

function splitFrontMatter(text) {
  if (!text.startsWith('---')) {
    return { front: null, body: text };
  }
  const end = text.indexOf('\n---', 3);
  if (end === -1) {
    return { front: null, body: text };
  }
  const front = text.slice(4, end); // skip '---\n'
  const body = text.slice(end + 4); // skip '\n---'
  return { front: front.trim(), body };
}

function guessTitle(data, fileName) {
  const url = typeof data.url === 'string' ? data.url : '';
  const sourceTitle =
    typeof data.source_title === 'string' ? data.source_title.trim() : '';

  if (sourceTitle) {
    return sourceTitle;
  }

  if (url) {
    try {
      const u = new URL(url);
      const host = u.hostname;
      const segments = u.pathname.split('/').filter(Boolean);
      let last = segments[segments.length - 1] || '';

      last = last.replace(/\.(html?|md)$/i, '');
      last = decodeURIComponent(last);
      last = last.replace(/^\d{8,}-/, ''); // 先頭の日付っぽい部分を削除
      last = last.replace(/[-_]+/g, ' ');

      if (last) return `${last} (${host})`;
      return `${host} の記事`;
    } catch {
      // URL パース失敗時はファイル名にフォールバック
    }
  }

  const parts = fileName.replace(/\.md$/i, '').split('--');
  const host = parts[1] || '';
  let slug = parts[2] || '';
  slug = slug.replace(/^\d{8,}-/, '');
  slug = slug.replace(/[-_]+/g, ' ');

  if (slug) return `${slug} (${host})`;
  if (host) return `${host} の記事`;
  return '記事';
}

function isBadTitle(title) {
  if (!title) return true;
  const t = title.trim();
  if (!t) return true;
  if (t === '抽出ポイント') return true;
  if (t === '">-') return true;
  if (/^https?:\/\//i.test(t)) return true;
  return false;
}

async function main() {
  console.log('[doctor-title-fix] NEWS_ROOT    =', NEWS_ROOT);
  console.log('[doctor-title-fix] ARTICLES_DIR =', ARTICLES_DIR);
  console.log('[doctor-title-fix] DRY_RUN      =', DRY_RUN);

  const entries = await fs.readdir(ARTICLES_DIR);
  const mdFiles = entries.filter((f) => f.endsWith('.md')).sort();

  let filesTouched = 0;

  for (const file of mdFiles) {
    const fullPath = path.join(ARTICLES_DIR, file);
    const raw = await fs.readFile(fullPath, 'utf8');
    const { front, body } = splitFrontMatter(raw);

    if (!front) {
      console.warn(
        '[doctor-title-fix] no frontmatter in',
        file,
        '— skip',
      );
      continue;
    }

    let doc;
    try {
      doc = YAML.parseDocument(front);
      if (doc.errors && doc.errors.length) {
        console.warn(
          '[doctor-title-fix] YAML parse error in',
          file,
          '— skip',
          doc.errors[0].message,
        );
        continue;
      }
    } catch (err) {
      console.warn(
        '[doctor-title-fix] YAML parse error in',
        file,
        '— skip',
        err.message,
      );
      continue;
    }

    const data = doc.toJSON() || {};
    const currentTitle = (data.title ?? '').toString().trim();

    if (!isBadTitle(currentTitle)) {
      continue; // まともな title は触らない
    }

    const newTitle = guessTitle(data, file);
    doc.set('title', newTitle);

    filesTouched += 1;
    console.log(
      `[doctor-title-fix] set title in ${file} -> ${JSON.stringify(newTitle)}`,
    );

    if (!DRY_RUN) {
      const newFront = doc.toString().trimEnd();
      const next =
        `---\n${newFront}\n---\n\n` + body.trimStart().replace(/\s+$/, '\n');
      await fs.writeFile(fullPath, next, 'utf8');
    }
  }

  console.log('[doctor-title-fix] done. files_touched =', filesTouched);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
