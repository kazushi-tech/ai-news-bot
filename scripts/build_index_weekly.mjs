#!/usr/bin/env node
/**
 * build_index_weekly.mjs
 * 直近7日（含む本日）の articles/*.md を集計して重複排除した週次テーブルを生成
 * 出力: news/weekly/YYYY-MM-DD.md
 * 列: タイトル | 記事(内部リンク) | 引用元(外部リンク)
 */
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { fileURLToPath } from "node:url";
import { articleLink, pickTitle, pickHost, sourceLink, articlesDir } from "./lib/links.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function ensureLf(s){ return String(s||"").replace(/\r\n?/g,"\n"); }
function today(){ return new Date().toISOString().slice(0,10); }
function ymd(d){ return d.toISOString().slice(0,10); }
function daysAgo(n){
  const d = new Date(); d.setDate(d.getDate()-n); return ymd(d);
}
const TO = today();
const FROM = daysAgo(6); // 直近7日

function withinRange(name){
  const m = name.match(/^(\d{4}-\d{2}-\d{2})--/);
  if(!m) return false;
  const day = m[1];
  return (day >= FROM && day <= TO);
}

async function main(){
  const AR = articlesDir(ROOT);
  await fs.mkdir(AR, { recursive: true });
  const names = (await fs.readdir(AR)).filter(n => n.endsWith(".md") && withinRange(n));

  // source_url 正規化
  const norm = (u) => String(u||"").trim().replace(/^https?:\/\//,"").replace(/\/$/,"");

  // 収集
  const items = [];
  for (const n of names){
    const full = path.join(AR, n);
    const md = await fs.readFile(full, "utf8");
    const fm = matter(md);
    items.push({
      date: n.slice(0,10),
      title: pickTitle(fm.data),
      art: articleLink({ filePath: `articles/${n}` }),
      src: sourceLink(fm.data),
      key: fm.data.source_url ? `src::${norm(fm.data.source_url)}` : `th::${pickHost(fm.data)}::${pickTitle(fm.data)}`,
    });
  }

  // 重複排除（source_url 優先）
  const map = new Map();
  for (const it of items){ map.set(it.key, it); }
  const list = Array.from(map.values()).sort((a,b)=> (a.date === b.date) ? a.title.localeCompare(b.title) : (a.date < b.date ? 1 : -1));

  // 出力
  const OUT_DIR = path.join(ROOT, "news", "weekly");
  const OUT_FILE = path.join(OUT_DIR, `${TO}.md`);
  const header = `# ${TO}\n\n> 直近7日のAIニュース一覧 (${TO})\n\n`;
  const tableHead = `| タイトル | 記事ページへ | 引用元 |\n|---|---|---|\n`;
  const tableBody = list.map(r => `| ${r.title} | ${r.art} | ${r.src} |`).join("\n");

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_FILE, ensureLf(header + tableHead + tableBody + "\n"), "utf8");
  console.log(`[ok] weekly index written: ${path.relative(ROOT, OUT_FILE)}`);
}

main().catch(e=>{ console.error(e); process.exit(1); });
