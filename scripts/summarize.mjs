#!/usr/bin/env node
/**
 * scripts/summarize.mjs
 * Node 20+ (ESM) / モデルは gemini-2.5-flash に固定
 */
/* cspell:ignore Readability generativelanguage */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { fetch } from "undici";

/* ---------- const ---------- */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_SUMMARY_ROOT = path.join(ROOT, "summary");   // artifact 用
const OUT_ARTICLES_DIR = path.join(ROOT, "articles");  // 記事の最終保存先
const FORCED_MODEL = "gemini-2.5-flash";
const MAX_ARTICLE_CHARS = 30000;
const SHORT_BODY_THRESHOLD = 120;
const USER_AGENT = "Mozilla/5.0 (compatible; ai-news-bot/1.0)";

/* ---------- utils ---------- */
function parseArgs(argv){const o={};for(let i=2;i<argv.length;i++){const a=argv[i];if(a.startsWith("--")){const k=a.slice(2);const v=argv[i+1]&&!argv[i+1].startsWith("--")?argv[++i]:"true";o[k]=v;}}return o;}
const firstOf=v=>Array.isArray(v)?v[0]:v;
const ensureLf=s=>(s||"").replace(/\r\n?/g,"\n");
const trimLen=(s,m)=>!s?"":(s.length<=m?s:s.slice(0,m)+"\n...[truncated]...");
const slugify=s=>(s||"untitled").toLowerCase().replace(/[^a-z0-9\-]+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"");
function todayParts(d=new Date()){const yyyy=d.getFullYear();const mm=String(d.getMonth()+1).padStart(2,"0");const dd=String(d.getDate()).padStart(2,"0");return {yyyy,mm,dd};}
const pickApiKey=()=>process.env.GEMINI_API_KEY||process.env.GOOGLE_API_KEY||"";
function toPlainTextFromHtml(html){const dom=new JSDOM(html);const text=dom.window.document.body.textContent||"";return ensureLf(text).replace(/[ \t]+\n/g,"\n").replace(/\n{3,}/g,"\n\n").trim();}

/* ---------- fetch/extract ---------- */
async function fetchHtml(url,retry=2){for(let i=0;i<=retry;i++){try{const r=await fetch(url,{method:"GET",headers:{"user-agent":USER_AGENT,accept:"text/html,application/xhtml+xml"}});if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.text();}catch(e){if(i===retry)throw e;await delay(1000*(i+1));}}}
function extractFromJsonLd(doc){const scripts=[...doc.querySelectorAll('script[type="application/ld+json"]')];for(const s of scripts){const raw=s.textContent?.trim();if(!raw)continue;let j;try{j=JSON.parse(raw);}catch{continue;}const arr=Array.isArray(j)?j:[j];for(const c of arr){const t=(firstOf(c["@type"])||"").toString().toLowerCase();if(["article","newsarticle","blogposting"].includes(t)){const title=firstOf(c.headline)||c.name||"";const body=typeof c.articleBody==="string"?c.articleBody:"";if(body&&body.trim().length>=SHORT_BODY_THRESHOLD){return {title,articleBody:body};}}}}return null;}
function extractWithReadability(html){const dom=new JSDOM(html,{url:"https://example.com/"});const reader=new Readability(dom.window.document);const res=reader.parse();if(!res)return null;const title=res.title||"";const plain=toPlainTextFromHtml(res.content||"");if(plain.trim().length<SHORT_BODY_THRESHOLD)return null;return {title,articleBody:plain,readableHtml:res.content||""};}

