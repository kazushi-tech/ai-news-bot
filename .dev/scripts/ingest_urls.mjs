import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import matter from 'gray-matter';
import { formatInTimeZone } from 'date-fns-tz';
import { fetch as undiciFetch } from 'undici';
import { spawn } from 'node:child_process';

const ROOT  = process.env.NEWS_ROOT || './ai-news';
const QFILE = path.join(ROOT, 'queue', 'urls.txt');
const ART   = path.join(ROOT, 'articles');

const API_KEY = process.env.GOOGLE_API_KEY || '';
const MODEL   = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const AUTO_PUSH = process.env.AUTO_PUSH === '1';

const TZ = 'Asia/Tokyo';

function today(){
  return formatInTimeZone(new Date(), TZ, 'yyyy-MM-dd');
}
function slugifyPathname(u){
  try{
    const { hostname, pathname } = new URL(u);
    let slug = pathname.replace(/\/+/g,'/').replace(/^\/|\/$/g,'') || 'index';
    slug = slug.replace(/[^a-zA-Z0-9\-/_]/g,'-').replace(/\//g,'-').slice(0, 80);
    return { host: hostname.replace(/^www\./,''), slug: slug || 'index' };
  }catch{
    return { host: 'unknown', slug: 'unknown' };
  }
}

async function fetchHtml(u){
  const res = await undiciFetch(u, {
    headers: { 'user-agent': 'Mozilla/5.0 AI-NewsBot' },
    redirect: 'follow'
  });
  if(!res.ok) throw new Error(`HTTP_${res.status}`);
  return await res.text();
}

async function readabilityExtract(html, url){
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document, { keepClasses: false });
  const article = reader.parse() || {};
  const title = article.title || dom.window.document.title || '';
  const textContent = (article.textContent || '').trim();
  return { title, textContent, content: article.content || '' };
}

async function geminiSummarize(text){
  if(!API_KEY) return '';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  const prompt = [
    '以下の本文を、日本語で3行以内の箇条書きTL;DRにしてください。',
    '・事実ベースで簡潔に',
    '・主語を補い、省略語は避ける',
    '・推測や宣伝は入れない'
  ].join('\n');
  const input = (text || '').slice(0, 9000);
  const res = await undiciFetch(endpoint, {
    method: 'POST',
    headers: { 'content-type':'application/json' },
    body: JSON.stringify({
      contents: [{ role:'user', parts:[{text: `${prompt}\n\n---\n${input}`}]}]
    })
  });
  if(!res.ok) return '';
  const data = await res.json();
  return (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
}

function fallbackTLDR(text){
  const clean = (text||'').replace(/\s+/g,' ').trim();
  if(!clean) return '本文が取得できませんでした。見出しと冒頭を確認してください。';
  const sentences = clean.split(/(?<=。|！|!|？|\?)\s*/).slice(0,3);
  return sentences.map(s=>`・${s.trim()}`).join('\n');
}

function initialMd({ title, tldr, source_url }){
  return [
    `# ${title}`,
    '',
    `> [!summary] TL;DR`,
    `> ${tldr.split('\n').join('\n> ')}`,
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

async function writeArticle({ url, title, textContent }){
  const { host, slug } = slugifyPathname(url);
  const date = today();
  const file = `${date}--${host}--${slug}.md`;
  const fp = path.join(ART, file);

  let tldr = '';
  try { tldr = await geminiSummarize(textContent); } catch {}
  if(!tldr) tldr = fallbackTLDR(textContent);

  const fm = {
    title: (title || '').trim() || slug,
    date,
    model: MODEL,
    source_url: url,
    host
  };
  const body = initialMd({ title: fm.title, tldr, source_url: url });
  const out = matter.stringify(body, fm);
  await fs.writeFile(fp, out, 'utf8');
  return fp;
}

async function buildHome(){
  await new Promise((resolve, reject)=>{
    const p = spawn(process.execPath, ['.dev/scripts/build_home.mjs'], { stdio: 'inherit' });
    p.on('exit', c=> c===0 ? resolve() : reject(new Error('home failed')));
  });
}
async function runDoctors(){
  for(const sc of ['doctor_title_autofill.mjs','doctor_layout_callouts.mjs','doctor_generate_tldr.mjs']){
    await new Promise((resolve, reject)=>{
      const p = spawn(process.execPath, [`.dev/scripts/${sc}`], { stdio:'inherit' });
      p.on('exit', c=> c===0 ? resolve() : reject(new Error(`${sc} failed`)));
    });
  }
}
async function maybePush(){
  if(process.env.AUTO_PUSH !== '1') return;
  await new Promise((resolve)=> {
    const p = spawn(process.execPath, ['.dev/scripts/push.mjs'], { stdio: 'inherit' });
    p.on('exit', ()=> resolve());
  });
}

async function main(){
  await fs.mkdir(ART, { recursive: true });
  const listRaw = await fs.readFile(QFILE, 'utf8').catch(()=> '');
  const urls = listRaw.split('\n').map(s=>s.trim()).filter(Boolean);
  if(urls.length === 0){
    console.log('[ingest] no urls');
    return;
  }

  let processed = 0;
  for(const url of urls){
    try{
      const html = await fetchHtml(url);
      const { title, textContent } = await readabilityExtract(html, url);
      await writeArticle({ url, title, textContent });
      processed++;
    }catch(e){
      console.error(`[ingest] failed ${url}`, e.message);
    }
  }

  // 取り込み済みURLをキューから削除
  const remain = new Set(urls);
  // 今回は全部処理試行した前提で空に（シンプル）
  await fs.writeFile(QFILE, '', 'utf8');

  await runDoctors();
  await buildHome();
  await maybePush();

  console.log(`[ingest] processed ${processed} / ${urls.length}`);
}

main().catch(e=>{ console.error(e); process.exit(1); });
