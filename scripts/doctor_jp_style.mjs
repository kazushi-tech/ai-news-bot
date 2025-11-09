import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(process.env.NEWS_ROOT ?? ".");
const DIRS = [path.join(ROOT, "articles"), path.join(ROOT, "ai-news","articles")];

async function jpize(fp){
  let txt = await fs.readFile(fp,"utf8");
  txt = txt
    .replace(/>\s*\[!cite\].*?\n/gs,"> [!cite] 引用元\n")
    .replace(/^\#\#\s*(TL;?\s*DR|Summary)\s*$/gmi,"## 概要")
    .replace(/^\#\#\s*(Key\s*Points?|Details?)\s*$/gmi,"## 詳細レポート")
    .replace(/^\#\#\s*(Post|Tweet|Original)\s*$/gmi,"## 投稿内容")
    .replace(/\bSource\b/g,"引用元")
    .replace(/^Title:\s*X.*\n/gmi,"");
  await fs.writeFile(fp, txt, "utf8");
}

for (const dir of DIRS){
  try{
    const files = (await fs.readdir(dir)).filter(f=>f.endsWith(".md"));
    for (const f of files) await jpize(path.join(dir,f));
  }catch{}
}
console.log("[doctor] jp style applied.");
