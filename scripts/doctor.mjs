// scripts/doctor.mjs
// リポの健全性を一括チェックして要点を表示（秘密の値は出さない）
import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.env.NEWS_ROOT ? path.resolve(process.env.NEWS_ROOT) : path.resolve("news");

function p(label, val) { console.log(label.padEnd(28), val); }
function ok(b){ return b ? "OK" : "NG"; }

async function exists(fp){ try { await fs.stat(fp); return true; } catch { return false; } }

async function list(dir){
  try{ return (await fs.readdir(dir)).sort(); }catch{ return []; }
}

async function checkArticles(){
  const dir = path.join(ROOT, "articles");
  const files = await list(dir);
  let valid = 0, invalid = 0;
  const bad = [];
  for(const f of files){
    if(!f.endsWith(".md")) continue;
    const raw = await fs.readFile(path.join(dir, f), "utf8");
    const { data } = matter(raw);
    const has = ["title","date","model","source_url","host"].every(k => !!data?.[k]);
    if(has) valid++; else { invalid++; bad.push(f); }
  }
  return { total: files.filter(f=>f.endsWith(".md")).length, valid, invalid, bad: bad.slice(0,10) };
}

function today(){
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${dd}`;
}

async function main(){
  console.log("== ai-news doctor ==");
  p("node", process.versions.node);
  p("cwd", process.cwd());
  p("NEWS_ROOT", ROOT);
  p("AI_NEWS_OFFLINE", process.env.AI_NEWS_OFFLINE || "(unset)");
  p("GEMINI_MODEL", process.env.GEMINI_MODEL || "(unset)");
  p("GOOGLE_API_KEY", process.env.GOOGLE_API_KEY ? "set" : "missing");

  const hasArticles = await exists(path.join(ROOT, "articles"));
  const hasDaily    = await exists(path.join(ROOT, "daily"));
  const hasWeekly   = await exists(path.join(ROOT, "weekly"));
  p("dir:articles", ok(hasArticles));
  p("dir:daily",    ok(hasDaily));
  p("dir:weekly",   ok(hasWeekly));

  const { total, valid, invalid, bad } = await checkArticles();
  p("articles total", total);
  p("frontmatter valid", `${valid} / ${total}`);
  p("frontmatter invalid", invalid);
  if(invalid) console.log("invalid samples:", bad.join(", "));

  const t = today();
  p(`daily/${t}.md`, ok(await exists(path.join(ROOT,"daily",`${t}.md`))));
  console.log("== done ==");
}

main().catch(e=>{ console.error(e); process.exit(1); });
