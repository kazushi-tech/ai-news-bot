/**
 * links.mjs (compat)
 * - 表内で崩れないMarkdownリンクに統一
 * - 旧buildスクリプト互換のエクスポートも用意（pickTitle等）
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

/* ---- 旧build_* が import している互換API ---- */
export const articlesDir = "articles";     // 旧コードのデフォルト想定に合わせる
export const dayPrefix   = "";             // 使っていなくても存在だけ用意

// 旧コードが (fm, fallback) などで呼んでも動くようにゆるく定義
export function pickTitle(fm, fallback = "") {
  const t =
    fm?.data?.title ??
    fm?.data?.headline ??
    fm?.data?.name ??
    fallback;
  return String(t ?? "").trim();
}
export function pickSourceUrl(fm, raw = "") {
  return (
    fm?.data?.source?.url ??
    fm?.data?.url ??
    raw ??
    ""
  );
}

/* （必要なら今後ここに obsidianUri 等を追加） */
