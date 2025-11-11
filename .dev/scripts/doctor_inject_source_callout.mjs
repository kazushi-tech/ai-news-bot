// scripts/doctor_inject_source_callout.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = path.resolve(process.env.NEWS_ROOT ?? path.resolve('.'));
const ARTICLES = path.join(ROOT, 'articles');

function hasCiteCallout(content){
  return /^\s*>\s*\[!cite\]/i.test(content) || /^\s*>\s*引用元/.test(content);
}

async function main(){
  const files = (await fs.readdir(ARTICLES).catch(()=>[])).filter(f=>f.endsWith('.md'));
  let fixed = 0;
  for(const f of files){
    const fp = path.join(ARTICLES, f);
    const raw = await fs.readFile(fp, 'utf8');
    const fm = matter(raw);
    const url = fm.data?.source_url || fm.data?.url;
    if(!url) continue;
    if(hasCiteCallout(fm.content)) continue;

    const callout =
`> [!cite] 引用元
> [引用元へ](${url})

`;
    const out = matter.stringify(callout + fm.content, fm.data);
    await fs.writeFile(fp, out, 'utf8');
    fixed++;
  }
  console.log(`[doctor] injected cite callout into ${fixed} file(s).`);
}
main().catch(e=>{ console.error(e); process.exit(1); });
