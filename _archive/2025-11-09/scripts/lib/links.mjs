/**
 * links.mjs (compat)
 * テーブルで崩れないMarkdownリンク + 既存build_*互換API
 */
export function articleLink(relPath, mode="obsidian") {
  const p = String(relPath).replace(/\\/g, "/");
  if (mode === "publish")  return `[記事ページへ](/${p.replace(/\.md$/,"")})`;
  if (mode === "wiki")     return `[[${p}]]`; // デバッグ用
  return `[記事ページへ](${encodeURI(p)})`;   // obsidian / default
}
export function sourceLink(url) {
  if (!url) return "";
  return `[引用元へ](${url})`;
}

/* ---- 既存build_*がimportする互換API ---- */
export function pickTitle(fm, fallback = "") {
  const t = fm?.data?.title ?? fm?.data?.headline ?? fm?.data?.name ?? fallback ?? "";
  return String(t).trim();
}
export function pickSourceUrl(fm, raw = "") {
  return fm?.data?.source?.url ?? fm?.data?.url ?? raw ?? "";
}
export function pickHost(fm, raw = "") {
  const u = pickSourceUrl(fm, raw);
  try { return new URL(u).host || ""; } catch { return fm?.data?.source?.host ?? fm?.data?.host ?? ""; }
}

/* ←これが無いと「is not a function」になる */
export function articlesDir(...segs) { return ["articles", ...segs].filter(Boolean).join("/"); }
export function dayPrefix(s=""){ return s; }

/* ついでに定数も残しておく（参照してる古いコード向け）*/
export const ARTICLES_DIR = "articles";
