// scripts/doctor_layout_articles.mjs
// ai-news/articles/*.md の本文レイアウトを Dラボ風テンプレにそろえる。
// 既に「## 概要」や [!summary] TL;DR があればスキップして二重適用しない。

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

// ----- ユーティリティ -----

async function listArticleFiles() {
  try {
    const entries = await fs.readdir(ARTICLES_DIR, { withFileTypes: true });
    return entries
      .filter((ent) => ent.isFile() && ent.name.endsWith(".md"))
      .map((ent) => ent.name)
      .sort();
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error("[doctor] articles/ ディレクトリがありません:", ARTICLES_DIR);
      return [];
    }
    throw err;
  }
}

// frontmatter と本文を分離
function splitFrontmatter(raw) {
  if (!raw.startsWith("---")) {
    return { frontmatter: null, body: raw };
  }
  const end = raw.indexOf("\n---", 3);
  if (end === -1) {
    return { frontmatter: null, body: raw };
  }
  const fmBlock = raw.slice(0, end + 4); // 末尾の "\n---" を含める
  const body = raw.slice(end + 4).replace(/^\s+/, "");
  return { frontmatter: fmBlock, body };
}

// frontmatter をざっくり key: value で読む（超簡易 YAML）
function parseFrontmatterBlock(block) {
  if (!block) return {};
  const inner = block.replace(/^---\s*\n?/, "").replace(/\n?---\s*$/, "");
  const data = {};
  for (const line of inner.split("\n")) {
    const m = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    const value = m[2].trim();
    data[key] = value;
  }
  return data;
}

// 既にレイアウト済みかを判定
function isAlreadyShaped(body) {
  if (!body) return false;
  if (body.includes("## 概要")) return true;
  if (body.includes("[!summary] TL;DR")) return true;
  return false;
}

// 新しい本文を構築
function buildNewBody({ title, url, tldr, oldBody }) {
  const safeTitle = title || "タイトル未設定";
  const safeUrl = url || "（元記事 URL 未設定）";
  const safeTldr = tldr || "（あとで TL;DR を書く）";
  
  // oldBodyからタイトル、Callout、URLを除去
  let cleanedBody = oldBody.trim();
  
  // H1見出しを除去
  cleanedBody = cleanedBody.replace(/^#\s+[^\n]+\n*/gm, '');
  cleanedBody = cleanedBody.replace(/\n#\s+[^\n]+\n*/g, '\n');
  
  // Callout記法を除去（> [!...] から始まるブロック全体）
  cleanedBody = cleanedBody.replace(/^>\s*\[![^\]]+\][^\n]*\n(>\s*[^\n]*\n?)*/gm, '');
  
  // URLそのものの行を除去
  if (url) {
    const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cleanedBody = cleanedBody.replace(new RegExp(`^"?${escapedUrl}"?\\s*\\n?`, 'gm'), '');
    cleanedBody = cleanedBody.replace(new RegExp(`^${escapedUrl}\\s*\\n?`, 'gm'), '');
  }
  
  // 連続する空行を整理
  cleanedBody = cleanedBody.replace(/\n{3,}/g, '\n\n').trim();

  const lines = [];

  lines.push(`# ${safeTitle}`);
  lines.push("");

  lines.push("> [!summary] TL;DR");
  lines.push(`> ${safeTldr}`);
  lines.push("");

  lines.push("> [!info] 元記事");
  lines.push(`> ${safeUrl}`);
  lines.push("");

  lines.push("## 概要");
  lines.push("");
  if (cleanedBody) {
    lines.push(cleanedBody);
    lines.push("");
  } else {
    lines.push("（本文はまだありません）");
    lines.push("");
  }

  lines.push("## 重要なポイント");
  lines.push("");
  lines.push("- ");
  lines.push("");
  lines.push("## メモ");
  lines.push("");
  lines.push("- ");
  lines.push("");

  return lines.join("\n");
}

// ----- メイン処理 -----

async function processOne(fileName) {
  const fullPath = path.join(ARTICLES_DIR, fileName);
  const raw = await fs.readFile(fullPath, "utf8");

  const { frontmatter, body } = splitFrontmatter(raw);

  if (!body) {
    console.log(`[doctor] skip (bodyなし): ${fileName}`);
    return;
  }

  if (isAlreadyShaped(body)) {
    console.log(`[doctor] skip (already shaped): ${fileName}`);
    return;
  }

  const fm = parseFrontmatterBlock(frontmatter || "");
  const title = fm.title || "";
  const url = fm.url || fm.source_url || "";
  const tldr = fm.tldr || "";

  const newBody = buildNewBody({
    title,
    url,
    tldr,
    oldBody: body,
  });

  const newContent = (frontmatter || "") + "\n" + newBody;

  await fs.writeFile(fullPath, newContent, "utf8");
  console.log(`[doctor] updated: ${fileName}`);
}

async function main() {
  console.log("[doctor] NEWS_ROOT   =", NEWS_ROOT);
  console.log("[doctor] ARTICLES_DIR =", ARTICLES_DIR);

  const files = await listArticleFiles();
  if (!files.length) {
    console.log("[doctor] 対象記事がありません");
    return;
  }

  for (const file of files) {
    try {
      await processOne(file);
    } catch (err) {
      console.error(`[doctor] error on ${file}:`, err.message);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
