// ai-news-bot/scripts/build_index_daily.mjs
// articles/ から指定日の記事だけ拾って Daily インデックス Markdown を生成する

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

// ESM 用 __dirname 相当
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------
// CLI 引数パーサ
// -----------------------------
const argv = process.argv.slice(2);

function getArgValue(name, defaultValue = null) {
  // --name value
  const idx = argv.indexOf(`--${name}`);
  if (idx !== -1) {
    const next = argv[idx + 1];
    if (next && !next.startsWith("--")) {
      return next;
    }
    return true; // フラグ型
  }
  // --name=value
  const prefix = `--${name}=`;
  const found = argv.find((a) => a.startsWith(prefix));
  if (found) {
    return found.slice(prefix.length);
  }
  return defaultValue;
}

// -----------------------------
// 日付まわり
// -----------------------------
function getTodayDateString() {
  const now = new Date();
  const iso = new Date(
    now.getTime() - now.getTimezoneOffset() * 60 * 1000
  ).toISOString();
  return iso.slice(0, 10);
}

const explicitDate = getArgValue("date");
const linkMode = (getArgValue("link", "obsidian") || "obsidian").toString();

const targetDate = explicitDate || getTodayDateString();

// -----------------------------
// パス解決
// -----------------------------
const ROOT =
  process.env.ROOT || path.resolve(process.cwd(), "..", "ai-news");
const ARTICLES_DIR = path.join(ROOT, "articles");
const OUTPUT_DIR = path.join(process.cwd(), "daily");
const VAULT_NAME = process.env.VAULT_NAME || "myapp";

console.log("[daily] ROOT        =", ROOT);
console.log("[daily] ARTICLES    =", ARTICLES_DIR);
console.log("[daily] OUTPUT_DIR  =", OUTPUT_DIR);
console.log("[daily] targetDate  =", targetDate);
console.log("[daily] linkMode    =", linkMode);

// -----------------------------
// Utility
// -----------------------------
function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function tryGetDate(data) {
  const raw = data.date || data.created;
  if (!raw) return null;
  if (raw instanceof Date) {
    return raw.toISOString().slice(0, 10);
  }
  if (typeof raw === "string") {
    return raw.slice(0, 10);
  }
  return null;
}

function escapeCell(text) {
  if (!text) return "";
  return String(text)
    .replace(/\r?\n/g, " ")
    .replace(/\|/g, "\\|")
    .trim();
}

function escapeTldr(text) {
  if (!text) return "";
  return String(text)
    .replace(/\r?\n/g, "<br>")
    .replace(/\|/g, "\\|")
    .trim();
}

function safeHostFromUrl(u) {
  try {
    const url = new URL(u);
    return url.hostname;
  } catch {
    return "";
  }
}

function buildArticleLink(fileName, mode) {
  const relPath = `ai-news/articles/${fileName}`;
  if (mode === "obsidian") {
    const encPath = encodeURIComponent(relPath).replace(/%2F/g, "%2F");
    const vault = encodeURIComponent(VAULT_NAME);
    return `obsidian://open?vault=${vault}&file=${encPath}`;
  }
  if (mode === "relative") {
    return relPath;
  }
  return "";
}

// -----------------------------
// 記事スキャン
// -----------------------------
function loadArticlesForDate(dateStr) {
  ensureDirSync(ARTICLES_DIR);
  const entries = fs.readdirSync(ARTICLES_DIR, { withFileTypes: true });

  const results = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith(".md")) continue;
    if (entry.name.startsWith(".")) continue;

    const filePath = path.join(ARTICLES_DIR, entry.name);
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = matter(raw);
    const data = parsed.data || {};

    const articleDate = tryGetDate(data);
    if (!articleDate || articleDate !== dateStr) continue;

    const title = data.title || "(タイトルなし)";
    const host =
      data.host ||
      (data.source_url
        ? safeHostFromUrl(data.source_url)
        : data.url
        ? safeHostFromUrl(data.url)
        : "");
    const sourceUrl = data.source_url || data.url || "";
    const tldr = data.tldr || "";

    results.push({
      fileName: entry.name,
      title,
      host,
      sourceUrl,
      tldr,
    });
  }

  // ファイル名で安定ソート
  results.sort((a, b) => a.fileName.localeCompare(b.fileName));
  return results;
}

// -----------------------------
// Markdown 生成
// -----------------------------
function buildDailyMarkdown(dateStr, rows) {
  const outLines = [];

  // frontmatter
  outLines.push("---");
  outLines.push(`title: "${dateStr}--AI-news"`);
  outLines.push(`date: ${dateStr}`);
  outLines.push("---");
  outLines.push("");
  outLines.push(`# ${dateStr}--AI-news`);
  outLines.push("");
  outLines.push(`Daily Index — ${dateStr}`);
  outLines.push("");

  if (!rows.length) {
    outLines.push("（この日はまだ記事がありません）");
    outLines.push("");
    return outLines.join("\n");
  }

  // table header
  outLines.push("| タイトル | 記事ページへ | 引用元 | 要約 |");
  outLines.push("| --- | --- | --- | --- |");

  for (const row of rows) {
    const titleCell = escapeCell(row.title || "(タイトルなし)");

    const articleLinkUrl = buildArticleLink(row.fileName, linkMode);
    const articleCell = articleLinkUrl
      ? `[記事ページへ](${articleLinkUrl})`
      : "-";

    const sourceCell = row.sourceUrl
      ? `[引用元へ](${row.sourceUrl})`
      : escapeCell(row.host || "-");

    const tldrCell = escapeTldr(row.tldr || "");

    outLines.push(
      `| ${titleCell || "(タイトルなし)"} | ${articleCell} | ${sourceCell ||
        "-"} | ${tldrCell || "-"} |`
    );
  }

  outLines.push("");
  return outLines.join("\n");
}

// -----------------------------
// メイン
// -----------------------------
function main() {
  ensureDirSync(OUTPUT_DIR);

  const articles = loadArticlesForDate(targetDate);
  console.log("[daily] articles for", targetDate, "=", articles.length);

  const md = buildDailyMarkdown(targetDate, articles);

  const outFile = path.join(OUTPUT_DIR, `${targetDate}--AI-news.md`);
  fs.writeFileSync(outFile, md, "utf8");
  console.log("[daily] wrote:", outFile);
}

main();
