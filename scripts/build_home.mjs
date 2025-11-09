// scripts/build_home.mjs  ←全文置き換え
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const ROOT = process.env.NEWS_ROOT
  ? path.resolve(process.env.NEWS_ROOT)
  : path.resolve(__dirname, "..");

const HOME_LIMIT  = Number(process.env.HOME_LIMIT  ?? 8);
const FRESH_DAYS  = Number(process.env.FRESH_DAYS  ?? 10);
const OUT         = path.join(ROOT, "index.md");

// 収集対象（ai-news/articles -> ../articles のシンボリックも想定）
const ARTICLE_DIRS = [
  path.join(ROOT, "ai-news", "articles"),
  path.join(ROOT, "articles"),
];

const isMd = (f) => f.endsWith(".md");
const toPlain = (md) =>
  md
    .replace(/```[\s\S]*?```/g, "")        // code block
    .replace(/`([^`]+)`/g, "$1")           // inline code
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")   // images
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")// links → text
    .replace(/^\s*#+\s*/gm, "")            // headings
    .replace(/>\s*\[!.*?\]\s*/g, "")       // callout head
    .replace(/\s+/g, " ")
    .trim();

function cutoffDate(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}
const CUTOFF = cutoffDate(FRESH_DAYS);

function firstUrlExceptNewsGoogle(md) {
  const re = /https?:\/\/(?!news\.google\.com)[^\s)\]]+/g;
  const m  = md.match(re);
  return m ? m[0] : null;
}

function fileBaseRel(fp) {
  // [[articles/<basename>|記事ページへ]] でリンクさせる
  return "articles/" + path.basename(fp);
}

async function collectArticles() {
  const files = [];
  for (const dir of ARTICLE_DIRS) {
    try {
      const list = (await fs.readdir(dir)).filter(isMd);
      for (const f of list) files.push(path.join(dir, f));
    } catch {}
  }
  // 去重
  return Array.from(new Set(files));
}

function safeDate(g, statMtime) {
  const raw = g.data?.date;
  if (raw) {
    // YYYY-MM-DD / ISO の両対応
    const d = new Date(raw);
    if (!isNaN(d)) return d;
  }
  return statMtime;
}

function deriveTitle(fp, g) {
  const fmTitle = String(g.data?.title ?? "").trim();
  if (fmTitle && !/^title:\s*x$/i.test(fmTitle) && fmTitle !== "Title: X") {
    return fmTitle;
  }
  // H1 または最初の段落から補完
  const h1 = (g.content.match(/^\s*#\s+(.+)$/m) || [])[1];
  if (h1) return h1.trim();
  const para = toPlain(g.content).slice(0, 60);
  return para || path.basename(fp).replace(/\.md$/, "");
}

function displaySource(g, body) {
  // 通常は frontmatter の source_url/host を使う
  const url  = String(g.data?.source_url ?? "");
  const host = String(g.data?.host ?? "");
  let useUrl  = url;
  let useHost = host;

  // news.google の場合は本文から最初のオリジンURLを拾って表示用に差し替え
  if (/^https?:\/\/news\.google\.com/.test(url) || host === "news.google.com") {
    const alt = firstUrlExceptNewsGoogle(body);
    if (alt) {
      try {
        const u = new URL(alt);
        useUrl  = alt;
        useHost = u.host;
      } catch {}
    }
  }
  // 最後の保険
  if (!useUrl && useHost) useUrl = "https://" + useHost;
  if (!useHost && useUrl) {
    try { useHost = new URL(useUrl).host; } catch {}
  }
  return { url: useUrl || "", host: useHost || (useUrl ? new URL(useUrl).host : "") };
}

function row({ title, linkPath, source }) {
  const src = source.url && source.host
    ? `[${source.host}](${source.url})`
    : (source.host || "");
  return `| ${title} | [[${linkPath}|記事ページへ]] | ${src} |`;
}

async function main() {
  const files = await collectArticles();
  const items = [];
  for (const fp of files) {
    try {
      const stat = await fs.stat(fp);
      const raw  = await fs.readFile(fp, "utf8");
      const g    = matter(raw);
      const created = safeDate(g, stat.mtime);

      // “新しさ” でフィルタ
      if (created < CUTOFF) continue;

      const title   = deriveTitle(fp, g);
      const source  = displaySource(g, g.content);
      const link    = fileBaseRel(fp);

      items.push({ fp, title, source, link, created });
    } catch {}
  }

  // 新しい順
  items.sort((a, b) => b.created - a.created);

  // 上限
  const limited = items.slice(0, HOME_LIMIT);

  const lines = [
    "# AI News",
    "",
    "## 要約一覧（合計 " + limited.length + "件）",
    "",
    "| タイトル | 記事ページへ | 引用元 |",
    "|---|---|---|",
    ...limited.map(v => row({ title: v.title, linkPath: v.link, source: v.source })),
    "",
  ];

  await fs.writeFile(OUT, lines.join("\n"), "utf8");
  console.log(`Wrote index: ${path.relative(ROOT, OUT)} | home:limit=${HOME_LIMIT} fresh=${FRESH_DAYS}d | rows: ${limited.length}`);
}

main().catch(e => { console.error(e); process.exit(1); });
