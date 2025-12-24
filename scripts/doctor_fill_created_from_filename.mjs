// scripts/doctor_fill_created_from_filename.mjs
// ファイル名 YYYY-MM-DD--host--slug.md から created / date を補完する。
// すでに created or date があるものは一切触らない、安全運用。
// 実行例:
//   NEWS_ROOT=../ai-news node scripts/doctor_fill_created_from_filename.mjs

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEWS_ROOT =
  process.env.NEWS_ROOT ||
  path.resolve(__dirname, "..", "ai-news");

const ARTICLES_DIR = path.join(NEWS_ROOT, "articles");

async function main() {
  console.log("[doctor-created] NEWS_ROOT   =", NEWS_ROOT);
  console.log("[doctor-created] ARTICLES_DIR =", ARTICLES_DIR);

  const entries = await fs.readdir(ARTICLES_DIR, { withFileTypes: true });
  const files = entries
    .filter((ent) => ent.isFile() && ent.name.endsWith(".md"))
    .map((ent) => ent.name)
    .sort();

  let updated = 0;
  let skipped = 0;

  for (const file of files) {
    const m = /^(\d{4}-\d{2}-\d{2})--/.exec(file);
    if (!m) {
      console.warn("[doctor-created] ⚠️ filename has no date prefix:", file);
      skipped++;
      continue;
    }

    const datePart = m[1]; // YYYY-MM-DD
    const fullPath = path.join(ARTICLES_DIR, file);
    const raw = await fs.readFile(fullPath, "utf8");

    let parsed;
    try {
      parsed = matter(raw);
    } catch (err) {
      console.warn(
        "[doctor-created] ⚠️ YAML parse error, skip:",
        file,
        "-",
        err.message
      );
      skipped++;
      continue;
    }

    const fm = parsed.data || {};
    if (fm.created || fm.date) {
      skipped++;
      continue;
    }

    const iso = `${datePart}T00:00:00.000Z`;
    fm.created = iso;
    fm.date = iso;

    const nextContent = matter.stringify(parsed.content, fm);
    await fs.writeFile(fullPath, nextContent, "utf8");
    updated++;
    console.log(
      `[doctor-created] set created/date=${iso} for`,
      file
    );
  }

  console.log(
    `[doctor-created] done. updated=${updated}, skipped=${skipped}`
  );
}

main().catch((err) => {
  console.error("[doctor-created] ❌ unexpected error:", err);
  process.exitCode = 1;
});
