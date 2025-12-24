#!/usr/bin/env node
// scripts/doctor_layout_simplify.mjs
// - 新テンプレ系の記事を「タイトル + 元記事callout + 重要なポイント + メモ」に統一する

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
  const front = text.slice(4, end); // '---\n' 以降
  const body = text.slice(end + 4); // '\n---' 以降
  return { front: front.trim(), body };
}

function isNewTemplate(body) {
  return (
    body.includes('## 概要') ||
    body.includes('## 抽出ポイント') ||
    body.includes('## 重要な示唆') ||
    body.includes('## リスク・未確定要素')
  );
}

function extractSection(body, heading) {
  const re = new RegExp(
    `^##\\s*${heading}\\s*[\\r\\n]+([\\s\\S]*?)(?=^##\\s+|^#\\s+|$)`,
    'm',
  );
  const m = body.match(re);
  return m ? m[1].trim() : '';
}

function guessTitle(data, fileName) {
  const url = typeof data.url === 'string' ? data.url : '';
  const sourceTitle =
    typeof data.source_title === 'string' ? data.source_title.trim() : '';

  if (sourceTitle) {
    return sourceTitle;
  }

  if (typeof data.title === 'string') {
    const t = data.title.trim();
    if (t && t !== '抽出ポイント' && !/^https?:\/\//i.test(t) && t !== '">-') {
      return t;
    }
  }

  if (url) {
    try {
      const u = new URL(url);
      const host = u.hostname;
      const segments = u.pathname.split('/').filter(Boolean);
      let last = segments[segments.length - 1] || '';

      last = last.replace(/\.(html?|md)$/i, '');
      last = decodeURIComponent(last);
      last = last.replace(/^\d{8,}-/, '');
      last = last.replace(/[-_]+/g, ' ');

      if (last) return `${last} (${host})`;
      return `${host} の記事`;
    } catch {
      // ignore
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

async function main() {
  console.log('[doctor-layout] NEWS_ROOT    =', NEWS_ROOT);
  console.log('[doctor-layout] ARTICLES_DIR =', ARTICLES_DIR);
  console.log('[doctor-layout] DRY_RUN      =', DRY_RUN);

  const entries = await fs.readdir(ARTICLES_DIR);
  const mdFiles = entries.filter((f) => f.endsWith('.md')).sort();

  let filesTouched = 0;

  for (const file of mdFiles) {
    const fullPath = path.join(ARTICLES_DIR, file);
    const raw = await fs.readFile(fullPath, 'utf8');
    const { front, body } = splitFrontMatter(raw);

    if (!front) {
      console.warn('[doctor-layout] no frontmatter in', file, '— skip');
      continue;
    }

    let doc;
    try {
      doc = YAML.parseDocument(front);
      if (doc.errors && doc.errors.length) {
        console.warn(
          '[doctor-layout] YAML parse error in',
          file,
          '— skip',
          doc.errors[0].message,
        );
        continue;
      }
    } catch (err) {
      console.warn(
        '[doctor-layout] YAML parse error in',
        file,
        '— skip',
        err.message,
      );
      continue;
    }

    const data = doc.toJSON() || {};
    const originalBody = body.trimStart();

    // 新テンプレ（概要/抽出ポイント/重要な示唆/リスク〜）じゃない記事は触らない
    if (!isNewTemplate(originalBody)) {
      continue;
    }

    const title = guessTitle(data, file);
    doc.set('title', title);

    const overview = extractSection(originalBody, '概要');
    const extractPoints = extractSection(originalBody, '抽出ポイント');
    const implications = extractSection(originalBody, '重要な示唆');
    const risks = extractSection(originalBody, 'リスク・未確定要素');
    const memo = extractSection(originalBody, 'メモ');

    const importantBlocks = [overview, extractPoints, implications, risks]
      .filter(Boolean)
      .join('\n\n')
      .trim();

    const url = typeof data.url === 'string' ? data.url : '';

    const lines = [];

    // H1 = 記事タイトル
    lines.push(`# ${title}`);
    lines.push('');
    if (url) {
      lines.push('> [!info] 元記事');
      lines.push(`> ${url}`);
      lines.push('');
    }
    lines.push('---');
    lines.push('');
    lines.push('## 重要なポイント');
    lines.push('');
    if (importantBlocks) {
      lines.push(importantBlocks);
      lines.push('');
    } else {
      lines.push('（後で追記）');
      lines.push('');
    }

    if (memo) {
      lines.push('## メモ');
      lines.push('');
      lines.push(memo.trim());
      lines.push('');
    }

    const newBody = lines.join('\n').replace(/\s+$/, '\n');

    filesTouched += 1;
    console.log('[doctor-layout] updated', file);

    if (!DRY_RUN) {
      const newFront = doc.toString().trimEnd();
      const next = `---\n${newFront}\n---\n\n${newBody}`;
      await fs.writeFile(fullPath, next, 'utf8');
    }
  }

  console.log('[doctor-layout] done. files_touched =', filesTouched);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
