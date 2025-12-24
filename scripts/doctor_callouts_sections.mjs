// scripts/doctor_callouts_sections.mjs
// 長文記事の「抽出ポイント」「重要な示唆」「リスク・未確定要素」「メモ」などを
// 自動でコールアウト化して、読みやすくする doctor。
//
// 想定パターン（例）:
//
// ## 抽出ポイント
//
// - 〜〜〜
// - 〜〜〜
//
// ↓↓↓
//
// > [!note] 抽出ポイント
// > - 〜〜〜
// > - 〜〜〜
//
// すでに [!note] などのコールアウトがある場合はスキップする。

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ai-news リポジトリのルート
const NEWS_ROOT =
  process.env.NEWS_ROOT ||
  path.resolve(__dirname, "..", "..", "ai-news");

// 記事ディレクトリ
const ARTICLES_DIR = path.join(NEWS_ROOT, "articles");

// ---------- ユーティリティ ----------

// ファイル一覧
async function listArticleFiles() {
  try {
    const entries = await fs.readdir(ARTICLES_DIR, { withFileTypes: true });
    return entries
      .filter((ent) => ent.isFile() && ent.name.endsWith(".md"))
      .map((ent) => ent.name)
      .sort();
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error("[callouts] articles/ ディレクトリがありません:", ARTICLES_DIR);
      return [];
    }
    throw err;
  }
}

// セクションをコールアウト化するヘルパー
function wrapSectionToCallout(content, heading, calloutType, { requireList } = {}) {
  // ^## 見出し 〜 次の ## or EOF までをキャプチャ
  const pattern = new RegExp(
    String.raw`(^## ${heading}\s*\n)([\s\S]*?)(?=^## |\Z)`,
    "m"
  );

  return content.replace(pattern, (match, headingLine, bodyBlock) => {
    const original = match;

    const trimmed = bodyBlock.trim();
    if (!trimmed) {
      // 中身が無ければそのまま
      return original;
    }

    // すでにコールアウト化されている（先頭に > [!xxx] がある）場合はスキップ
    if (/^\s*>\s*\[!/.test(trimmed)) {
      return original;
    }

    // 箇条書き前提のセクションなら、先頭が "- " でなければ触らない
    if (requireList && !/^-\s+/.test(trimmed)) {
      return original;
    }

    // 本文行を ">" 付きに変換
    const lines = trimmed.split(/\r?\n/);
    const calloutLines = [];

    calloutLines.push(`> [!${calloutType}] ${heading}`);
    for (const line of lines) {
      if (line.trim() === "") {
        calloutLines.push(">");
      } else {
        calloutLines.push(`> ${line}`);
      }
    }

    // 前後に空行を入れて戻す
    const replaced = calloutLines.join("\n") + "\n\n";
    return replaced;
  });
}

// 1ファイル処理
function processContentForCallouts(raw) {
  let out = raw;

  // 抽出ポイント → note
  out = wrapSectionToCallout(out, "抽出ポイント", "note", { requireList: true });

  // 重要な示唆 → tip
  out = wrapSectionToCallout(out, "重要な示唆", "tip", { requireList: true });

  // リスク・未確定要素 → warning
  out = wrapSectionToCallout(out, "リスク・未確定要素", "warning", { requireList: true });

  // メモ → info
  out = wrapSectionToCallout(out, "メモ", "info", { requireList: true });

  return out;
}

async function processOneFile(fileName) {
  const fullPath = path.join(ARTICLES_DIR, fileName);
  const raw = await fs.readFile(fullPath, "utf8");

  const updated = processContentForCallouts(raw);

  if (updated === raw) {
    console.log(`[callouts] no change: ${fileName}`);
    return;
  }

  await fs.writeFile(fullPath, updated, "utf8");
  console.log(`[callouts] updated: ${fileName}`);
}

// ---------- メイン ----------

async function main() {
  console.log("[callouts] NEWS_ROOT   =", NEWS_ROOT);
  console.log("[callouts] ARTICLES_DIR =", ARTICLES_DIR);

  const files = await listArticleFiles();
  if (!files.length) {
    console.log("[callouts] 対象記事がありません");
    return;
  }

  for (const file of files) {
    try {
      await processOneFile(file);
    } catch (err) {
      console.error(`[callouts] error on ${file}:`, err.message);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
