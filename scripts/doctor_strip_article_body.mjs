// scripts/doctor_strip_article_body.mjs
// 役割:
// - 記事末尾の「抽出テキスト」ブロックの削除
// - [!tldr] / [!cite] コールアウト削除
// - 末尾の「抽出ポイント / 重要な示唆 / リスク・未確定要素 / メモ」ダミー削除
// - Source URL 行削除
// - さらに「# タイトル」と「## 概要」の間をまるごと削除（タイトル直後に概要を置く）

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..", "..");
const AI_NEWS_DIR =
  process.env.AI_NEWS_DIR || path.resolve(ROOT_DIR, "ai-news");
const ARTICLES_DIR = path.join(AI_NEWS_DIR, "articles");

// -------------------------------------------------------------
// CLI
// -------------------------------------------------------------
function parseArgs(argv) {
  let dryRun = false;
  let verbose = false;

  for (const arg of argv) {
    if (arg === "--dry-run") dryRun = true;
    if (arg === "--verbose") verbose = true;
  }

  return { dryRun, verbose };
}

// -------------------------------------------------------------
// frontmatter 分離
// -------------------------------------------------------------
function splitFrontmatter(content) {
  const fmMatch = content.match(/^---\n[\s\S]*?\n---\n/);
  if (!fmMatch) {
    return { frontmatter: "", body: content };
  }
  const frontmatter = fmMatch[0];
  const body = content.slice(frontmatter.length);
  return { frontmatter, body };
}

