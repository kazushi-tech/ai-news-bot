#!/usr/bin/env node
/**
 * build_index_daily.mjs
 * articles/ から指定日の記事を拾って daily テーブルを作成
 * 出力: news/daily/YYYY-MM-DD--AI-news.md
 * 列: タイトル | 記事(内部リンク) | 引用元(外部リンク)
 */
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { fileURLToPath } from "node:url";
import { articleLink, pickTitle, pickHost, sourceLink, dayPrefix, articlesDir } from "./lib/links.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function ensureLf(s) { return String(s || "").replace(/\r\n?/g, "\n"); }
function getArg(name, def = "") {
  const m = process.argv.find(a => a.startsWith(`--${name}=`));
  return m ? m.split("=")[1] : def;
}
const date = getArg("date", new Date().toISOString().slice(0,10));
const OUT_DIR = path.join(ROOT, "news", "daily");
const OUT_FILE = path.join(OUT_DIR, `${date}--AI-news.md`);

async function main() {
  const AR = articlesDir(ROOT);
  await fs.mkdir(AR, { recursive: true });
  const names = (await fs.readdir(AR)).filter(n => n.endsWith(".md") && n.startsWith(dayPrefix(date)));

  const rows = [];
  for (const n of names) {
    const full = path.join(AR, n);
    const md = await fs.readFile(full, "utf8");
    const fm = matter(md);
    const title = pickTitle(fm.data);
    const host = pickHost(fm.data);
    const art = articleLink({ filePath: `articles/${n}` });
    const src = sourceLink(fm.data);
    rows.push({ title, host, art, src });
  }

  // 同一source_urlで重複しがちなものを軽く抑止（最後に残った1件だけ）
  const dedup = new Map();
  for (const r of rows) {
    const key = r.src || `${r.title}::${r.host}`;
    dedup.set(key, r);
  }
  const list = Array.from(dedup.values());

  const header = `# ${date}--AI-news\n\n## ${date} のニュース索引\n`;
  const tableHead = `| タイトル | 記事 | 引用元 |\n|---|---|---|\n`;
  const tableBody = list.map(r => `| ${r.title} | ${r.art} | ${r.src} |`).join("\n");

  await fs.mkdir(OUT_DIR, { recursive: true });
  const body = header + "\n" + tableHead + tableBody + "\n";
  await fs.writeFile(OUT_FILE, ensureLf(body), "utf8");
  console.log(`[ok] daily index written: ${path.relative(ROOT, OUT_FILE)}`);
}

main().catch(e => { console.error(e); process.exit(1); });
