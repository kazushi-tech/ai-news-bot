// scripts/doctor_fix_brackets.mjs
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const ROOT = path.resolve(process.cwd());
const DIR  = path.join(ROOT, "articles");

const VAR = {
  summary:["概要","要約","サマリー","TL;DR","TLDR"],
  background:["背景・前提","背景","前提"],
  points:["具体的なポイント","要点","ポイント","Key Points","キーポイント"],
  implications:["重要な示唆","示唆","Implications","意味合い"],
  risks:["リスク・未確定要素","リスク","課題","懸念","Limitations"],
};
const ORDER = [
  ["summary","summary","概要"],
  ["background","note","背景・前提"],
  ["points","check","具体的なポイント"],
  ["implications","tip","重要な示唆"],
  ["risks","warning","リスク・未確定要素"],
];
const esc = s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const ALL = Object.values(VAR).flat().map(esc).join("|");

function bracketsToH(txt){
  return txt.replace(/^\s*(?:>\s*)?\[\s*!?\w+\s*\]\s*(.+?)\s*$/gmi,"## $1");
}
function hToCallout(md){
  for(const [k,tag,label] of ORDER){
    const w = VAR[k].map(esc).join("|");
    const re = new RegExp(
      String.raw`(^|\n)\s*#{1,6}\s*(?:${w})(?:\s*[:：])?\s*\r?\n` +
      String.raw`([\s\S]*?)(?=(\n\s*#{1,6}\s*(?:${ALL})(?:\s*[:：])?\s*\r?\n)|\n?$)`,"gi");
    md = md.replace(re, (_m,pfx,body)=>{
      const q = body.trimEnd().split("\n").map(l=>`> ${l}`.replace(/>\s*$/,"")).join("\n");
      return `${pfx}> [!${tag}] ${label}\n${q}\n`;
    });
  }
  return md;
}
async function run(){
  const files=(await fs.readdir(DIR)).filter(f=>f.endsWith(".md"));
  let fixed=0;
  for(const f of files){
    const fp=path.join(DIR,f);
    const raw=await fs.readFile(fp,"utf8");
    const fm =matter(raw);
    let body=fm.content;
    const before=body;
    body=bracketsToH(body);
    body=hToCallout(body);
    if(body!==before){
      const next=matter.stringify(body.trim()+"\n",fm.data);
      await fs.writeFile(fp,next,"utf8");
      fixed++;
    }
  }
  console.log(`[doctor-fix-brackets] fixed ${fixed} file(s).`);
}
run().catch(e=>{ console.error(e); process.exit(1); });
