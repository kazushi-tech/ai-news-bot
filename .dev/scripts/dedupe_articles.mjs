#!/usr/bin/env node
/**
 * scripts/dedupe_articles.mjs
 * articles/*.md を source_url（なければ host+title_ja/title）で重複判定し、
 * 最も新しい1件だけ残して他は削除する。
 */
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), "..");
const ARTICLES = path.join(ROOT, "articles");

function keyFrom(data, fname) {
  const src = (data.source_url || "").split("#")[0].trim();
  if (src) return `src::${src}`;
  const host = (data.host || "").trim().toLowerCase();
  const title = String(data.title_ja || data.title || fname).trim().toLowerCase();
  return `ht::${host}::${title}`;
}

(async () => {
  await fs.mkdir(ARTICLES, { recursive: true });
  const names = (await fs.readdir(ARTICLES)).filter(n => n.endsWith(".md"));
  const groups = new Map();

  for (const n of names) {
    const full = path.join(ARTICLES, n);
    const md = await fs.readFile(full, "utf8");
    const { data } = matter(md);
    const key = keyFrom(data, n);
    const st = await fs.stat(full);
    const arr = groups.get(key) || [];
    arr.push({ file: full, mtimeMs: st.mtimeMs });
    groups.set(key, arr);
  }

  let removed = 0;
  for (const arr of groups.values()) {
    if (arr.length <= 1) continue;
    arr.sort((a, b) => b.mtimeMs - a.mtimeMs); // 新しい順
    for (const loser of arr.slice(1)) {
      await fs.unlink(loser.file).catch(() => {});
      console.log("removed", path.relative(ROOT, loser.file));
      removed++;
    }
  }
  console.log(`✅ de-duplicated: ${removed} files removed`);
})().catch(e => { console.error(e); process.exit(1); });
