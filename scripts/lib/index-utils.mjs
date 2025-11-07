import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYAML, stringify as stringifyYAML } from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.NEWS_ROOT ? path.resolve(process.env.NEWS_ROOT) : path.resolve(__dirname, "../../news");
const LINK_MODE = process.env.LINK_MODE || "obsidian";

export function jstToday() {
  const fmt = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" });
  const [{ value: y }, , { value: m }, , { value: d }] = fmt.formatToParts(new Date());
  return `${y}-${m}-${d}`;
}

export function ensureDirs() {
  return Promise.all([
    fs.mkdir(path.join(ROOT, "articles"), { recursive: true }),
    fs.mkdir(path.join(ROOT, "daily"), { recursive: true }),
    fs.mkdir(path.join(ROOT, "weekly"), { recursive: true }),
    fs.mkdir(path.join(ROOT, "source"), { recursive: true })
  ]);
}

export function slugify(s) {
  return s.toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9\-_.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "article";
}

export function hostOf(url) {
  try { return new URL(url).host; } catch { return "unknown-host"; }
}

export async function writeFileSafe(fp, content) {
  await fs.mkdir(path.dirname(fp), { recursive: true });
  await fs.writeFile(fp, content, "utf8");
}

export function toFrontmatter(obj) {
  const yaml = stringifyYAML(obj, { lineWidth: 0 });
  return `---\n${yaml}---\n`;
}

export function makeArticleLink(relPath, text = "記事ページへ") {
  // relPath: e.g. articles/2025-11-07--example.com--foo.md
  const noExt = relPath.replace(/\.md$/i, "");
  if (LINK_MODE === "obsidian") {
    return `[[${noExt}|${text}]]`;
  }
  return `[${text}](${relPath})`;
}

export async function readArticleMeta(fp) {
  const raw = await fs.readFile(fp, "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return { data: {}, body: raw, raw, file: fp };
  const data = parseYAML(m[1] || "") || {};
  const body = raw.slice(m[0].length);
  return { data, body, raw, file: fp };
}

export async function collectArticles() {
  const dir = path.join(ROOT, "articles");
  let files = [];
  try { files = await fs.readdir(dir); } catch { return []; }
  return files
    .filter(f => f.endsWith(".md"))
    .map(f => path.join(dir, f));
}

export function ymd(date = new Date()) {
  const fmt = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" });
  const [{ value: y }, , { value: m }, , { value: d }] = fmt.formatToParts(date);
  return `${y}-${m}-${d}`;
}

export function mondayOfISOWeek(dateStr) {
  const [Y, M, D] = dateStr.split("-").map(Number);
  const d = new Date(Date.UTC(Y, M - 1, D));
  // convert to Monday
  const day = d.getUTCDay() || 7; // Sun=0 -> 7
  d.setUTCDate(d.getUTCDate() - (day - 1));
  return ymd(d);
}

export function header(title) {
  return `# ${title}\n\n`;
}

export function threeColTable(rows) {
  const head = `| タイトル | 記事ページへ | 引用元 |\n|---|---|---|\n`;
  const body = rows.map(r => `| ${r.title} | ${r.link} | [引用元へ](${r.source_url}) |`).join("\n");
  return head + body + "\n";
}

export { ROOT };
