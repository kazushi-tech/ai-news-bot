// scripts/lib/index-utils.mjs
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// 旧互換: ROOT を常に提供
export const ROOT = process.env.NEWS_ROOT
  ? path.resolve(process.env.NEWS_ROOT)
  : path.resolve(__dirname, "..", "..");

// 小ユーティリティ
const pad = (n) => String(n).padStart(2, "0");

// YYYY-MM-DD へ（Date | string | number を許容）
export function ymd(input = new Date()) {
  const d = (input instanceof Date) ? input : new Date(input);
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  return `${y}-${m}-${dd}`;
}

// ISO週（Mon-Sun）
export function startOfISOWeek(input = new Date()) {
  const d = new Date(input);
  const day = d.getDay(); // 0=Sun,1=Mon,..6=Sat
  const diff = (day === 0 ? -6 : 1 - day); // 月曜日へ
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
export function endOfISOWeek(input = new Date()) {
  const s = startOfISOWeek(input);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}

// 旧名: resolveRoot, newsDir を提供（newsDir は flatten 後でも動くように root を返す）
export function resolveRoot() { return ROOT; }
export function newsDir(root = ROOT) { return root; } // 旧: <root>/news を想定 → 今は <root>

// walk（内部用）
async function walk(dir) {
  const out = [];
  const ents = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of ents) {
    const fp = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...(await walk(fp)));
    else out.push(fp);
  }
  return out;
}

// articles/ 直下の .md を収集（新しい順）
export async function collectRootArticles(root = ROOT) {
  const dir = path.join(root, "articles");
  let files = [];
  try {
    const ents = await fs.readdir(dir, { withFileTypes: true });
    for (const ent of ents) {
      if (ent.isFile() && ent.name.endsWith(".md")) {
        files.push(path.join(dir, ent.name));
      }
    }
  } catch {
    return [];
  }
  files.sort((a, b) => path.basename(b).localeCompare(path.basename(a)));
  return files;
}

// Frontmatter 読み（第2引数が index 数字で渡っても安全に処理）
export async function readArticleMeta(fp, maybeRoot) {
  const root = (typeof maybeRoot === "string" && maybeRoot) ? maybeRoot : ROOT;

  const raw = await fs.readFile(fp, "utf8");
  const { data } = matter(raw);

  const rel = path
    .relative(root, fp)
    .replaceAll("\\", "/");

  const title   = data?.title ?? path.basename(fp, ".md");
  const created = data?.created ?? data?.date ?? null;
  const source  = data?.source ?? data?.domain ?? data?.host ?? null;
  const host    = data?.host ?? data?.domain ?? null;
  const url     = data?.source_url ?? data?.url ?? data?.link ?? null;
  const tldr    = data?.tldr ?? null;

  return { rel, title, created, source, host, url, tldr };
}

// Obsidian / Publish / raw
export function makeArticleLink(relPath, linkMode = (process.env.LINK_MODE || "obsidian")) {
  const withoutExt = relPath.replace(/\.md$/i, "");
  if (linkMode === "obsidian") return `[[${withoutExt}]]`;
  if (linkMode === "publish")  return `/${withoutExt}`;
  return relPath;
}

// 旧名互換（落ちないための別名提供）
export const collectArticles = collectRootArticles;

// build_home.mjs が要求する簡易ヘッダ
export function header() { return "# AI News\n"; }
