// scripts/lib/index-utils.mjs
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export function resolveRoot() {
  return process.env.NEWS_ROOT
    ? path.resolve(process.env.NEWS_ROOT)
    : path.resolve(new URL("..", import.meta.url).pathname);
}

export function newsDir(root) {
  return path.join(root, "news");
}
export function articlesDir(root) {
  return path.join(newsDir(root), "articles");
}

export async function collectArticleFiles(root) {
  const dir = articlesDir(root);
  const files = await fs.readdir(dir, { withFileTypes: true });
  const out = [];
  for (const ent of files) {
    if (ent.isFile() && ent.name.endsWith(".md")) {
      out.push(path.join(dir, ent.name));
    }
  }
  return out;
}

export async function readArticleMeta(fp, root) {
  const raw = await fs.readFile(fp, "utf8");
  const { data } = matter(raw);
  const relPath = path.relative(root, fp).replace(/\\/g, "/"); // for Obsidian
  // date は string or Date の両対応で YYYY-MM-DD を返す
  let dateStr = "";
  if (typeof data.date === "string") {
    dateStr = data.date.slice(0, 10);
  } else if (data.date && typeof data.date.toISOString === "function") {
    dateStr = data.date.toISOString().slice(0, 10);
  }
  return {
    title: data.title ?? "",
    title_ja: data.title_ja ?? "",
    source_url: data.source_url ?? "",
    host: data.host ?? "",
    date: dateStr,
    relPath,
  };
}

export function makeArticleLink(relPath, mode = "obsidian") {
  if (mode === "obsidian") {
    return `[[${relPath}|記事ページへ]]`;
  }
  if (mode === "publish") {
    const slug = `/${relPath.replace(/^news\//, "news/").replace(/\.md$/, "")}`;
    return `[記事ページへ](${slug})`;
  }
  return relPath;
}

export function ymd(dateMaybe) {
  if (typeof dateMaybe === "string") return dateMaybe.slice(0, 10);
  if (dateMaybe instanceof Date) return dateMaybe.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

export function startOfISOWeek(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = (date.getUTCDay() || 7); // 1-7
  if (day !== 1) date.setUTCDate(date.getUTCDate() - (day - 1));
  return date;
}
export function endOfISOWeek(d) {
  const s = startOfISOWeek(d);
  const e = new Date(s);
  e.setUTCDate(e.getUTCDate() + 6);
  return e;
}