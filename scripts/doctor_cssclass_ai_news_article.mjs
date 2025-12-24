// scripts/doctor_cssclass_ai_news_article.mjs
// ai-news/articles/ 以下の Markdown に
//   cssclass: ai-news-article
// をフロントマターへ自動付与する doctor。
// 既に cssclass がある場合は ai-news-article を追加し、
// すでに含まれていれば何もしない。
// フロントマターが無い場合は新規で付与する。
//
// 使い方：
//   cd ~/git-check/myapp/ai-news-bot
//   NEWS_ROOT=../ai-news node scripts/doctor_cssclass_ai_news_article.mjs

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ====== 設定 ======
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEWS_ROOT =
  process.env.NEWS_ROOT ||
  path.resolve(__dirname, "..", "ai-news");

const ARTICLES_DIR = path.join(NEWS_ROOT, "articles");

const TARGET_CLASS = "ai-news-article";

// ====== ユーティリティ ======
async function* walkDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkDir(full);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      yield full;
    }
  }
}

function ensureCssClassInFrontmatter(raw) {
  // frontmatter の有無を判定
  if (!raw.startsWith("---")) {
    // フロントマターがない場合は新規作成
    const fm =
      `---\n` +
      `cssclass: ${TARGET_CLASS}\n` +
      `---\n\n`;
    return {
      changed: true,
      content: fm + raw,
    };
  }

  // 先頭の --- から2個目の --- を探す
  const lines = raw.split(/\r?\n/);
  let secondIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      secondIndex = i;
      break;
    }
  }

  if (secondIndex === -1) {
    // 変な形式なら触らない
    return { changed: false, content: raw };
  }

  const fmLines = lines.slice(1, secondIndex);
  const bodyLines = lines.slice(secondIndex + 1);

  // cssclass 行を探す
  let cssIndex = fmLines.findIndex((l) =>
    l.trim().toLowerCase().startsWith("cssclass:")
  );

  if (cssIndex === -1) {
    // cssclass 自体がない → 新規追加
    fmLines.push(`cssclass: ${TARGET_CLASS}`);
  } else {
    const line = fmLines[cssIndex];
    const [, valueRaw = ""] = line.split(":", 2);
    const existing = valueRaw.trim();

    // 既に ai-news-article を含んでいたら何もしない
    const tokens = existing.split(/\s+/).filter(Boolean);
    if (tokens.includes(TARGET_CLASS)) {
      return { changed: false, content: raw };
    }

    // 既存の cssclass に ai-news-article を追加
    const newValue =
      existing.length > 0
        ? `${existing} ${TARGET_CLASS}`
        : TARGET_CLASS;
    fmLines[cssIndex] = `cssclass: ${newValue}`;
  }

  const newRaw =
    ["---", ...fmLines, "---", ...bodyLines].join("\n");

  if (newRaw === raw) {
    return { changed: false, content: raw };
  }

  return { changed: true, content: newRaw };
}

// ====== メイン処理 ======
async function main() {
  console.log("[cssclass] NEWS_ROOT   =", NEWS_ROOT);
  console.log("[cssclass] ARTICLES_DIR =", ARTICLES_DIR);

  let changedCount = 0;
  let skippedCount = 0;

  for await (const file of walkDir(ARTICLES_DIR)) {
    const raw = await fs.readFile(file, "utf8");
    const { changed, content } = ensureCssClassInFrontmatter(raw);

    if (!changed) {
      skippedCount++;
      // 詳細ログはうるさいので控えめに
      // console.log("[cssclass] skip:", path.basename(file));
      continue;
    }

    await fs.writeFile(file, content, "utf8");
    changedCount++;
    console.log("[cssclass] updated:", path.basename(file));
  }

  console.log(
    `[cssclass] done. updated=${changedCount}, skipped=${skippedCount}`
  );
}

main().catch((err) => {
  console.error("[cssclass] FATAL ERROR", err);
  process.exit(1);
});
