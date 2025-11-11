#!/usr/bin/env node
// migrate_old_summary_to_articles.mjs
// summary/<任意の下位フォルダ>/<YYYY-MM-DD>--<slug>.md を articles/ にフラット移行（既存はスキップ）

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), "..");
const SUMMARY = path.join(ROOT, "summary");
const ARTICLES = path.join(ROOT, "articles");

async function walk(dir) {
  const out = [];
  for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...await walk(p));
    else out.push(p);
  }
  return out;
}

async function main() {
  await fs.mkdir(ARTICLES, { recursive: true });
  try {
    await fs.access(SUMMARY);
  } catch {
    console.log("no summary/; skip");
    return;
  }

  const files = (await walk(SUMMARY))
    .filter((f) => f.endsWith(".md"))
    .filter((f) => /\d{4}-\d{2}-\d{2}--.+\.md$/.test(path.basename(f)));

  let copied = 0, skipped = 0;
  for (const src of files) {
    const dest = path.join(ARTICLES, path.basename(src));
    try {
      await fs.access(dest);
      skipped++;
      continue;
    } catch {}
    const md = await fs.readFile(src, "utf8");
    await fs.writeFile(dest, md, "utf8");
    console.log("migrated ->", path.relative(ROOT, dest));
    copied++;
  }
  console.log(`✅ migrated: ${copied} copied, ${skipped} skipped`);
}

main().catch((e) => { console.error(e); process.exit(1); });
