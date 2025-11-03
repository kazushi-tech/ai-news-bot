#!/usr/bin/env node
/**
 * summarize_article.mjs
 * - 対象: articles/**/YYYY-MM-DD--*.md
 * - 動作: frontmatterの source.url を開いて本文抽出(JSON-LD優先+Readability)→
 *         Gemini 2.5 Flashで日本語Markdown要約を生成→記事MD本文に書き込む
 * 使い方:
 *   node scripts/summarize_article.mjs --date=2025-11-02
 *   node scripts/summarize_article.mjs --file=articles/2025-11-02--example.md
 */
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), "..");
const ARTICLES = path.join(ROOT, "articles");

const args = Object.fromEntries(process.argv.slice(2).map(a=>{
  const [k,...v]=a.replace(/^--/,"").split("="); return [k, v.join("=")||true];
}));
const DATE = args.date || "";
const FILE = args.file || "";

async function walk(dir){
  const out=[];
  for (const ent of await fs.readdir(dir,{withFileTypes:true})) {
    const p=path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...await walk(p));
    else out.push(p);
  }
  return out;
}

function extractJsonLd(html){
  try{
    const dom = new JSDOM(html);
    const docs = [...dom.window.document.querySelectorAll('script[type="application/ld+json"]')];
    for (const s of docs){
      try {
        const data = JSON.parse(s.textContent || "null");
        const arr = Array.isArray(data) ? data : [data];
        for (const obj of arr){
          const t = obj?.articleBody || obj?.text || obj?.description;
          if (t && String(t).trim().length>120) return String(t);
        }
      } catch {}
    }
    return "";
  }catch{ return ""; }
}

async function extractReadable(html, url){
  try{
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const art = reader.parse();
    return (art?.textContent || "").trim();
  }catch{ return ""; }
}

async function fetchText(url){
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`fetch ${res.status}`);
  return await res.text();
}

async function summarizeJaMD(title, url, body){
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error("GOOGLE_API_KEY is required");
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
  const prompt = [
    "以下はニュース記事の本文です。日本語でMarkdown要約を作成してください。",
    "出力フォーマットは厳守：",
    "## TL;DR",
    "- 3〜5点で箇条書き",
    "## 重要ポイント",
    "- 5点前後で箇条書き",
    "## 概要",
    "3〜6行で本文要約",
    "",
    `タイトル: ${title}`,
    `ソース: ${url}`,
    "",
    "=== 本文 ===",
    body.slice(0, 18000) // 安全にトリム
  ].join("\n");

  const payload = { contents: [{ role: "user", parts: [{ text: prompt }]}]};
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`gemini ${res.status} ${res.statusText}`);
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text.trim()) throw new Error("empty summary");
  return text.trim();
}

function ensureMd(s){ return s.endsWith("\n") ? s : s+"\n"; }

async function processFile(file){
  const raw = await fs.readFile(file, "utf8");
  const fm  = matter(raw);
  const url = fm.data?.source?.url || fm.data?.url || "";
  const title = fm.data?.title || fm.data?.headline || path.basename(file).replace(/\.md$/,"");

  if (!url) { console.log(`[skip] no source.url: ${path.relative(ROOT,file)}`); return; }
  if (fm.content.trim().length > 20) { console.log(`[skip] already has content: ${path.relative(ROOT,file)}`); return; }

  // fetch & extract
  const html = await fetchText(url);
  const bodyJsonLd = extractJsonLd(html);
  const bodyReadable = await extractReadable(html, url);
  const body = (bodyJsonLd && bodyJsonLd.length>300 ? bodyJsonLd : bodyReadable).slice(0, 40000);

  if (body.length < 200) { console.log(`[warn] too short body: ${url}`); }

  const summary = await summarizeJaMD(title, url, body);

  // write back
  const newContent = [
    `# ${title}`,
    "",
    summary
  ].map(ensureMd).join("");

  const out = matter.stringify(newContent, {
    ...fm.data,
    title,
    source: { ...(fm.data?.source||{}), url },
    model: "gemini-2.5-flash",
    summarized_at: new Date().toISOString()
  });

  await fs.writeFile(file, out, "utf8");
  console.log(`[ok] summarized: ${path.relative(ROOT,file)}`);
}

(async()=>{
  const targets = [];
  if (FILE) {
    targets.push(path.resolve(FILE));
  } else {
    const all = (await walk(ARTICLES))
      .filter(f=>f.endsWith(".md"))
      .filter(f=> DATE ? path.basename(f).startsWith(`${DATE}--`) : true);
    targets.push(...all);
  }
  for (const f of targets) {
    try { await processFile(f); }
    catch(e){ console.error(`[fail] ${path.relative(ROOT,f)}: ${e.message}`); }
    await new Promise(r=>setTimeout(r, 500)); // 軽い間隔
  }
})();
