// scripts/lib/links.mjs
export function obsidianUri(vaultName, filePath) {
  return `obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(filePath)}`;
}

/**
 * 記事ページへのリンク生成
 * mode: "wiki" | "publish" | "obsidian"
 */
export function articleLink({ mode = "wiki", vault, filePath, publishBase = "" }) {
  const cleanPath = filePath.replace(/^\.?\/*/, "").replace(/\\/g, "/");
  if (mode === "obsidian") return `[記事ページへ](${obsidianUri(vault, cleanPath)})`;
  if (mode === "publish") {
    const base = (publishBase || "").replace(/\/+$/, "");
    return `[記事ページへ](${base}/${cleanPath})`;
  }
  // 既定：wikilink
  return `[[${cleanPath}|記事ページへ]]`;
}