// -------------------------------------------------------------
// 1) 「抽出テキスト」系ブロック削除
// -------------------------------------------------------------
function removeExtractedTextBlocks(body) {
  let removed = 0;
  let txt = body;

  const blockquoteRe =
    /(\n{0,2}>[^\n]*(抽出テキスト|スクレイピング済み本文|extracted text)[^\n]*\n(?:>[^\n]*\n)*)/gi;
  txt = txt.replace(blockquoteRe, () => {
    removed++;
    return "\n\n";
  });

  const headingRe =
    /(\n{0,2}#{1,6}[^\n]*(抽出テキスト|スクレイピング済み本文|extracted text)[^\n]*\n[\s\S]*?(?=\n#{1,6} |\n---\n|$))/gi;
  txt = txt.replace(headingRe, () => {
    removed++;
    return "\n\n";
  });

  const paragraphRe =
    /(\n{0,2}(抽出テキスト|スクレイピング済み本文|extracted text)[^\n]*\n[\s\S]*?(?=\n#{1,6} |\n---\n|$))/gi;
  txt = txt.replace(paragraphRe, () => {
    removed++;
    return "\n\n";
  });

  return { body: txt, removed };
}

// -------------------------------------------------------------
// 2) [!tldr] / [!cite] コールアウト削除
// -------------------------------------------------------------
function removeTldrAndCiteCallouts(body) {
  const lines = body.split(/\r?\n/);
  const out = [];
  let removed = 0;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*>?\s*\[!(tldr|cite)\b/i.test(line)) {
      removed++;
      i++;
      // 以降の「> で始まる行」をまとめてスキップ
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        i++;
      }
      // 直後の空行も 1〜2 行くらいはついでにスキップ
      while (i < lines.length && lines[i].trim() === "") {
        i++;
      }
      continue;
    }

    out.push(line);
    i++;
  }

  return { body: out.join("\n"), removed };
}

// -------------------------------------------------------------
// 3) 末尾ダミー & Source URL 削除
// -------------------------------------------------------------
function removeBottomStubsAndSourceUrl(body) {
  let txt = body;
  let removed = 0;

  // 末尾の「抽出ポイント / 重要な示唆 / リスク・未確定要素 / メモ（後で追記）」まとめ
  const stubRe =
    /\n## 抽出ポイント[\s\S]*?（後で追記）[\s\S]*$/;
  if (stubRe.test(txt)) {
    txt = txt.replace(stubRe, "\n");
    removed++;
  }

  // Source URL: ... 行
  const sourceUrlRe = /\n?Source URL:\s*https?:[^\n]*\n?/i;
  if (sourceUrlRe.test(txt)) {
    txt = txt.replace(sourceUrlRe, "\n");
    removed++;
  }

  return { body: txt, removed };
}

// -------------------------------------------------------------
// 4) 「# タイトル」〜「## 概要」の間を削除
// -------------------------------------------------------------
function removeBetweenTitleAndGaiyou(body) {
  // 先頭の H1 と最初の「## 概要」の間
  const re = /(^# .+?\n)([\s\S]*?)(\n## 概要[^\n]*\n)/m;
  const match = body.match(re);
  if (!match) {
    return { body, removed: 0 };
  }

  const before = body.slice(0, match.index);
  const after = body.slice(match.index + match[0].length);

  // H1行 + 「## 概要」行 だけ残し、その間は捨てる
  const newBody = before + match[1] + match[3] + after;
  return { body: newBody, removed: 1 };
}

// -------------------------------------------------------------
// 本文クリーニング一括
// -------------------------------------------------------------
function cleanArticleBody(body) {
  let totalRemoved = 0;
  let txt = body;

  const r1 = removeExtractedTextBlocks(txt);
  txt = r1.body;
  totalRemoved += r1.removed;

  const r2 = removeTldrAndCiteCallouts(txt);
  txt = r2.body;
  totalRemoved += r2.removed;

  const r3 = removeBottomStubsAndSourceUrl(txt);
  txt = r3.body;
  totalRemoved += r3.removed;

  const r4 = removeBetweenTitleAndGaiyou(txt);
  txt = r4.body;
  totalRemoved += r4.removed;

  // 空行整理
  txt = txt.replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";

  return { cleanedBody: txt, removedCount: totalRemoved };
}

// -------------------------------------------------------------
// ファイル処理
// -------------------------------------------------------------
async function cleanFile(filepath, { dryRun, verbose }) {
  const original = await fs.readFile(filepath, "utf8");
  const { frontmatter, body } = splitFrontmatter(original);

  const { cleanedBody, removedCount } = cleanArticleBody(body);

  if (removedCount === 0) {
    if (verbose) {
      console.log(
        `[doctor] no changes in ${path.basename(filepath)}`
      );
    }
    return { changed: false, removedCount: 0 };
  }

  const newContent = frontmatter + cleanedBody;

  if (!dryRun && newContent !== original) {
    await fs.writeFile(filepath, newContent, "utf8");
  }

  if (verbose) {
    console.log(
      `[doctor] cleaned ${path.basename(
        filepath
      )} (removed ${removedCount} blocks)`
    );
  } else {
    console.log(`[doctor] cleaned ${path.basename(filepath)}`);
  }

  return { changed: true, removedCount };
}

async function collectMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = await collectMarkdownFiles(fullPath);
      files.push(...sub);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

// -------------------------------------------------------------
// メイン
// -------------------------------------------------------------
async function main() {
  const { dryRun, verbose } = parseArgs(process.argv.slice(2));

  console.log("[doctor] AI_NEWS_DIR =", AI_NEWS_DIR);
  console.log("[doctor] ARTICLES_DIR =", ARTICLES_DIR);
  console.log("[doctor] dry-run      =", dryRun);
  console.log("[doctor] verbose      =", verbose);

  const files = await collectMarkdownFiles(ARTICLES_DIR);
  console.log(`[doctor] target markdown files = ${files.length}`);

  let cleanedFiles = 0;
  let totalRemovedBlocks = 0;

  for (const file of files) {
    const rel = path.relative(AI_NEWS_DIR, file);
    try {
      const { changed, removedCount } = await cleanFile(file, {
        dryRun,
        verbose
      });
      if (changed) cleanedFiles++;
      totalRemovedBlocks += removedCount;
    } catch (err) {
      console.error(`[doctor] ERROR while cleaning ${rel}:`, err.message);
    }
  }

  console.log(
    `[doctor] done. cleaned ${cleanedFiles} files, removed ${totalRemovedBlocks} blocks.`
  );

  if (dryRun) {
    console.log("[doctor] (dry-run mode: no files were actually modified)");
  }
}

main().catch((err) => {
  console.error("[doctor] fatal error:", err);
  process.exit(1);
});
