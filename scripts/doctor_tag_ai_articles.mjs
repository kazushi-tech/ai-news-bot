#!/usr/bin/env node
// scripts/doctor_tag_ai_articles.mjs

import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const DRY_RUN = process.argv.includes('--dry-run');

const NEWS_ROOT = process.env.NEWS_ROOT
  ? path.resolve(process.cwd(), process.env.NEWS_ROOT)
  : path.resolve(process.cwd(), '..', 'ai-news');

const ARTICLES_DIR = path.resolve(NEWS_ROOT, 'articles');

console.log(`[doctor-tag-ai] NEWS_ROOT    = ${NEWS_ROOT}`);
console.log(`[doctor-tag-ai] ARTICLES_DIR = ${ARTICLES_DIR}`);
console.log(`[doctor-tag-ai] DRY_RUN      = ${DRY_RUN}`);

const AI_KEYWORDS = new RegExp(
  [
    '\\bAI\\b',
    'ＡＩ',
    '人工知能',
    '\\bLLM\\b',
    '大規模言語モデル',
    '生成AI',
    '生成ＡＩ',
    '生成モデル',
    'ニューラルネットワーク',
    'ディープラーニング',
    'Transformer',
    'トランスフォーマー',
    'ChatGPT',
    'Gemini',
    'Claude',
    'Sora',
    'Stable Diffusion',
    'Midjourney',
    'nano banana',
    'ナノバナナ',
  ].join('|'),
  'i'
);

const AI_HOST_HINT = [
  'openai.com',
  'anthropic.com',
  'deepmind',
  'ai.google',
  'blog.research.google',
  'stability.ai',
];

async function main() {
  const entries = await fs.readdir(ARTICLES_DIR, { withFileTypes: true });
  const files = entries.filter(e => e.isFile() && e.name.endsWith('.md')).map(e => e.name);

  console.log(`[doctor-tag-ai] markdown articles found: ${files.length}`);

  let touched = 0;
  let tagged = 0;

  for (const file of files) {
    const fullPath = path.join(ARTICLES_DIR, file);
    const raw = await fs.readFile(fullPath, 'utf8');

    let parsed;
    try {
      parsed = matter(raw);
    } catch (err) {
      console.warn(
        `[doctor-tag-ai] YAML parse error in articles/${file} — skip ${err.message}`
      );
      continue;
    }

    const data = parsed.data ?? {};
    let tags = normaliseTags(data.tags);

    if (tags.includes('ai')) {
      continue;
    }

    const host = (data.host || data.source || '').toString().toLowerCase();
    const url = (data.url || data.source_url || '').toString();

    const textParts = [
      file,
      data.title || '',
      data.headline || '',
      data.tldr || '',
      (parsed.content || '').slice(0, 800),
      url,
    ];

    const haystack = textParts.join('\n');

    const looksLikeAI =
      AI_KEYWORDS.test(haystack) ||
      AI_HOST_HINT.some(h => host.includes(h)) ||
      /(?:^|[-_])ai(?:[-_]|$)/i.test(file);

    if (!looksLikeAI) {
      continue;
    }

    tags.push('ai');
    data.tags = Array.from(new Set(tags));

    touched++;
    tagged++;
    console.log(`[doctor-tag-ai] tagged ai in articles/${file}`);

    if (!DRY_RUN) {
      const out = matter.stringify(parsed.content, data, { lineWidth: 0 });
      await fs.writeFile(fullPath, out, 'utf8');
    }
  }

  console.log(
    `[doctor-tag-ai] done. files_touched=${touched}, tagged_ai=${tagged}`
  );
}

function normaliseTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(t => String(t).trim()).filter(Boolean);
  return String(tags)
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);
}

main().catch(err => {
  console.error('[doctor-tag-ai] fatal error', err);
  process.exit(1);
});
