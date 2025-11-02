#!/usr/bin/env node
/**
 * build_index_weekly.mjs (重複排除 + 日本語優先 / デフォ3列)
 * 直近7日または --from/--to の範囲で weekly を生成
 * 列: タイトル | 記事(内部リンク) | 引用元(外部リンク)
 *
 * 使い方:
 *   node scripts/build_index_weekly.mjs
 *   node scripts/build_index_weekly.mjs --from=2025-10-21 --to=2025-10-27
 *   node scripts/build_index_weekly.mjs --allow=bloomberg.co.jp,theinformation.com
 *   node scripts/build_index_weekly.mjs --with-snippet  # 4列
 */

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

/* ---------- args & utils ---------- */
const args = Object.fromEntries(process.argv.slice(2).map(a=>{
  const [k,...v]=a.replace(/^--/,"").split("="); return [k, v.join("=")||true];
}));
const allowHosts = (args.allow||"").split(",").filter(Boolean);
const withSnippet = !!args["with-snippet"];

const z=n=>String(n).padStart(2,"0");
const fmt=d=>`${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}`;
const ymd=s=>{ const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(s||"")); return m? new Date(+m[1],+m[2]-1,+m[3]) : null; };
const escapeCell=s=>String(s||"").replace(/\|/g,"\\|").replace(/\r?\n|\r/g," ");
const stripMd=s=>String(s||"").replace(/\[([^\]]+)\]\([^)]+\)/g,"$1").replace(/[*_`>#]/g,"").replace(/\s+/g," ").trim();
const shorten=(s,n=140)=>(s=String(s||"").trim(), s.length>n?s.slice(0,n-1)+"…":s);
const wiki=(fp,label)=>`[[${fp.replace(/\.md$/i,"")}|${label}]]`;
function snippet(md){
  const sec=(re)=>{ const m=md.match(re); if(!m) return null;
    const bullets=m[1].split(/\r?\n/).map(l=>l.replace(/^\s*-\s?/,"").trim()).filter(Boolean);
    return bullets.length? bullets.slice(0,2).map(stripMd).join(" / ") : null; };
  return sec(/^\s*#\s*TL;DR[\s\r\n]+((?:-\s?.*(?:\r?\n|$))+)/im) ||
         sec(/^\s*##\s*Key Points[\s\r\n]+((?:-\s?.*(?:\r?\n|$))+)/im) ||
         stripMd(md).slice(0,200);
}
// 簡易日本語判定
function isJa(s=""){ const ja=(s.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/g)||[]).length; const en=(s.match(/[A-Za-z]/g)||[]).length; return ja>=10 && ja>=en*0.5; }
function canonical(u=""){ try{ const url=new URL(u); url.hash=""; const kill=/^(utm_|gclid|fbclid|spm|igshid)/i; [...url.searchParams.keys()].forEach(k=>kill.test(k)&&url.searchParams.delete(k)); return url.toString(); }catch{ return (u||"").trim(); } }

/* ---------- load summaries ---------- */
const sdir="summary";
const files=(await fs.readdir(sdir)).filter(f=>f.endsWith(".md")).map(f=>path.join(sdir,f));
const all=[];
for(const fp of files){
  const raw=await fs.readFile(fp,"utf8");
  const {data:fm, content}=matter(raw);
  const date=(fm.date||"").toString().slice(0,10); if(!date) continue;
  all.push({
    file: fp, date,
    title: (fm.title||path.basename(fp)).toString(),
    host: (fm.host||"").toString(),
    src : (fm.source_url||"").toString(),
    lang: (fm.lang||"").toString().toLowerCase(),
    snippet: snippet(content),
  });
}

/* ---------- range ---------- */
let from, to;
if(args.from && args.to){ from=ymd(args.from); to=ymd(args.to); }
else{ to=new Date(); from=new Date(to); from.setDate(to.getDate()-6); } // 直近7日
const IN = new Set(all.filter(r=>r.date>=fmt(from) && r.date<=fmt(to)));

/* ---------- filter: host allow / 日本語 --------- */
let rows = [...IN];
if(allowHosts.length) rows = rows.filter(r=>allowHosts.includes(r.host));
rows = rows.filter(r => r.lang==="ja" || isJa(r.title) || isJa(r.snippet));

/* ---------- dedupe by canonical(source_url) or (host+title) ---------- */
const seen=new Set(), uniq=[];
for(const r of rows){
  const key = canonical(r.src) || `${r.host}::${stripMd(r.title).toLowerCase()}`;
  if(seen.has(key)) continue; seen.add(key); uniq.push(r);
}

/* ---------- group by date ---------- */
const byDate=new Map();
for(const r of uniq){ if(!byDate.has(r.date)) byDate.set(r.date,[]); byDate.get(r.date).push(r); }
for(const [d,arr] of byDate) arr.sort((a,b)=>a.title.localeCompare(b.title));

/* ---------- render ---------- */
let md=`---\n`;
md+=`title: "index-weekly"\n`;
md+=`generated: "${fmt(new Date())}"\n`;
md+=`type: "ai-news-weekly"\n`;
md+=`---\n\n# 週間インデックス\n\n生成日: ${fmt(new Date())}\n\n`;

const days=[...byDate.keys()].sort(); // 古い→新しい
for(const d of days){
  md+=`## ${d}\n\n`;
  md+=`### [[news/${d}--AI-news|AI News — ${d}]]\n\n`;
  const arr=byDate.get(d);
  if(!withSnippet){
    md+=`| タイトル | 記事 | 引用元 |\n|:--|:--:|:--:|\n`;
    for(const it of arr){
      const t=escapeCell(stripMd(it.title));
      const art=wiki(it.file,"記事ページへ");
      const cite=it.src?`[引用元へ](${it.src})`:escapeCell(it.host||"");
      md+=`| ${t} | ${art} | ${cite} |\n`;
    }
  }else{
    md+=`| タイトル | 記事 | 引用元 | 要約 |\n|:--|:--:|:--:|:--|\n`;
    for(const it of arr){
      const t=escapeCell(stripMd(it.title));
      const art=wiki(it.file,"記事ページへ");
      const cite=it.src?`[引用元へ](${it.src})`:escapeCell(it.host||"");
      const sn=escapeCell(shorten(stripMd(it.snippet),140));
      md+=`| ${t} | ${art} | ${cite} | ${sn} |\n`;
    }
  }
  md+=`\n`;
}

/* ---------- write ---------- */
await fs.mkdir("news",{recursive:true});
await fs.writeFile(path.join("news","index-weekly.md"), md, "utf8");
console.log("✔ weekly index → news/index-weekly.md");
