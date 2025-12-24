// scripts/doctor_strip_legacy_tldr_and_cite.mjs
// 既存記事から [!tldr] / [!cite] ブロックと
// タイトルより上のゴミを削除する doctor。
// build_index_daily.mjs には一切触らない。

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEWS_ROOT =
  process.env.NEWS_ROOT || path.resolve(__dirname, "..", "ai-news");
const ARTICLES_DIR = path.join(NEWS_ROOT, "articles");

async function readAllMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await readAllMarkdownFiles(full)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(full);
    }
  }
  return files;
}

function splitFrontmatter(text) {
  const fmMatch = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!fmMatch) return { frontmatter: "", body: text };

  const fm = fmMatch[0];
  const body = text.slice(fm.length);
  return { frontmatter: fm, body };
}

function cleanupBody(body) {
  // 1) タイトル(# )より上を全部落とす
  let idx = body.indexOf("\n# ");
  if (body.trimStart().startsWith("# ")) {
    idx = body.indexOf("# ");
  }
  if (idx !== -1) {
    body = body.slice(idx);
  }

  // 2) [!tldr] / [!cite] のコールアウトブロック削除
  //   「> [!tldr] ...」から始まり、「> 」行が続くブロックを丸ごと消す
  const patterns = ["tldr", "cite"];
  for (const key of patterns) {
    const re = new RegExp(
      // 開始行
      `^> *\\[!${key}[^\\n]*\\n` +
        // 以降「>」で始まる行をできるだけ取る
        `(?:^>.*\\n)*`,
      "gmi"
    );
    body = body.replace(re, "");
  }

  // 3) 余計な空行を軽く詰める
  body = body.replace(/\n{3,}/g, "\n\n");
  return body.trimStart();
}

async function main() {
  console.log("[strip-legacy] NEWS_ROOT   =", NEWS_ROOT);
  console.log("[strip-legacy] ARTICLES_DIR =", ARTICLES_DIR);

  const files = await readAllMarkdownFiles(ARTICLES_DIR);
  console.log("[strip-legacy] markdown articles found:", files.length);

  let updated = 0;
  for (const file of files) {
    const orig = await fs.readFile(file, "utf8");
    const { frontmatter, body } = splitFrontmatter(orig);
    const cleanedBody = cleanupBody(body);

    const next = frontmatter ? frontmatter + cleanedBody : cleanedBody;

    if (next !== orig) {
      await fs.writeFile(file, next, "utf8");
      updated++;
      console.log("[strip-legacy] updated:", path.basename(file));
    }
  }

  console.log("[strip-legacy] summary: updated =", updated);
}

main().catch((err) => {
  console.error("[strip-legacy] ❌ ERROR:", err);
  process.exit(1);
});
