// file: .dev/scripts/collect_clips.mjs
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { formatInTimeZone } from 'date-fns-tz';

const ROOT   = process.env.NEWS_ROOT || './ai-news';
const CLIPS  = path.join(ROOT, 'sources');
const ART    = path.join(ROOT, 'articles');
const TZ     = 'Asia/Tokyo';
const MODEL  = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// --- helpers ---
function today(){ return formatInTimeZone(new Date(), TZ, 'yyyy-MM-dd'); }
function slugFromTitle(t=''){
  return t.toLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu,'-').replace(/^-+|-+$/g,'').slice(0,80) || 'clip';
}
function hostSlugFromUrl(u){
  try{
    const { hostname, pathname } = new URL(u);
    const host = hostname.replace(/^www\./,'');
    const slug = (pathname || '/').replace(/\/+/g,'/').replace(/^\/|\/$/g,'').replace(/\//g,'-').slice(0,80) || 'index';
    return { host, slug };
  }catch{ return { host:'unknown', slug:'clip' }; }
}
async function existsByHostSlug(date, host, slug){
  try{
    await fs.access(path.join(ART, `${date}--${host}--${slug}.md`));
    return true;
  }catch{ return false; }
}
async function walk(dir, out=[]){
  const ents = await fs.readdir(dir, { withFileTypes: true }).catch(()=>[]);
  for(const e of ents){
    if(e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if(e.isDirectory()) await walk(p, out);
    else if(/\.(md|markdown|html?)$/i.test(e.name)) out.push(p);
  }
  return out;
}
function fromFrontmatterUrl(md){
  try{
    const { data } = matter(md);
    if(data?.source_url) return String(data.source_url);
    if(data?.url)        return String(data.url);
  }catch{}
  return '';
}
function bodyTextFromRaw(raw){
  return raw
    .replace(/```[\s\S]*?```/g,'')
    .replace(/>\s.+/g,'')
    .replace(/#+\s.+/g,'')
    .replace(/\s+/g,' ')
    .trim()
    .slice(0, 16000);
}
function initialMd({ title, tldr, source_url }){
  return [
    `# ${title}`,
    '',
    '## TL;DR',
    '',
    tldr,
    '',
    '## 概要',
    '',
    '## 詳細レポート',
    '',
    '## 抽出テキスト',
    '',
    '## 具体的なポイント',
    '',
    '## 重要な示唆',
    '',
    '## リスク・未確定要素',
    '',
    '## 引用・ソース',
    '',
    source_url ? `- 元記事: ${source_url}` : ''
  ].join('\n').trim() + '\n';
}
function simpleTLDR(text){
  if(!text) return 'クリップ本文が空でした。';
  const s = text.split(/(?<=。|！|!|？|\?)\s*/).slice(0,3).map(x=>'・'+x.trim()).join('\n');
  return s || 'クリップ本文が空でした。';
}

// --- main ---
(async()=>{
  await fs.mkdir(ART, { recursive: true });

  const files = await walk(CLIPS);
  let added = 0, scanned = files.length;

  for(const fp of files){
    // よくある不要ノート名はスキップ
    const base = path.basename(fp);
    if(/^welcome|無題のファイル/i.test(base)) continue;

    const raw = await fs.readFile(fp,'utf8').catch(()=> '');
    if(!raw) continue;

    const url = fromFrontmatterUrl(raw) || (raw.match(/https?:\/\/[^\s<>()]+/)?.[0] ?? '');
    const { host, slug: s2 } = url ? hostSlugFromUrl(url) : { host:'unknown', slug:'clip' };

    const date = today();
    const bodyText = bodyTextFromRaw(raw);
    const tldr = simpleTLDR(bodyText);

    // タイトルはH1 or frontmatter.title or ファイル名
    const fm0 = matter(raw).data || {};
    const mTitle = raw.match(/^#\s+(.+)$/m)?.[1]?.trim()
      || String(fm0.title || '').trim()
      || base.replace(/\.(md|markdown|html?)$/i,'');
    const slug = s2 !== 'clip' ? s2 : slugFromTitle(mTitle);

    if(await existsByHostSlug(date, host, slug)) continue;

    const fm = { title: mTitle, date, model: MODEL, source_url: url || undefined, host };
    const out = matter.stringify(initialMd({ title: mTitle, tldr, source_url: url }), fm);
    await fs.writeFile(path.join(ART, `${date}--${host}--${slug}.md`), out, 'utf8');
    added++;
  }

  console.log(`[collect:clips] scanned ${scanned}, added ${added}`);
})().catch(e=>{ console.error(e); process.exit(1); });
