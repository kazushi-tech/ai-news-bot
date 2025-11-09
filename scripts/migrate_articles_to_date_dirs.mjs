// Move articles/*.md -> articles/YYYY-MM-DD/*.md に整理し、frontmatter.date を補完
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "articles");

function ymd(d){ return new Date(d).toISOString().slice(0,10); }

async function ensureDir(p){ await fs.mkdir(p, { recursive: true }); }

async function main(){
  const files = (await fs.readdir(SRC_DIR)).filter(f => f.endsWith(".md"));
  let moved = 0;

  for (const f of files){
    const fp  = path.join(SRC_DIR, f);
    const raw = await fs.readFile(fp, "utf8");
    const fm  = matter(raw);

    // 日付の決定（frontmatter > ファイル名 > mtime）
    let date = fm.data.date;
    if (!date){
      const m = f.match(/^(\d{4}-\d{2}-\d{2})--/);
      if (m) date = m[1];
    }
    if (!date){
      const st = await fs.stat(fp);
      date = ymd(st.mtimeMs || st.mtime);
    }
    fm.data.date = date;

    // 置き場とファイル名
    const dir = path.join(SRC_DIR, date);
    await ensureDir(dir);
    const base = f.replace(/^(\d{4}-\d{2}-\d{2})--/, ""); // 先頭日付プレフィックスは外す
    const dst = path.join(dir, base);

    // 書き出し＆元ファイル削除
    await fs.writeFile(dst, matter.stringify(fm.content.trim()+"\n", fm.data), "utf8");
    await fs.unlink(fp);
    moved++;
  }
  console.log(`[migrate] moved ${moved} file(s).`);
}
main().catch(e => { console.error(e); process.exit(1); });
