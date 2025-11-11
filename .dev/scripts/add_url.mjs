import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.env.NEWS_ROOT || './ai-news';
const Q    = path.join(ROOT, 'queue', 'urls.txt');

function normalize(u){
  try{
    const url = new URL(u.trim());
    // UTMパラメータ等を除去
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','fbclid','gclid','yclid'].forEach(k=>url.searchParams.delete(k));
    url.hash = '';
    return url.toString();
  }catch{ return ''; }
}

async function main(){
  const args = process.argv.slice(2);
  if(args.length === 0){
    console.error('Usage: npm run add:url -- https://example.com/article');
    process.exit(1);
  }
  const norm = args.map(normalize).filter(Boolean);
  const prev = await fs.readFile(Q, 'utf8').catch(()=> '');
  const set = new Set(prev.split('\n').map(s=>s.trim()).filter(Boolean));
  let added = 0;
  for(const u of norm){
    if(!set.has(u)){ set.add(u); added++; }
  }
  await fs.mkdir(path.dirname(Q), { recursive: true });
  await fs.writeFile(Q, Array.from(set).join('\n')+'\n', 'utf8');
  console.log(`[add:url] added ${added}, total ${set.size}`);
}
main().catch(e=>{ console.error(e); process.exit(1); });
