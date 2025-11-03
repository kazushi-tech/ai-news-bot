/**
 * links.mjs
 * 表の中でも安全に表示できるリンクを返す
 * - obsidian: [記事ページへ](relative.md) / [引用元へ](url)
 * - publish : [記事ページへ](/relative-without-md) / [引用元へ](url)
 * - wiki    : [[path]]（デバッグ用）
 */
export function articleLink(relPath, mode="obsidian") {
  const p = String(relPath).replace(/\\/g, "/");
  if (mode === "obsidian") return `[記事ページへ](${encodeURI(p)})`;
  if (mode === "publish")  return `[記事ページへ](/${p.replace(/\.md$/,"")})`;
  if (mode === "wiki")     return `[[${p}]]`;
  return `[記事ページへ](${encodeURI(p)})`;
}
export function sourceLink(url) {
  if (!url) return "";
  return `[引用元へ](${url})`;
}