/* ---------- LLM ---------- */
async function callGemini({apiKey,model,prompt}){const ep=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;const body={contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{temperature:0.3,topP:0.9,topK:40}};const r=await fetch(ep,{method:"POST",headers:{"content-type":"application/json; charset=utf-8"},body:JSON.stringify(body)});if(!r.ok){const t=await r.text().catch(()=> "");throw new Error(`Gemini HTTP ${r.status}: ${t}`);}const j=await r.json();const parts=j.candidates?.[0]?.content?.parts||[];return parts.map(p=>p.text||"").join("");}
async function makeJaTitle(apiKey, model, srcTitle, bodyText){
  const p = [
    "次の英語タイトルを日本語の新聞見出しに翻訳・要約してください。全角48文字以内・句点なし・固有名詞は維持。",
    "",
    `英語タイトル: ${srcTitle}`,
    "",
    "参考本文（必要なら参照）:",
    trimLen(bodyText, 2000)
  ].join("\n");
  const out = (await callGemini({apiKey, model, prompt:p})).trim();
  return out.split(/\r?\n/)[0].replace(/^["'#\s]+|["'\s]+$/g,"");
}

/* ---------- prompt ---------- */
function buildPromptJa({title,url,articleText}){return[
  "あなたは一流のテックニュース編集者です。以下の記事本文を読み、指定のテンプレで日本語要約してください。",
  "",
  "出力はMarkdown。各セクション見出しはそのまま使い、簡潔かつ具体的に。表が必要そうならMarkdownのTABLEで。",
  "",
  "## 概要 (TL;DR)",
  "## 重要ポイント",
  "## 詳細レポート（What happened/背景/影響/関係者/データ）",
  "## 引用（Notable quotes）",
  "## リスクと課題",
  "## 今後の見通し/アクション",
  "## Source URL（必須）",
  url,"",
  `タイトル: ${title || ""}`,
  `URL: ${url}`,"",
  "【本文】",
  articleText,
].join("\n");}

function buildFrontmatter({ title, titleJa, url, model, host, dateY, dateM, dateD }){
  const dateStr = `${dateY}-${dateM}-${dateD}`;
  const esc = s => (s||"").replace(/"/g,'\\"');
  return [
    "---",
    `title: "${esc(title)}"`,
    `title_ja: "${esc(titleJa||"")}"`,
    `source_url: "${esc(url)}"`,
    `date: "${dateStr}"`,
    `model: "${model}"`,
    `host: "${esc(host)}"`,
    "tags: [ai-news]",
    "---",
    "",
  ].join("\n");
}

/* ---------- core ---------- */
async function processOneUrl(targetUrl, runId){
  const { yyyy, mm, dd } = todayParts();
  let title=""; let articleText=""; let readableHtml=""; let html="";

  // URL
  let u;try{u=new URL(targetUrl);}catch{throw new Error(`Invalid URL: ${targetUrl}`);}
  const host=u.host.toLowerCase();

  // fetch
  try{html=await fetchHtml(targetUrl);}catch(e){console.warn(`[warn] fetch failed: ${e.message}`);}
  if(html){
    try{const doc=new JSDOM(html).window.document;const jl=extractFromJsonLd(doc);if(jl){title=jl.title||title;articleText=ensureLf(jl.articleBody||"").trim();}}catch(e){console.warn(`[warn] JSON-LD parse failed: ${e.message}`);}
    if(!articleText || articleText.length<SHORT_BODY_THRESHOLD){const r=extractWithReadability(html);if(r){if(!title)title=r.title||title;articleText=r.articleBody||"";readableHtml=r.readableHtml||"";}}
  }

  const artifactDir=path.join(OUT_SUMMARY_ROOT,`${runId}-${host}`);
  await fs.mkdir(artifactDir,{recursive:true});
  await fs.mkdir(OUT_ARTICLES_DIR,{recursive:true});

  const fileTail = slugify(title || u.pathname.split("/").filter(Boolean).slice(-1)[0] || "untitled");
  const articleName = `${yyyy}-${mm}-${dd}--${host}--${fileTail}.md`;

  // 失敗時スタブ
  if(!articleText || articleText.trim().length<SHORT_BODY_THRESHOLD){
    const fm = buildFrontmatter({title, titleJa:"", url:targetUrl, model:FORCED_MODEL, host, dateY:yyyy, dateM:mm, dateD:dd});
    const stub = fm + "> 本文抽出に失敗。後で別ソースURLで再実行するか、Webクリッパーで `clips/` に保存。\n\n---\n" + `Source URL: ${targetUrl}\n`;
    await fs.writeFile(path.join(artifactDir,"summary.md"), ensureLf(stub),"utf8");
    await fs.writeFile(path.join(OUT_ARTICLES_DIR, articleName), ensureLf(stub),"utf8");
    if(html) await fs.writeFile(path.join(artifactDir,`${host}.html`), ensureLf(html),"utf8");
    console.log(`[info] saved stub -> articles/${articleName}`); return;
  }

  const apiKey = pickApiKey();
  if(!apiKey){
    const fm = buildFrontmatter({title, titleJa:"", url:targetUrl, model:FORCED_MODEL, host, dateY:yyyy, dateM:mm, dateD:dd});
    const body = fm + "> 要約失敗: GEMINI_API_KEY / GOOGLE_API_KEY が未設定。\n\n---\n" + `Source URL: ${targetUrl}\n`;
    await fs.writeFile(path.join(artifactDir,"summary.md"), ensureLf(body),"utf8");
    await fs.writeFile(path.join(OUT_ARTICLES_DIR, articleName), ensureLf(body),"utf8");
    if(html) await fs.writeFile(path.join(artifactDir,`${host}.html`), ensureLf(html),"utf8");
    console.log("[warn] API key missing. Wrote stub."); return;
  }

  const model = FORCED_MODEL;
  // 日本語要約
  let summaryMd=""; 
  try{
    const prompt = buildPromptJa({title, url:targetUrl, articleText: trimLen(ensureLf(articleText), MAX_ARTICLE_CHARS)});
    summaryMd = await callGemini({apiKey, model, prompt});
  }catch(e){console.warn(`[warn] Gemini error: ${e.message}`);}

  // 日本語タイトル
  let titleJa="";
  try{ titleJa = await makeJaTitle(apiKey, model, title, articleText); }catch{ titleJa=""; }

  const fm = buildFrontmatter({
    title, titleJa, url:targetUrl, model, host,
    dateY:yyyy, dateM:mm, dateD:dd
  });

  let finalMd;
  if(!summaryMd || summaryMd.trim().length<30){
    finalMd = fm + "> 要約生成に失敗しました。後で再実行してください。\n\n---\n" + `Source URL: ${targetUrl}\n`;
  }else{
    const body = ensureLf(summaryMd).trim();
    const withSrc = body.endsWith(targetUrl) ? body : body + "\n\n---\n## Source URL（必須）\n" + targetUrl + "\n";
    finalMd = fm + withSrc + "\n";
  }

  await fs.writeFile(path.join(artifactDir,"summary.md"), ensureLf(finalMd),"utf8");
  await fs.writeFile(path.join(OUT_ARTICLES_DIR, articleName), ensureLf(finalMd),"utf8");
  if(readableHtml) await fs.writeFile(path.join(artifactDir,`${host}.html`), ensureLf(readableHtml),"utf8");
  else if(html) await fs.writeFile(path.join(artifactDir,`${host}.html`), ensureLf(html),"utf8");

  console.log(`[ok] ${targetUrl} -> articles/${articleName}`);
}

/* ---------- main ---------- */
async function main(){
  const args=parseArgs(process.argv);
  const single=args.url&&args.url!=="true"?String(args.url):"";
  const seed=args["seed-file"]&&args["seed-file"]!=="true"?String(args["seed-file"]): (args.seed_file&&args.seed_file!=="true"?String(args.seed_file):"");

  if(!single && !seed){console.error("Usage: node scripts/summarize.mjs --url <URL> | --seed-file <path>");process.exit(2);}
  await fs.mkdir(OUT_SUMMARY_ROOT,{recursive:true}); await fs.mkdir(OUT_ARTICLES_DIR,{recursive:true});
  const runId = process.env.GITHUB_RUN_ID || process.env.RUN_ID || String(Date.now());

  let urls=[];
  if(single){urls=[single];}
  else{
    const raw = await fs.readFile(path.isAbsolute(seed)?seed:path.join(ROOT,seed),"utf8");
    urls = raw.split(/\r?\n/).map(l=>l.trim()).filter(l=>l && !l.startsWith("#"));
  }

  for (const u of urls){
    try{ await processOneUrl(u, runId); }catch(e){ console.error(`[error] ${u}: ${e.stack||e.message}`); }
  }
}
if(import.meta.url===`file://${process.argv[1]}`){main().catch(e=>{console.error(e.stack||e.message);process.exit(1);});}
