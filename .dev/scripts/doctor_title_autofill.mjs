import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.env.NEWS_ROOT || './ai-news';
const ART  = path.join(ROOT, 'articles');

function cleanTitle(s=''){
  // 余計な "Title: ..." 残党やURL/slug除去
  return s
    .replace(/^\s*Title\s*:\s*/i,'')
    .replace(/\s*\|\s*.*$/,'') // " | Site" 等あれば切る（好みで）
    .replace(/https?:\/\/\S+/g,'')
    .replace(/--[a-z0-9-]+\.md$/i,'')
    .replace(/\s+/g,' ')
    .trim();
}

async function processFile(fp){
  const raw = await fs.readFile(fp,'utf8');
  const parsed = matter(raw);
  let body = parsed.content.replace(/\r\n/g,'\n');

  // 先頭H1を取得
  const h1Match = body.match(/^\s*#\s+(.+?)\s*$/m);
  const h1 = h1Match ? cleanTitle(h1Match[1]) : '';

  // fm.title優先、無ければH1、どちらも無ければファイル名から
  const base = path.basename(fp);
  const fallback = cleanTitle(base.replace(/\.md$/,'').replace(/^\d{4}-\d{2}-\d{2}--[^-]+--/,'').replace(/-/g,' '));
  const title = cleanTitle(parsed.data.title || h1 || fallback) || 'Untitled';

  // H1/frontmatterを同期
  let changed = false;
  if(parsed.data.title !== title){
    parsed.data.title = title;
    changed = true;
  }

  // 既存H1行をtitleに置換、無ければ先頭に挿入
  if(h1Match){
    body = body.replace(h1Match[0], `# ${title}`);
  }else{
    body = `# ${title}\n\n${body}`.replace(/\n{3,}/g,'\n\n');
  }

  // "Title: ..." の孤立行を削除
  body = body.replace(/^\s*Title\s*:\s*.*$/gmi, '');

  // 複数H1があれば2つ目以降をH2に
  let seenFirst = false;
  body = body.split('\n').map(line=>{
    if(/^#\s+/.test(line)){
      if(seenFirst){ return line.replace(/^#\s+/,'## '); }
      seenFirst = true;
      return line;
    }
    return line;
  }).join('\n');

  const out = matter.stringify(body.trim() + '\n', parsed.data);
  if(out !== raw){
    await fs.writeFile(fp, out, 'utf8');
    return true;
  }
  return changed;
}

async function main(){
  const files = (await fs.readdir(ART).catch(()=>[])).filter(f=>f.endsWith('.md'));
  let count = 0;
  for(const f of files){
    const fp = path.join(ART, f);
    const ok = await processFile(fp).catch(()=>false);
    if(ok) count++;
  }
  console.log(`[doctor:title] changed ${count}`);
}
main().catch(e=>{ console.error(e); process.exit(1); });
