// frontmatterにdateが無ければ 1) ファイル名 2) mtime から補完
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const ROOT = path.resolve(process.cwd());
const DIR  = path.join(ROOT, "articles");

function fmt(d){ return new Date(d).toISOString().slice(0,10); }

async function run(){
  const files=(await fs.readdir(DIR)).filter(f=>f.endsWith(".md"));
  let fixed=0;
  for(const f of files){
    const fp = path.join(DIR,f);
    const raw= await fs.readFile(fp,"utf8");
    const fm = matter(raw);
    if (fm.data.date) continue;

    // 1) ファイル名頭 "YYYY-MM-DD--" から
    let d = null;
    const m = f.match(/^(\d{4}-\d{2}-\d{2})--/);
    if (m) d = m[1];
    // 2) 無ければ mtime
    if (!d){
      const st = await fs.stat(fp);
      d = fmt(st.mtimeMs || st.mtime);
    }

    fm.data.date = d;
    const next = matter.stringify(fm.content.trim()+"\n", fm.data);
    await fs.writeFile(fp,next,"utf8"); fixed++;
  }
  console.log(`[doctor-add-date] dated ${fixed} file(s).`);
}
run().catch(e=>{ console.error(e); process.exit(1); });
