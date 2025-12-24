#!/usr/bin/env node
// scripts/doctor_add_source_url.mjs
// url キーはあるが source_url キーが無い記事に source_url を追加する

import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const DRY_RUN = process.argv.includes('--dry-run');

const NEWS_ROOT = process.env.NEWS_ROOT
  ? path.resolve(process.cwd(), process.env.NEWS_ROOT)
  : path.resolve(process.cwd(), '..', 'ai-news');

const ARTICLES_DIR = path.resolve(NEWS_ROOT, 'articles');

console.log(`[doctor-add-source-url] NEWS_ROOT    = ${NEWS_ROOT}`);
console.log(`[doctor-add-source-url] ARTICLES_DIR = ${ARTICLES_DIR}`);
console.log(`[doctor-add-source-url] DRY_RUN      = ${DRY_RUN}`);

async function main() {
  const entries = await fs.readdir(ARTICLES_DIR, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith('.md'))
    .map((e) => e.name);

  console.log(`[doctor-add-source-url] total files: ${files.length}`);

  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const fullPath = path.join(ARTICLES_DIR, file);

    let raw;
    try {
      raw = await fs.readFile(fullPath, 'utf8');
    } catch (err) {
      console.error(
        `[doctor-add-source-url] read error in ${file}: ${err.message}`
      );
      errors++;
      continue;
    }

    let parsed;
    try {
      parsed = matter(raw);
    } catch (err) {
      console.warn(
        `[doctor-add-source-url] YAML parse error in ${file}: ${err.message} — skip`
      );
      errors++;
      continue;
    }

    const fm = parsed.data;

    // すでに source_url がある → スキップ
    if (fm.source_url) {
      skipped++;
      continue;
    }

    // url キーがある → source_url にコピー
    if (fm.url) {
      fm.source_url = fm.url;
      fixed++;

      console.log(
        `[doctor-add-source-url] added source_url to articles/${file}`
      );

      if (!DRY_RUN) {
        const output = matter.stringify(parsed.content, fm, {
          lineWidth: 0,
        });
        await fs.writeFile(fullPath, output, 'utf8');
      }
    } else {
      // url も無い → 警告
      console.warn(
        `[doctor-add-source-url] no url/source_url in ${file} — can't fix`
      );
      errors++;
    }
  }

  console.log(
    `[doctor-add-source-url] done. fixed=${fixed}, skipped=${skipped}, errors=${errors}`
  );

  if (DRY_RUN) {
    console.log(
      '[doctor-add-source-url] DRY_RUN enabled. Re-run without --dry-run to apply changes.'
    );
  }
}

main().catch((err) => {
  console.error('[doctor-add-source-url] fatal error', err);
  process.exit(1);
});
