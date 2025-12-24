// scripts/doctor_cleanup_article_tail.mjs
// 記事ページ末尾に残っている旧テンプレート
// （--- のあとに Source URL / 重要なポイント / メモ が並ぶブロック）を削除する。

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NEWS_ROOT =
  process.env.NEWS_ROOT || path.resolve(__dirname, "..", "ai-news");
const ARTICLES_DIR = path.join(NEWS_ROOT, "articles");

const CUT_MARK = "\n---\n\nSource URL:";

async function main() {
  console.log("[cleanup-tail] NEWS_ROOT   =", NEWS_ROOT);
  console.log("[cleanup-tail] ARTICLES_DIR =", ARTICLES_DIR);

  const entries = await fs.readdir(ARTICLES_DIR, { withFileTypes: true });

  let touched = 0;
  let skipped = 0;

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;

    const filePath = path.join(ARTICLES_DIR, entry.name);
    const raw = await fs.readFile(filePath, "utf8");

    const idx = raw.indexOf(CUT_MARK);
    if (idx === -1) {
      skipped++;
      continue;
    }

    const keepPart = raw.slice(0, idx).trimEnd() + "\n";
    if (keepPart === raw) {
      skipped++;
      continue;
    }

    await fs.writeFile(filePath, keepPart, "utf8");
    touched++;
    console.log("[cleanup-tail] cleaned:", entry.name);
  }

  console.log(
    `[cleanup-tail] done. cleaned=${touched}, skipped=${skipped}`
  );
}

main().catch((err) => {
  console.error("[cleanup-tail] ERROR:", err);
  process.exit(1);
});
