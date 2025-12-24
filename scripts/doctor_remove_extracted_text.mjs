// scripts/doctor_remove_extracted_text.mjs
// 記事ノートから「抽出テキスト」セクションを削除する doctor スクリプト。
// かなり限定的なパターンのみ削除し、他の構造は一切触らない。

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEWS_ROOT =
  process.env.NEWS_ROOT ||
  path.resolve(__dirname, "..", "ai-news");

const ARTICLES_DIR = path.join(NEWS_ROOT, "articles");

function removeExtractedSection(content) {
  const lines = content.split(/\r?\n/);
  let start = -1;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    // パターン1: 見出しとしての「抽出テキスト」
    if (trimmed.startsWith("##") && trimmed.includes("抽出テキスト")) {
      start = i;
      break;
    }

    // パターン2: callout 行
    if (
      trimmed.startsWith("> [!quote]") &&
      trimmed.includes("抽出テキスト")
    ) {
      start = i;
      break;
    }
  }

  if (start === -1) {
    return { content, changed: false };
  }

  // 終了位置 = 次の "## " 見出し or EOF
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith("## ") && !trimmed.includes("抽出テキスト")) {
      end = i;
      break;
    }
  }

  const newLines = [...lines.slice(0, start), ...lines.slice(end)];

  // 連続する空行を詰める（3行以上 → 2行）
  const joined = newLines.join("\n").replace(/\n{3,}/g, "\n\n");

  return { content: joined, changed: true };
}

async function main() {
  console.log("[doctor-remove-extracted] NEWS_ROOT   =", NEWS_ROOT);
  console.log("[doctor-remove-extracted] ARTICLES_DIR =", ARTICLES_DIR);

  let entries;
  try {
    entries = await fs.readdir(ARTICLES_DIR, { withFileTypes: true });
  } catch (err) {
    console.error("[doctor-remove-extracted] ❌ read dir error:", err);
    process.exitCode = 1;
    return;
  }

  const files = entries
    .filter((ent) => ent.isFile() && ent.name.endsWith(".md"))
    .map((ent) => ent.name);

  console.log(
    "[doctor-remove-extracted] markdown articles found:",
    files.length
  );

  let changedCount = 0;

  for (const file of files) {
    const fullPath = path.join(ARTICLES_DIR, file);
    let raw;
    try {
      raw = await fs.readFile(fullPath, "utf8");
    } catch (err) {
      console.warn(
        "[doctor-remove-extracted] ⚠️ read error:",
        file,
        "-",
        err.message
      );
      continue;
    }

    const { content: updated, changed } = removeExtractedSection(raw);

    if (!changed) continue;

    try {
      await fs.writeFile(fullPath, updated, "utf8");
      changedCount++;
      console.log(
        "[doctor-remove-extracted] cleaned:",
        file
      );
    } catch (err) {
      console.error(
        "[doctor-remove-extracted] ❌ write error:",
        file,
        "-",
        err.message
      );
    }
  }

  console.log(
    `[doctor-remove-extracted] done. changed=${changedCount}, total=${files.length}`
  );
}

main().catch((err) => {
  console.error("[doctor-remove-extracted] ❌ unexpected error:", err);
  process.exitCode = 1;
});
