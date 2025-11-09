// scripts/doctor_dedupe_head.mjs
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const ROOT = path.resolve(process.cwd());
const DIR  = path.join(ROOT, "articles");

function dedupeTitle(md, title) {
  if (!title) return md;
  // まったく同じH1を全削除 → 最初の1個だけ残す
  const re = new RegExp(`^\\s*#\\s+${title.replace(/[.*+?^${}()|[\\]\\\\]/g,"\\$&")}\\s*$\\n?`, "gm");
  const hits = [...md.matchAll(re)].length;
  if (hits <= 1) return md;
  let removed = 0;
  return md.replace(re, () => (++removed === 1 ? (m)=>m : "")) // 2個目以降を空に
           .replace(/\n{3,}/g, "\n\n");
}

function dedupeQuote(md) {
  // [!quote] ブロックの2個目以降を削除
  const lines = md.split("\n");
  let cnt = 0;
  const out = [];
  for (let i=0;i<lines.length;i++){
    if (/^\s*>\s*\[!quote\]/i.test(lines[i])) {
      if (++cnt >= 2) { // 2個目以降はスキップして次の非引用行まで飛ばす
        i++;
        while (i < lines.length && /^\s*>/.test(lines[i])) i++;
        i--; continue;
      }
    }
    out.push(lines[i]);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

async function run() {
  const files = (await fs.readdir(DIR)).filter(f => f.endsWith(".md"));
  let fixed = 0;
  for (const f of files) {
    const fp = path.join(DIR, f);
    const raw = await fs.readFile(fp, "utf8");
    const fm  = matter(raw);
    let body  = fm.content;
    const before = body;
    body = dedupeTitle(body, fm.data.title);
    body = dedupeQuote(body);
    if (body !== before) {
      const next = matter.stringify(body.trim() + "\n", fm.data);
      await fs.writeFile(fp, next, "utf8");
      fixed++;
    }
  }
  console.log(`[doctor-dedupe] fixed ${fixed} file(s).`);
}
run().catch(e=>{ console.error(e); process.exit(1); });
