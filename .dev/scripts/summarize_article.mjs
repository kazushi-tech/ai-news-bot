// scripts/summarize_article.mjs

// 要約テキストから { tldr, key_points } を返す
export function summarizeArticle(textOut) {
  let tldr = "";
  let key_points = [];

  try {
    const src = String(textOut ?? "");
    const jsonMatch = src.match(/\{[\s\S]+\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : src);

    tldr = String(parsed.tldr ?? "").trim();
    key_points = Array.isArray(parsed.key_points)
      ? parsed.key_points.map(x => String(x).trim()).filter(Boolean)
      : [];
  } catch (e) {
    // Fallback: 行頭の「-」や「•」を剥がして整形
    const lines = String(textOut ?? "")
      .split(/\r?\n/)
      .map(s => s.replace(/^[\-•]\s*/, "").trim())
      .filter(Boolean);

    tldr = (lines.shift() ?? "").slice(0, 140);
    key_points = lines.slice(0, 6).map(s => `- ${s.slice(0, 120)}`);
  }

  return { tldr, key_points };
}

export default summarizeArticle; // デフォルトでも使えるように
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// 🔧 ここを 1階層上 にする（必要なら NEWS_ROOT で上書き可）
const ROOT = process.env.NEWS_ROOT
  ? path.resolve(process.env.NEWS_ROOT)
  : path.resolve(__dirname, "..");
