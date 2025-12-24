// scripts/build_sources_index.mjs
// ai-news/articles/*.md から、ドメイン別インデックスを生成する。
// - ai-news/sources/<domain>.md
// - ai-news/sources/index.md

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// /Users/omats/git-check/myapp
const ROOT = path.resolve(__dirname, "..", "..");

// NEWS_ROOT は ai-news へのパス
const NEWS_ROOT =
  process.env.NEWS_ROOT || path.join(ROOT, "ai-news");

const ARTICLES_DIR = path.join(NEWS_ROOT, "articles");
const SOURCES_DIR = path.join(NEWS_ROOT, "sources");
const SOURCES_INDEX_PATH = path.join(SOURCES_DIR, "index.md");

/**
 * 雑 frontmatter パーサー (key: value だけ抜く)
 */
function parseFrontmatter(text) {
  const fmMatch = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return {};

  const fmText = fmMatch[1];
  const result = {};

  for (const line of fmText.split("\n")) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    const value = m[2].trim();
    const cleaned = value
      .replace(/^"(.*)"$/, "$1")
      .replace(/^'(.*)'$/, "$1");
    result[key] = cleaned;
  }

  return result;
}

/**
 * ファイルから記事メタを読み込む。
 */
async function loadArticles() {
  let files = [];
  try {
    files = await fs.readdir(ARTICLES_DIR);
  } catch (e) {
    console.error("[sources] ARTICLES_DIR を読めません:", ARTICLES_DIR, e);
    return [];
  }

  const mdFiles = files.filter((f) => f.endsWith(".md"));

  const articles = [];

  for (const file of mdFiles) {
    const fullPath = path.join(ARTICLES_DIR, file);
    let text;
    try {
      text = await fs.readFile(fullPath, "utf8");
    } catch (e) {
      console.error("[sources] 読み込み失敗:", fullPath, e);
      continue;
    }

    const fm = parseFrontmatter(text);

    const rawHost = fm.host || "";
    const host = (rawHost || "").replace(/^www\./, "") || "unknown";

    const title = fm.title || file.replace(/\.md$/, "");
    const created = fm.created || "";
    const url = fm.url || fm.source_url || "";

    articles.push({
      file,
      relPath: `ai-news/articles/${file}`,
      host,
      title,
      created,
      url,
    });
  }

  // created 降順でざっくりソート
  articles.sort((a, b) => {
    const da = a.created || "";
    const db = b.created || "";
    if (da === db) return b.file.localeCompare(a.file);
    return db.localeCompare(da);
  });

  return articles;
}

/**
 * host をファイル名に安全に使える形にする。
 */
function safeDomainName(host) {
  if (!host) return "unknown";
  return host.replace(/[^\w.-]+/g, "_");
}

/**
 * 個別ドメイン用の Markdown を作る。
 */
function buildDomainMarkdown(host, items) {
  const title = `AI News – ${host}`;
  const lines = [];

  lines.push("---");
  lines.push(`title: ${title}`);
  lines.push(`host: ${host}`);
  lines.push("---", "");

  lines.push(`# ${host}`, "");
  lines.push(
    "> このページは `scripts/build_sources_index.mjs` によって自動生成されています。手動で編集しないでください。",
    ""
  );

  lines.push("| 日付 | タイトル | 記事ページ | 元記事 |");
  lines.push("| --- | --- | --- | --- |");

  for (const a of items) {
    const date = a.created || "";
    const titleCell = a.title || a.file.replace(/\.md$/, "");
    const noteLink = `[記事](${a.relPath})`;
    const srcLink = a.url ? `[リンク](${a.url})` : "";
    lines.push(`| ${date} | ${titleCell} | ${noteLink} | ${srcLink} |`);
  }

  lines.push("");

  return lines.join("\n");
}

/**
 * sources/index.md を作る。
 */
function buildSourcesIndexMarkdown(domainEntries) {
  const lines = [];

  lines.push("---");
  lines.push("title: ドメイン別インデックス");
  lines.push("---", "");

  lines.push("# ドメイン別インデックス", "");
  lines.push(
    "> このページは `scripts/build_sources_index.mjs` によって自動生成されています。手動で編集しないでください。",
    ""
  );

  if (domainEntries.length === 0) {
    lines.push("まだ記事がありません。");
    lines.push("");
    return lines.join("\n");
  }

  lines.push("| ドメイン | 件数 | インデックス |");
  lines.push("| --- | --- | --- |");

  for (const entry of domainEntries) {
    const link = `[一覧](ai-news/sources/${entry.safeHost}.md)`;
    lines.push(`| ${entry.host} | ${entry.count} | ${link} |`);
  }

  lines.push("");

  return lines.join("\n");
}

async function main() {
  console.log("[sources] ROOT       =", ROOT);
  console.log("[sources] NEWS_ROOT  =", NEWS_ROOT);
  console.log("[sources] ARTICLES   =", ARTICLES_DIR);
  console.log("[sources] SOURCES_DIR =", SOURCES_DIR);

  const articles = await loadArticles();
  console.log("[sources] article count =", articles.length);

  // ドメインごとにグルーピング
  const byHost = new Map();
  for (const a of articles) {
    const host = a.host || "unknown";
    if (!byHost.has(host)) byHost.set(host, []);
    byHost.get(host).push(a);
  }

  // ドメインごとのインデックスを書き出し
  await fs.mkdir(SOURCES_DIR, { recursive: true });

  const domainEntries = [];

  for (const [host, items] of byHost.entries()) {
    const safeHost = safeDomainName(host);
    const outPath = path.join(SOURCES_DIR, `${safeHost}.md`);

    const md = buildDomainMarkdown(host, items);
    await fs.writeFile(outPath, md, "utf8");
    console.log("[sources] wrote:", outPath);

    domainEntries.push({
      host,
      safeHost,
      count: items.length,
    });
  }

  // ドメイン一覧 index
  // host アルファベット順で並べておく
  domainEntries.sort((a, b) => a.host.localeCompare(b.host));

  const indexMd = buildSourcesIndexMarkdown(domainEntries);
  await fs.writeFile(SOURCES_INDEX_PATH, indexMd, "utf8");
  console.log("[sources] wrote:", SOURCES_INDEX_PATH);
}

main().catch((err) => {
  console.error("[sources] Fatal error:", err);
  process.exit(1);
});
