// scripts/build_ai_news.mjs
// 目的: articles/ のFrontmatter (title, source_url|url, host, date) を基に
//       指定日の news/YYYY-MM-DD--AI-news.md を生成（静的3列: タイトル｜記事ページへ｜引用元）

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const ROOT     = path.resolve(process.env.NEWS_ROOT ?? path.resolve("."));
const ARTICLES = path.join(ROOT, "articles");
const NEWS     = path.join(ROOT, "news");

// ---- helpers ----
function escCell(s = "") {
  return String(s).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}
function hostFrom(url) {
  try { return new URL(url).host; } catch { return ""; }
}
function toYmdTokyo(ms) {
  const fmt = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric", month: "2-digit", day: "2-digit",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(new Date(ms)).map(p => [p.type, p.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}
function parseFrontmatterDate(v) {
  if (!v) return null;
  if (typeof v === "string") {
    // "YYYY-MM-DD" や ISO 日付に対応
    const m = v.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
    const d = new Date(v);
    if (!isNaN(d)) return toYmdTokyo(d.getTime());
    return null;
  }
  if (v instanceof Date && !isNaN(v)) return toYmdTokyo(v.getTime());
  return null;
}
function getArg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}
function todayTokyo() {
  return toYmdTokyo(Date.now());
}

// ---- main ----
async function main() {
  const target = getArg("--date") || todayTokyo(); // デフォルト: 今日(Asia/Tokyo)
  await fs.mkdir(NEWS, { recursive: true });

  const files = (await fs.readdir(ARTICLES).catch(() => []))
    .filter(f => f.endsWith(".md"));

  const rows = [];
  for (const f of files) {
    const fp = path.join(ARTICLES, f);
    const raw = await fs.readFile(fp, "utf8");
    const fm  = matter(raw);

    const stat = await fs.stat(fp);
    const fmDate = parseFrontmatterDate(fm.data?.date);
    const ymd = fmDate || toYmdTokyo(stat.mtimeMs || stat.mtime);

    if (ymd !== target) continue; // 指定日以外は弾く

    const title = fm.data?.title || f.replace(/\.md$/, "");
    const url   = fm.data?.source_url || fm.data?.url || "";
    const host  = fm.data?.host || hostFrom(url) || "元記事";

    rows.push({
      mtime: stat.mtimeMs || stat.mtime,
      title: escCell(title),
      link : `articles/${f}`,               // そのまま .md を指す
      origin: url ? `[${escCell(host)}](${url})` : "",
    });
  }

  // mtime 降順で新しい順
  rows.sort((a, b) => b.mtime - a.mtime);

  const tableHeader = `| タイトル | 記事ページへ | 引用元 |\n|---|---|---|\n`;
  const lines = rows.map(r => {
    const col1 = r.title;
    const col2 = `[記事ページへ](${r.link})`;
    const col3 = r.origin;
    return `| ${col1} | ${col2} | ${col3} |`;
  }).join("\n") || "| （対象記事なし） |  |  |\n";

  const body = `# AI News — ${target}

${tableHeader}${lines}
`;

  const outName = `${target}--AI-news.md`;
  const outPath = path.join(NEWS, outName);
  await fs.writeFile(outPath, body, "utf8");
  console.log("Wrote daily:", path.relative(ROOT, outPath));
}

main().catch(e => { console.error(e); process.exit(1); });
