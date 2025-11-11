// scripts/build_index_static.mjs
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { hideBin } from "yargs/helpers";
import yargs from "yargs";

const argv = yargs(hideBin(process.argv))
  .option("root", { type: "string", default: "." })          // 例: "." or "ai-news"
  .option("articlesDir", { type: "string", default: "articles" })
  .option("link", { type: "string", default: "obsidian" })   // obsidian固定想定
  .help().argv;

const ROOT = path.resolve(argv.root);
const ARTICLES_DIR = path.join(ROOT, argv.articlesDir);

function esc(text = "") {
  // Markdown table の | をエスケープ
  return String(text).replace(/\|/g, "\\|").trim();
}

function toDateFromFile(base) {
  // ファイル名が "YYYY-MM-DD--..." のときだけ拾う
  const m = base.match(/^(\d{4}-\d{2}-\d{2})--/);
  return m ? m[1] : null;
}

async function readArticles() {
  let files;
  try {
    files = await fs.readdir(ARTICLES_DIR);
  } catch {
    files = [];
  }
  const md = files.filter(f => f.endsWith(".md"));

  const rows = [];
  for (const fname of md) {
    const fpath = path.join(ARTICLES_DIR, fname);
    const buf = await fs.readFile(fpath, "utf8");
    const { data } = matter(buf);

    const base = fname.replace(/\.md$/, "");
    const title = data?.title ?? base;
    const source = data?.source_url ?? "";

    rows.push({
      title,
      base,            // articles/<base>
      source_url: source,
      date: data?.date ?? toDateFromFile(base) ?? ""
    });
  }
  // 新しい順
  rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));
  return rows;
}

function wikiLink(base) {
  // Obsidian の内部リンク（表示は「記事ページへ」）
  return `[[articles/${base}|記事ページへ]]`;
}

function extLink(url) {
  return url ? `[引用元へ↗](${url})` : "";
}

function table(rows) {
  const header = `| タイトル | 記事ページへ | 引用元 |
|---|---|---|`;
  const body = rows.map(r =>
    `| ${esc(r.title)} | ${wikiLink(r.base)} | ${extLink(r.source_url)} |`
  ).join("\n");
  return `${header}\n${body}\n`;
}

async function writeFileEnsured(fp, content) {
  await fs.mkdir(path.dirname(fp), { recursive: true });
  await fs.writeFile(fp, content, "utf8");
}

async function buildHome(rows) {
  const out = `# AI News — 一覧

${table(rows)}`;
  await writeFileEnsured(path.join(ROOT, "index.md"), out);
}

function byDate(rows, ymd) {
  return rows.filter(r => r.date === ymd);
}

function isoWeekKey(ymd) {
  // ざっくりISO週（YYYY-Www）
  const d = new Date(ymd);
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = target.getUTCDay() || 7; // 1..7 (Mon..Sun)
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(),0,1));
  const weekNo = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(weekNo).padStart(2,"0")}`;
}

async function buildDaily(rows) {
  const byYmd = new Map();
  for (const r of rows) {
    if (!r.date) continue;
    if (!byYmd.has(r.date)) byYmd.set(r.date, []);
    byYmd.get(r.date).push(r);
  }
  for (const [ymd, items] of byYmd) {
    const out = `# ${ymd}

${table(items)}`;
    await writeFileEnsured(path.join(ROOT, "daily", `${ymd}.md`), out);
  }
}

async function buildWeekly(rows) {
  const byW = new Map();
  for (const r of rows) {
    if (!r.date) continue;
    const w = isoWeekKey(r.date);
    if (!byW.has(w)) byW.set(w, []);
    byW.get(w).push(r);
  }
  for (const [wk, items] of byW) {
    const out = `# ${wk}

${table(items)}`;
    await writeFileEnsured(path.join(ROOT, "weekly", `${wk}.md`), out);
  }
}

(async function main() {
  const rows = await readArticles();
  await buildHome(rows);
  await buildDaily(rows);
  await buildWeekly(rows);
  console.log(`[done] wrote index.md + daily/ + weekly/ under ${ROOT}`);
})();
