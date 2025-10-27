#!/usr/bin/env node
import fs from 'node:fs/promises';
import fssync from 'node:fs';
import path from 'node:path';
import { jstDateStr } from '../lib/utils.mjs';

const NEWS_DIR = 'news';

(async () => {
  const args = new Set(process.argv.slice(2));
  const files = (await fs.readdir(NEWS_DIR)).filter(f => f.endsWith('--AI-news.md')).sort().reverse();

  if (args.has('--weekly')) {
    await buildIndex(files, 7, 'index-weekly.md', '🗓 週間インデックス');
  }
  if (args.has('--monthly')) {
    await buildIndex(files, 31, 'index-monthly.md', '🗓 月間インデックス');
  }
})().catch(e => { console.error(e); process.exit(1); });

async function buildIndex(files, days, outName, title) {
  const now = Date.now();
  const pick = [];
  for (const f of files) {
    const date = f.slice(0, 10);
    const t = new Date(date + 'T00:00:00+09:00').getTime();
    if (now - t <= days * 86400000) pick.push(f);
  }
  const out = ['# ' + title, '', `**生成日**: ${jstDateStr()}`, ''].join('\n');
  let body = out;
  for (const f of pick.sort()) {
    const p = path.join(NEWS_DIR, f);
    const md = await fs.readFile(p, 'utf8');
    body += `\n## ${f.slice(0, 10)}\n\n` + md + '\n';
  }
  await fs.writeFile(path.join(NEWS_DIR, outName), body.trim() + '\n');
  console.log(`built ${outName} (${pick.length} days)`);
}
