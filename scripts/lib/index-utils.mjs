import { readdir, readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const REQ_KEYS = ["title","date","model","source_url","host","tldr","key_points"];

export async function collectRootArticles(root) {
  const dir = path.join(root, "articles");
  await mkdir(dir, { recursive: true });           // ← なければ作る
  const files = (await readdir(dir)).filter(f => f.endsWith(".md"));
  return files.map(f => path.join(dir, f));
}

export async function readArticleMeta(fp) {
  const raw = await readFile(fp, "utf-8");
  const { data, content } = matter(raw);
  const missing = REQ_KEYS.filter(k => !(k in data));
  return { data, content, missing, path: fp };
}

export function makeArticleLink(fp, mode = "publish") {
  const rel = fp.replace(/\\/g, "/").split("/articles/")[1];
  if (mode === "obsidian") return `[[articles/${rel}]]`;
  const base = process.env.PUBLISH_BASE || "";
  return `${base}/articles/${encodeURI(rel)}`;
}

export function makeSourceLink(url) { return url || ""; }
export function inDateRange(d, from, to) {
  const x = new Date(d + "T00:00:00Z").getTime();
  return (from == null || x >= from) && (to == null || x <= to);
}
