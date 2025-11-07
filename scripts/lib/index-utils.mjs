// scripts/lib/index-utils.mjs
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, "..", "..");

// NEWS_ROOT で /news 配下にも対応（例: NEWS_ROOT=news）
export const NEWS_ROOT = process.env.NEWS_ROOT
  ? path.resolve(REPO_ROOT, process.env.NEWS_ROOT)
  : REPO_ROOT;

export const ARTICLES_DIR = path.join(NEWS_ROOT, "articles");

/* =========================
 * Link helpers
 * ========================= */
export function articleLink(relPath, label, mode = process.env.LINK_MODE || "obsidian") {
  return mode === "obsidian" ? makeObsidianLink(relPath, label) : makeMarkdownLink(relPath, label);
}
export const makeArticleLink = articleLink; // 互換エイリアス

export function makeObsidianLink(relPath, label) {
  const withoutExt = String(relPath).replace(/\.md$/i, "");
  return `[[${withoutExt}|${label}]]`;
}
export function makeMarkdownLink(relPath, label) {
  return `[${label}](${relPath})`;
}

/* =========================
 * FS helpers
 * ========================= */
function coerceAbsPath(fileish, baseDir = ARTICLES_DIR) {
  if (!fileish) throw new TypeError("readArticleMeta: invalid file ref");
  if (typeof fileish === "string") {
    return path.isAbsolute(fileish) ? fileish : path.join(NEWS_ROOT, fileish);
  }
  if (typeof fileish === "object") {
    if (fileish.absPath) return String(fileish.absPath);
    if (fileish.path) return String(fileish.path);
    if (fileish.filePath) return String(fileish.filePath);
    if (fileish.fullPath) return String(fileish.fullPath);
    if (fileish.name)     return path.join(baseDir, String(fileish.name));
  }
  throw new TypeError("readArticleMeta: unsupported file ref " + JSON.stringify(fileish));
}

/* =========================
 * Collect & read
 * ========================= */
export async function collectRootArticles({ dir = ARTICLES_DIR } = {}) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile?.() && e.name.endsWith(".md"))
    .map((e) => path.join(dir, e.name));

  const items = await Promise.all(
    files.map(async (abs) => {
      const meta = await readArticleMeta(abs);
      const relPath = path.relative(NEWS_ROOT, abs).split(path.sep).join("/");
      return { ...meta, absPath: abs, relPath, fileName: path.basename(abs) };
    })
  );

  // 日付降順
  items.sort((a, b) => {
    const ad = a.date || guessDateFromFilename(a.fileName);
    const bd = b.date || guessDateFromFilename(b.fileName);
    return (bd || "").localeCompare(ad || "");
  });
  return items;
}

export async function readArticleMeta(fileish) {
  const absFilePath = coerceAbsPath(fileish);
  let raw;
  try {
    raw = await fs.readFile(absFilePath, "utf8");
  } catch (err) {
    err.message = `${err.message} (absPath=${absFilePath})`;
    throw err;
  }
  const { frontmatter, body } = splitFrontmatter(raw);
  const meta = parseYamlLite(frontmatter);

  const fileName = path.basename(absFilePath);
  const { date: dateFromName, host: hostFromName, slug } = parseFromFilename(fileName);

  const keyPoints =
    Array.isArray(meta.key_points)
      ? meta.key_points
      : typeof meta.key_points === "string" && meta.key_points.trim()
      ? meta.key_points.split(/[、,\n]/).map((s) => s.trim()).filter(Boolean)
      : [];

  return {
    title: meta.title || slugToTitle(slug),
    date: normalizeDate(meta.date || dateFromName),
    model: meta.model || "",
    source_url: meta.source_url || "",
    host: meta.host || hostFromName,
    tldr: meta.tldr || "",
    key_points: keyPoints,
    body,
  };
}

/* =========================
 * Date helpers (weeklyで使用)
 * ========================= */
export function normalizeDate(d) {
  if (!d) return "";
  return String(d).replace(/\//g, "-").slice(0, 10);
}
export function parseISO(s) {
  const m = String(s || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}
export function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
/** 文字列 or {date: "..."} どちらでもOK */
export function inDateRange(x, { from, to }) {
  const ds = typeof x === "string" ? x : x?.date;
  const d = parseISO(normalizeDate(ds));
  const f = from ? parseISO(normalizeDate(from)) : null;
  const t = to ? parseISO(normalizeDate(to)) : null;
  if (!d) return false;
  if (f && d < f) return false;
  if (t && d > t) return false;
  return true;
}

/* =========================
 * Internal helpers
 * ========================= */
function splitFrontmatter(text) {
  if (text.startsWith("---")) {
    const end = text.indexOf("\n---", 3);
    if (end !== -1) {
      const fm = text.slice(3, end).trim();
      const body = text.slice(end + 4).replace(/^\s*\n/, "");
      return { frontmatter: fm, body };
    }
  }
  return { frontmatter: "", body: text };
}

// key: value と配列(- item)のみ対応の軽量YAML
function parseYamlLite(yaml) {
  const obj = {};
  if (!yaml) return obj;
  const lines = yaml.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*(#|$)/.test(line)) { i++; continue; }
    const m = line.match(/^([\w-]+):\s*(.*)$/);
    if (m) {
      const key = m[1];
      let val = m[2].trim();
      if (val === "") {
        const arr = [];
        i++;
        while (i < lines.length) {
          const l = lines[i];
          const mm = l.match(/^\s*-\s*(.*)$/);
          if (mm) { arr.push(mm[1].trim()); i++; continue; }
          if (/^\s+/.test(l)) { i++; continue; }
          break;
        }
        obj[key] = arr;
        continue;
      } else {
        val = val.replace(/^["']|["']$/g, "");
        obj[key] = val;
      }
    }
    i++;
  }
  return obj;
}

function parseFromFilename(name) {
  const base = String(name).replace(/\.md$/i, "");
  const parts = base.split("--");
  const date = parts[0] && /^\d{4}-\d{2}-\d{2}$/.test(parts[0]) ? parts[0] : "";
  const host = parts[1] || "";
  const slug = parts.slice(2).join("--") || base;
  return { date, host, slug };
}
function slugToTitle(slug) { return String(slug).replace(/[-_]+/g, " ").trim(); }
function guessDateFromFilename(name) { return parseFromFilename(name).date || ""; }
