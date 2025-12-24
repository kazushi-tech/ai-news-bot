// scripts/doctor_remove_legacy_callouts.mjs
// 目的:
//   ai-news/articles/ 以下の各 Markdown から
//   - [!tldr] / [tldr]
//   - [!cite] / [cite]
//   で始まる「旧式コールアウトブロック」をまるごと削除する。
//   frontmatter は一切いじらず、本⽂だけをクリーンにする。
//
// 使い方:
//   cd ~/git-check/myapp/ai-news-bot
//   NEWS_ROOT=../ai-news node scripts/doctor_remove_legacy_callouts.mjs

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const NEWS_ROOT =
  process.env.NEWS_ROOT ||
  path.resolve(__dirname, "..", "ai-news");

const ARTICLES_DIR = path.join(NEWS_ROOT, "articles");

// ===== frontmatter と本文をざっくり分離 =====
function splitFrontmatter(raw) {
  const normalized = raw.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  if (!lines[0].trim().startsWith("---")) {
    return { frontmatter: "", body: normalized };
  }

  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim().startsWith("---")) {
      endIndex = i;
      break;
    }
  }
  if (endIndex === -1) {
    return { frontmatter: "", body: normalized };
  }

  const fmBlock = lines.slice(0, endIndex + 1).join("\n"); // --- ... ---
  const body = lines.slice(endIndex + 1).join("\n");

  return { frontmatter: fmBlock, body };
}

// ===== [!tldr] / [!cite] ブロックを削除 =====
function stripLegacyCallouts(body) {
  const lines = body.split("\n");
  const out = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // [!tldr] / [tldr]
    if (/^\s*\[(?:!tldr|tldr)\]/i.test(line)) {
      i++; // この行を捨てる

      // 直後の「箇条書き or 引用 or テキスト」を TL;DR 部分として飛ばす
      while (i < lines.length) {
        const l = lines[i];

        // 次のセクション的なものが来たらそこでストップ
        if (/^\s*\[(?:!cite|cite)\]/i.test(l)) break; // cite は別処理へ
        if (/^\s*#/.test(l)) break; // 見出し
        if (/^\s*\[!/.test(l)) break; // 他の callout
        if (/^\s*---\s*$/.test(l)) break; // 区切り線

        // 空行だけ落として終了
        if (/^\s*$/.test(l)) {
          i++;
          break;
        }

        // 箇条書き / 引用行 / そのほか TL;DR っぽいテキストは全部スキップ
        if (/^\s*[-*]\s+/.test(l) || /^\s*>/.test(l)) {
          i++;
          continue;
        }

        // 普通のテキスト行も TL;DR とみなして飛ばす
        i++;
      }
      continue;
    }

    // [!cite] / [cite]
    if (/^\s*\[(?:!cite|cite)\]/i.test(line)) {
      i++; // この行を捨てる

      // 直後の URL 行があれば捨てる
      if (
        i < lines.length &&
        /^\s*https?:\/\//i.test(lines[i].trim())
      ) {
        i++;
      }

      // 空行が続くなら 1 行だけ落として終わり
      if (i < lines.length && /^\s*$/.test(lines[i])) {
        i++;
      }
      continue;
    }

    // それ以外の行はそのまま残す
    out.push(line);
    i++;
  }

  return out.join("\n");
}

// ===== メイン処理 =====

async function main() {
  console.log("[doctor-callouts] NEWS_ROOT   =", NEWS_ROOT);
  console.log("[doctor-callouts] ARTICLES_DIR =", ARTICLES_DIR);

  let files;
  try {
    files = await fs.readdir(ARTICLES_DIR);
  } catch (err) {
    console.error(
      "[doctor-callouts] ❌ ERROR: failed to read ARTICLES_DIR",
      err
    );
    process.exit(1);
  }

  const mdFiles = files.filter((f) => f.toLowerCase().endsWith(".md"));
  console.log(
    "[doctor-callouts] markdown articles found:",
    mdFiles.length
  );

  let updated = 0;
  let skipped = 0;

  for (const filename of mdFiles) {
    const fullPath = path.join(ARTICLES_DIR, filename);
    const raw = await fs.readFile(fullPath, "utf8");

    const { frontmatter, body } = splitFrontmatter(raw);
    const newBody = stripLegacyCallouts(body);

    if (newBody === body) {
      skipped++;
      continue;
    }

    const combined =
      frontmatter && frontmatter.trim()
        ? `${frontmatter}\n${newBody}`
        : newBody;

    await fs.writeFile(fullPath, combined, "utf8");
    updated++;
    console.log(
      `[doctor-callouts] updated: ${filename}`
    );
  }

  console.log(
    `[doctor-callouts] done. updated=${updated}, skipped=${skipped}`
  );
}

main().catch((err) => {
  console.error("[doctor-callouts] ❌ FATAL ERROR", err);
  process.exit(1);
});
