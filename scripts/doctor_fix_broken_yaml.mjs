#!/usr/bin/env node
// scripts/doctor_fix_broken_yaml.mjs

import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const DRY_RUN = process.argv.includes('--dry-run');

const NEWS_ROOT = process.env.NEWS_ROOT
  ? path.resolve(process.cwd(), process.env.NEWS_ROOT)
  : path.resolve(process.cwd(), '..', 'ai-news');

const ARTICLES_DIR = path.resolve(NEWS_ROOT, 'articles');

console.log(`[doctor-fix-yaml] NEWS_ROOT    = ${NEWS_ROOT}`);
console.log(`[doctor-fix-yaml] ARTICLES_DIR = ${ARTICLES_DIR}`);
console.log(`[doctor-fix-yaml] DRY_RUN      = ${DRY_RUN}`);

const SPLIT_KEYS = ['kind', 'model', 'cssclass', 'ホスト'];

async function main() {
  const entries = await fs.readdir(ARTICLES_DIR, { withFileTypes: true });
  const files = entries.filter(e => e.isFile() && e.name.endsWith('.md')).map(e => e.name);

  console.log(`[doctor-fix-yaml] markdown articles found: ${files.length}`);

  let touched = 0;
  let stillBroken = 0;

  for (const file of files) {
    const fullPath = path.join(ARTICLES_DIR, file);
    let raw = await fs.readFile(fullPath, 'utf8');

    // すでに parse できるならスキップ
    try {
      matter(raw);
      continue;
    } catch {
      // 壊れているので修復を試みる
    }

    const fixed = fixFrontmatter(raw, file);
    if (!fixed) {
      console.warn(`[doctor-fix-yaml] cannot locate frontmatter in ${file} — skip`);
      continue;
    }

    let reparsed;
    try {
      reparsed = matter(fixed);
    } catch (err) {
      console.warn(
        `[doctor-fix-yaml] still YAML parse error in ${file} — ${err.message}`
      );
      stillBroken++;
      continue;
    }

    touched++;
    console.log(`[doctor-fix-yaml] fixed YAML in articles/${file}`);

    if (!DRY_RUN) {
      const out = matter.stringify(reparsed.content, reparsed.data, {
        lineWidth: 0,
      });
      await fs.writeFile(fullPath, out, 'utf8');
    }
  }

  console.log(
    `[doctor-fix-yaml] done. files_touched=${touched}, still_broken=${stillBroken}`
  );
}

/**
 * フロントマター部分だけ行ベースで書き換え
 */
function fixFrontmatter(raw, fileName) {
  const lines = raw.split('\n');
  if (lines[0].trim() !== '---') return null;

  let endIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      endIdx = i;
      break;
    }
  }
  if (endIdx === -1) return null;

  const yamlLines = lines.slice(1, endIdx);
  const bodyLines = lines.slice(endIdx + 1);

  const fixedYamlLines = [];

  for (let line of yamlLines) {
    let l = line;

    // 途中に key がくっ付いているパターンを分割
    for (const key of SPLIT_KEYS) {
      const token = `${key}:`;
      const idx = l.indexOf(token);
      if (idx > 0) {
        const before = l.slice(0, idx).trim();
        const after = l.slice(idx).trim();
        if (before) {
          fixedYamlLines.push(`# ${before}`);
        }
        l = after;
        break;
      }
    }

    // title: > [!info] 元記事 みたいなやつ
    if (/^title:\s*>\s*\[!info\]/.test(l)) {
      fixedYamlLines.push('title: ""');
      fixedYamlLines.push('# [!info] 元記事');
      continue;
    }

    // title: 値 にコロンが入ってるのにクォートされてない
    const mTitleColon = l.match(/^title:\s*(?!["'])(.*:.*)$/);
    if (mTitleColon) {
      const value = mTitleColon[1].trim();
      const escaped = value.replace(/"/g, '\\"');
      fixedYamlLines.push(`title: "${escaped}"`);
      continue;
    }

    // model: '' このあとに日本語説明が続いている
    const mModelJp = l.match(/^(model:\s*''?)(\s+.+)$/);
    if (mModelJp) {
      fixedYamlLines.push(mModelJp[1]);
      fixedYamlLines.push(`#${mModelJp[2]}`);
      continue;
    }

    // cssclass: ai-news-article の前に文章がくっ付いている
    if (!/^\s*cssclass:/.test(l) && /cssclass:\s*ai-news-article/.test(l)) {
      const idx = l.indexOf('cssclass:');
      const before = l.slice(0, idx).trim();
      const after = l.slice(idx).trim();
      if (before) fixedYamlLines.push(`# ${before}`);
      fixedYamlLines.push(after);
      continue;
    }

    // ホスト: xxx というキーは丸ごとコメントアウト
    if (/^\s*ホスト:/.test(l)) {
      fixedYamlLines.push(`# ${l.trim()}`);
      continue;
    }

    // その他はそのまま
    fixedYamlLines.push(l);
  }

  const rebuilt = [
    '---',
    ...fixedYamlLines,
    '---',
    ...bodyLines,
  ].join('\n');

  return rebuilt;
}

main().catch(err => {
  console.error('[doctor-fix-yaml] fatal error', err);
  process.exit(1);
});
