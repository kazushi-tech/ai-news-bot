// scripts/lib/links.mjs
import path from "node:path";

/** Obsidianのwikiリンクを「記事ページへ」で固定 */
export function articleLink({ filePath }) {
  // filePath 例: "articles/2025-11-03--host--slug.md"
  const clean = String(filePath || "").replace(/^\.?\/*/, "");
  return `[[${clean}|記事ページへ]]`;
}

/** 見出し（日本語優先） */
export function pickTitle(data) {
  return String(data.title_ja || data.title || "").trim() || "無題のファイル";
}

/** ドメイン文字列（"example.com"） */
export function pickHost(data = {}) {
  return String(data.host || "").trim();
}

/** 外部リンク（引用元へ） */
export function sourceLink(data = {}) {
  const url = String(data.source_url || "").trim();
  if (!url) return "";
  return `[引用元へ](${url})`;
}

/** 指定日のファイル名プリフィクス */
export function dayPrefix(dateStr) {
  return `${dateStr}--`;
}

/** 記事mdの保存先 */
export function articlesDir(ROOT) {
  return path.join(ROOT, "articles");
}
