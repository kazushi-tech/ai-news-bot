#!/usr/bin/env node
/**
 * build_index_weekly.mjs
 * 期間内の summary/*.md だけから週次ページを生成（重複排除 & 日本語のみ）
 *
 * 使い方:
 *   node scripts/build_index_weekly.mjs                    # 直近7日
 *   node scripts/build_index_weekly.mjs --from=2025-10-21 --to=2025-10-27
 *   node scripts/build_index_weekly.mjs --allow=bloomberg.co.jp,theinformation.com  # ホワイトリスト
 *   node scripts/build_index_weekly.mjs --no-snippet       # 3列 (タイトル|記事|引用元)
 */

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

/* ---------- args ---------- */
const args = Object.fromEntries(
  process.argv.slice(2).map(a => {
    const [k, ...rest] = a.replace(/^--/, "").split("=");
    return [k, rest.join("=") || true];
  })
);

const RANGE_DAYS = 7;
const allowHosts = (args.allow || "").split(",").filter(Boolean);

/* ---------- utils ---------- */
const z = n => String(n).padStart(2,"0");
const fmt = d => `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}`;
function ymd(s){ const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(s||""); return m? new Date(+m[1], +m[2]-1, +m[3]) : null; }

function escapeCell(s=""){ return String(s).replace(/\|/g,"\\|").replace(/\r?\n|\r/g," "); }
function stripMd(s=""){ return s.replace(/\[([^\]]+)\]\([^)]+\)/g,"$1").replace(/[*_`>#]/g,"").replace(/\s+/g," ").trim(); }
function shorten(s="",n=140){ s=s.trim(); return s.length>n? s.slice(0,n-1)+"…" : s; }
function wiki(fp,label){ return `[[${fp.replace(/\.md$/i,"")}|${label}]]`; }

function extractSnippet(md){
  const pick = (re) => {
    const m = md.match(re);
    if(!m) return null;
    const bullets = m[1].split(/\r?\n/).map(l=>l.replace(/^\s*-\s?/, "").trim()).filter(Boolean);
    return bullets.length ? bullets.slice(0,2).map(stripMd).join(" / ") : null;
  };
  return pick(/^\s*#\s*TL;DR[\s\r\n]+((?:-\s?.*(?:\r?\n|$))+)/im)
      || pick(/^\s*##\s*Key Points[\s\r\n]+((?:-\s?.*(?:\r?\n|$))+)/im)
      || stripMd(md).slice(0,200);
}

// ざっくり日本語判定（かな/カナ/漢字比）
function isJapanese(s=""){
  const ja = (s.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/g) || []).length;
  const lat = (s.match(/[A-Za-z]/g) || []).length;
  return ja >= 10 && ja >= lat * 0.5;
}

// URL 正規化して重複判定キーを作る
function canonical(u=""){
  try{
    const url = new URL(u);
    url.hash = "";
    const kill = /^(utm_|gclid|fbclid|spm|igshid|mc_cid|mc_eid)/i;
    [...url.searchParams.keys()].forEach(k => { if(kill.test(k)) url.searchParams.delete(k); });
    return url.toString();
  }catch{ return (u||"").trim(); }
}

/* ---------- load summaries ---------- */
const summaryDir = "summary";
let files = (await fs.readdir(summaryDir)).filter(f=>f.endsWith(".md")).map(f=>path.join(summaryDir,f));

const all = [];
for(const fp of files){
  const raw = await fs.readFile(fp, "utf8");
  const { data: fm, content } = matter(raw);
  const date = (fm.date || "").toString().slice(0,10);
  if(!date) continue;
  const row = {
    file: fp,
    date,
    title: (fm.title || path.basename(fp)).toString(),
    host: (fm.host || "").toString(),
    src: (fm.source_url || "").toString(),
    model: (fm.model || "").toString(),
    lang: (fm.lang || "").toString().toLowerCase(),
    snippet: extractSnippet(content)
  };
  all.push(row);
}

/* ---------- range ---------- */
let start, end;
if(args.from && args.to){
  start = ymd(args.from); end = ymd(args.to);
}else{
  end = new Date();               // 今日
  start = new Date(end); start.setDate(end.getDate()- (RANGE_DAYS-1));
}
const IN = new Set();
{ // inclusive filter
  const s = fmt(start), e = fmt(end);
  for(const r of all){ if(r.date >= s && r.date <= e) IN.add(r); }
}

/* ---------- filter: allowHosts / lang=ja ---------- */
let rows = all.filter(r => IN.has(r));
if(allowHosts.length) rows = rows.filter(r => allowHosts.includes(r.host));
rows = rows.filter(r => r.lang === "ja" || isJapanese(r.snippet) || isJapanese(r.title));

/* ---------- dedupe by source_url (canonical) then by (host+title) ---------- */
const seen = new Set();
const out = [];
for(const r of rows){
  const key = canonical(r.src) || `${r.host}::${stripMd(r.title).toLowerCase()}`;
  if(seen.has(key)) continue;
  seen.add(key);
  out.push(r);
}

/* ---------- group by date ---------- */
const byDate = new Map();
for(const r of out){
  if(!byDate.has(r.date)) byDate.set(r.date, []);
  byDate.get(r.date).push(r);
}
for(const [d, arr] of byDate) arr.sort((a,b)=> a.title.localeCompare(b.title));

/* ---------- render ---------- */
let md = `---\n`;
md += `title: "index-weekly"\n`;
md += `generated: "${fmt(new Date())}"\n`;
md += `type: "ai-news-weekly"\n`;
md += `---\n\n`;
md += `# 週間インデックス\n\n`;
md += `生成日: ${fmt(new Date())}\n\n`;

const days = [...byDate.keys()].sort(); // 古い→新しい
for(const d of days){
  md += `## ${d}\n\n`;
  md += `### [[news/${d}--AI-news|AI News — ${d}]]\n\n`;
  const arr = byDate.get(d);
  if(args["no-snippet"]){
    md += `| タイトル | 記事 | 引用元 |\n|:--|:--:|:--:|\n`;
    for(const it of arr){
      const title = escapeCell(stripMd(it.title));
      const article = wiki(it.file, "記事ページへ");
      const cite = it.src ? `[引用元へ](${it.src})` : escapeCell(it.host||"");
      md += `| ${title} | ${article} | ${cite} |\n`;
    }
  }else{
    md += `| タイトル | 記事 | 引用元 | 要約 |\n|:--|:--:|:--:|:--|\n`;
    for(const it of arr){
      const title = escapeCell(stripMd(it.title));
      const article = wiki(it.file, "記事ページへ");
      const cite = it.src ? `[引用元へ](${it.src})` : escapeCell(it.host||"");
      const snip = escapeCell(shorten(stripMd(it.snippet), 140));
      md += `| ${title} | ${article} | ${cite} | ${snip} |\n`;
    }
  }
  md += `\n`;
}

/* ---------- write ---------- */
await fs.mkdir("news", { recursive: true });
const name = `index-weekly.md`;
await fs.writeFile(path.join("news", name), md, "utf8");
console.log("✔ weekly index → news/" + name);
