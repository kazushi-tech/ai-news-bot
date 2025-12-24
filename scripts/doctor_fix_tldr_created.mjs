// scripts/doctor_fix_tldr_created.mjs
// frontmatter の tldr 行に created がくっついてしまったケースを修正する。
// 例:
// tldr: ...貢献します。created: 2025-11-08T00:00:00.000Z
// ↓
// tldr: ...貢献します。
// created: 2025-11-08T00:00:00.000Z

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEWS_ROOT =
  process.env.NEWS_ROOT || path.resolve(__dirname, "..", "ai-news");
const ARTICLES_DIR = path.join(NEWS_ROOT, "articles");

async function main() {
  console.log("[doctor-tldr-created] NEWS_ROOT   =", NEWS_ROOT);
  console.log("[doctor-tldr-created] ARTICLES_DIR =", ARTICLES_DIR);

  const entries = await fs.readdir(ARTICLES_DIR, { withFileTypes: true });

  let fixed = 0;
  let skipped = 0;

  for (const ent of entries) {
    if (!ent.isFile() || !ent.name.endsWith(".md")) continue;

    const filePath = path.join(ARTICLES_DIR, ent.name);
    const raw = await fs.readFile(filePath, "utf8");

    // frontmatter 部分だけ抜き出す
    const parts = raw.split(/^---\s*$/m);
    if (parts.length < 3) {
      skipped++;
      continue;
    }
    const [before, frontRaw, ...rest] = parts;
    let front = frontRaw;
    let updated = false;

    // frontmatter 内の NUL 文字を削除
    if (front.includes("\x00")) {
      front = front.replace(/\x00+/g, "");
      updated = true;
    }

    // tldr: ... created: 2025-xx の形式を分割する
    const re =
      /^tldr:\s*(.+?)\s*created:\s*([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9:.+\-Z]+)\s*$/m;

    const match = front.match(re);
    if (match) {
      const tldrText = match[1].trim();
      const createdVal = match[2].trim();

      front = front.replace(
        re,
        `tldr: ${tldrText}\ncreated: ${createdVal}`
      );
      updated = true;
    }

    if (!updated) {
      skipped++;
      continue;
    }

    const next = [before, front, ...rest].join("\n---\n");
    await fs.writeFile(filePath, next, "utf8");
    fixed++;
    console.log("[doctor-tldr-created] fixed:", ent.name);
  }

  console.log(
    `[doctor-tldr-created] done. fixed=${fixed}, skipped=${skipped}`
  );
}

main().catch((err) => {
  console.error("[doctor-tldr-created] ERROR", err);
  process.exit(1);
});
