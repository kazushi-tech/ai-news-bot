// scripts/doctor_title_autofill.mjs（新規）
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const ROOT = path.resolve(process.env.NEWS_ROOT ?? ".");
const DIRS = [
  path.join(ROOT, "ai-news", "articles"),
  path.join(ROOT, "articles"),
];

const isMd = (f) => f.endsWith(".md");
const clean = (s) => s
  .replace(/```[\s\S]*?```/g, "")
  .replace(/!\[[^\]]*]\([^)]+\)/g, "")
  .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
  .replace(/^\s*#+\s*/gm, "")
  .replace(/\s+/g, " ")
  .trim();

function extractTweetLike(body) {
  // ## 投稿内容 ～ 次の見出し まで
  const m = body.match(/^\s*##\s*投稿内容\s*\n([\s\S]*?)(?:\n##\s|\n*$)/m);
  if (m && m[1]) return clean(m[1]).slice(0, 60);
  // だめなら概要
  const s = body.match(/^\s*##\s*概要\s*\n([\s\S]*?)(?:\n##\s|\n*$)/m);
  if (s && s[1]) return clean(s[1]).slice(0, 60);
  // 最後の保険：先頭段落
  const para = (body.match(/\n\n([^#\n].*?)\n\n/s) || [])[1];
  return clean(para || "").slice(0, 60);
}

async function runDir(dir) {
  const list = await fs.readdir(dir).catch(() => []);
  for (const f of list.filter(isMd)) {
    const fp = path.join(dir, f);
    const raw = await fs.readFile(fp, "utf8");
    const g   = matter(raw);

    const fmTitle = String(g.data?.title ?? "");
    const host    = String(g.data?.host ?? "");

    const needs = !fmTitle || fmTitle === "Title: X" || /^title:\s*x$/i.test(fmTitle);
    if (!needs) continue;

    const titleFromBody = extractTweetLike(g.content);
    if (!titleFromBody) continue;

    const prefix = host.includes("x.com") ? "" : ""; // 必要なら "【X】" など
    g.data.title = `${prefix}${titleFromBody}`;

    await fs.writeFile(fp, matter.stringify(g.content, g.data), "utf8");
    console.log(`[title] ${path.basename(fp)} <- ${g.data.title}`);
  }
}

for (const d of DIRS) { try { await runDir(d); } catch {} }
console.log("[doctor] title autofill done.");
