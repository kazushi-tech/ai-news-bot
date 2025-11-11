// scripts/bot_ingest_url.mjs  ← 全文置換（Xの429対策つき）
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import matter from 'gray-matter';
import * as cheerio from 'cheerio';
import { fetch as undiciFetch } from 'undici';

const ROOT     = path.resolve(process.env.NEWS_ROOT ?? path.resolve('.'));
const ARTICLES = path.join(ROOT, 'articles');
const TZ       = process.env.TIMEZONE || 'Asia/Tokyo';
const MODEL    = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const API_KEY  = process.env.GOOGLE_API_KEY;
if (!API_KEY) { console.error('GOOGLE_API_KEY がありません'); process.exit(1); }

function toYmdTokyo(ms) {
  const fmt = new Intl.DateTimeFormat('ja-JP', { timeZone: TZ, year:'numeric', month:'2-digit', day:'2-digit' });
  const p = Object.fromEntries(fmt.formatToParts(new Date(ms)).map(x=>[x.type,x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}
function hostFrom(u){ try{ return new URL(u).host.replace(/^www\./,''); } catch { return 'unknown'; } }
function slugify(s){
  return (s||'').toLowerCase()
    .replace(/[^\w\-]+/g,'-').replace(/\-+/g,'-').replace(/^\-+|\-+$/g,'').slice(0,80);
}
function shortHash(s){ return createHash('sha1').update(String(s)).digest('hex').slice(0,8); }

async function uniqueName(base){
  let name = base, n = 2;
  while (true){
    try { await fs.access(path.join(ARTICLES, name)); }
    catch { return name; }
    name = `${base.replace(/\.md$/,'')}-${n}.md`; n++;
  }
}

// ========== X(Twitter) 判定 & 取得ユーティリティ ==========
function isXUrl(u){
  try {
    const h = new URL(u).host.replace(/^www\./,'');
    return h === 'x.com' || h === 'twitter.com';
  } catch { return false; }
}
function parseX(u){
  try{
    const { pathname } = new URL(u);
    // /<user>/status/<id>
    const m = pathname.match(/^\/([^\/]+)\/status\/(\d{5,30})/);
    return m ? { user: m[1], id: m[2] } : null;
  }catch{ return null; }
}
async function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function fetchTweetViaSyndication(id){
  // レート制限(429)に当たることがある → 3回バックオフ
  const ep = (lang)=>`https://cdn.syndication.twimg.com/tweet?id=${id}&lang=${lang}`;
  const langs = ['ja','en'];
  for (let i=0;i<3;i++){
    try{
      const url = ep(langs[i%langs.length]);
      const res = await undiciFetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
      if (res.status === 429) throw new Error('429');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      const text = j.text || j.full_text || '';
      const user = j.user || {};
      const author = user.screen_name || user.name || '';
      const title = (text || '').split('\n')[0].slice(0, 60) || `X投稿 by @${author || 'unknown'}`;
      return { title, text, canonical: `https://x.com/${author || 'unknown'}/status/${id}` };
    }catch(e){
      if (e.message.includes('429')) { await sleep(1500*(i+1)); continue; }
      throw e;
    }
  }
  throw new Error('X syndication 429');
}
async function fetchTextViaJina(url){
  // r.jina.ai は“サーバサイドで取得→可読テキスト”を返す
  const res = await undiciFetch(`https://r.jina.ai/http://${url.replace(/^https?:\/\//,'')}`, {
    headers: { 'user-agent': 'Mozilla/5.0' }
  });
  if (!res.ok) throw new Error(`jina ${res.status}`);
  const text = await res.text();
  return text.trim();
}
async function fetchTweetViaNitter(user, id){
  // 予備。どれか生きていればOK（全部ダメでも握りつぶさない）
  const bases = [
    'https://nitter.net',
    'https://nitter.pufe.org',
    'https://n.quadvern.xyz'
  ];
  for (const base of bases){
    try{
      const url = `${base}/${user}/status/${id}`;
      const txt = await fetchTextViaJina(url); // NitterもJina経由でテキスト化
      if (txt) {
        const firstLine = txt.split('\n').find(Boolean) || '';
        return { title: firstLine.slice(0,60) || `X投稿 by @${user}`, text: txt, canonical: `https://x.com/${user}/status/${id}` };
      }
    }catch{}
  }
  throw new Error('nitter fallback failed');
}

async function fetchFromX(url){
  const p = parseX(url);
  if (!p) throw new Error('invalid x url');
  try{
    return await fetchTweetViaSyndication(p.id);
  }catch(e){
    // 429など → Jinaで直接x.comを読む → さらにNitter
    try{
      const txt = await fetchTextViaJina(url);
      if (txt) {
        const title = txt.split('\n').find(Boolean)?.slice(0,60) || `X投稿 by @${p.user}`;
        return { title, text: txt, canonical: `https://x.com/${p.user}/status/${p.id}` };
      }
    }catch{}
    // 最終フォールバック：Nitter系
    return await fetchTweetViaNitter(p.user, p.id);
  }
}

// ========== 汎用ページ抽出 ==========
async function fetchFinal(url){
  const res = await undiciFetch(url, { redirect: 'follow', headers: { 'user-agent':'Mozilla/5.0' } });
  const text = await res.text();
  const final = res.url || url;
  return { final, html: text };
}
function extractFromHtml(html){
  const $ = cheerio.load(html);
  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    $('title').first().text().trim() || '';
  const desc =
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    $('meta[name="twitter:description"]').attr('content') || '';
  const $scope = $('article').length ? $('article') : ($('main').length ? $('main') : $('body'));
  const paragraphs = $scope.find('p').map((_,el)=>$(el).text().trim()).get();
  const text = (paragraphs.join('\n\n') || desc).replace(/\n{3,}/g,'\n\n').trim();
  return { title, text };
}

// ========== Gemini ==========
async function geminiSummary({url, title, text, isSNS}){
  const system = `あなたは日本語のニュース編集者です。以下の${isSNS ? 'SNS投稿' : '記事本文'}を要約し、見出し・書式を整えたMarkdownを出力してください。
- 見出しH1: タイトル（推定でOK）
- セクション: 概要 / 具体的なポイント（箇条書き）/ 重要な示唆 / リスク・未確定要素 / 引用・ソース
- 「引用・ソース」には元URLを1行で記載
- 日本語で簡潔に`;
  const content = `# 入力
[URL] ${url}

[タイトル候補]
${title || '(未取得)'}

[本文]
${(text || '').slice(0, 20000)}
`;
  const body = { contents: [{ role: 'user', parts: [{ text: system + '\n\n' + content }]}] };
  const res = await undiciFetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent?key=${API_KEY}`, {
    method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Gemini API ${res.status}`);
  const json = await res.json();
  const out = json?.candidates?.[0]?.content?.parts?.map(p=>p.text).join('') ?? '';
  if (!out) throw new Error('Gemini応答が空です');
  return out.trim();
}

// ========== 記事ファイル出力 ==========
async function writeArticle({finalUrl, title, summaryMd}){
  const host = hostFrom(finalUrl);
  const date = toYmdTokyo(Date.now());
  const slug0 = slugify(title) || shortHash(finalUrl);
  const base  = `${date}--${host}--${slug0}.md`;
  const name  = await uniqueName(base);
  const fp = path.join(ARTICLES, name);

  const fm = { title: title || '(タイトル未取得)', source_url: finalUrl, host, date, model: MODEL };
  const callout = `> [!cite] 引用元
> [引用元へ](${finalUrl})

`;
  const md = matter.stringify(callout + summaryMd + '\n', fm);
  await fs.mkdir(ARTICLES, { recursive: true });
  await fs.writeFile(fp, md, 'utf8');
  return fp;
}

// ========== メイン ==========
async function main(){
  const urls = process.argv.slice(2).filter(Boolean);
  if (!urls.length){ console.error('使い方: npm run bot:url -- "<URL>" [<URL> ...]'); process.exit(1); }

  let ok=0, ng=0;
  for (const inputUrl of urls){
    try{
      let finalUrl = inputUrl;
      let title = '';
      let text  = '';
      let isSNS = false;

      if (isXUrl(inputUrl) && parseX(inputUrl)) {
        const t = await fetchFromX(inputUrl);
        finalUrl = t.canonical; title = t.title; text = t.text; isSNS = true;
      } else {
        const { final, html } = await fetchFinal(inputUrl);
        const ex = extractFromHtml(html);
        finalUrl = final; title = ex.title; text = ex.text;
      }

      if (!text) throw new Error('本文抽出に失敗（テキストが空）');

      const summary = await geminiSummary({ url: finalUrl, title, text, isSNS });
      const fp = await writeArticle({ finalUrl, title, summaryMd: summary });
      console.log('[bot] wrote:', path.relative(ROOT, fp));
      ok++;
    }catch(e){
      console.error('[bot] fail:', inputUrl, e.message);
      ng++;
    }
  }
  console.log(`[bot] done ok=${ok} ng=${ng}`);
}
main().catch(e=>{ console.error(e); process.exit(1); });
