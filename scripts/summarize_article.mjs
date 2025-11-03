#!/usr/bin/env node
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
  const out=[]; for (const ent of await fs.readdir(dir,{withFileTypes:true})) {
    const p=path.join(dir, ent.name); if (ent.isDirectory()) out.push(...await walk(p)); else out.push(p);
  } return out;
}

function extractJsonLd(html){
  try{
    const dom = new JSDOM(html);
    const arr = [...dom.window.document.querySelectorAll('script[type="application/ld+json"]')];
    for (const s of arr){
      try {
        const data = JSON.parse(s.textContent || "null");
        const list = Array.isArray(data) ? data : [data];
        for (const obj of list){
          const t = obj?.articleBody || obj?.text || obj?.description;
          if (t && String(t).trim().length>120) return String(t);
        }
      } catch {}
    }
  }catch {}
  return "";
}

async function extractReadable(html, url){
  try{
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const art = reader.parse();
    return (art?.textContent || "").trim();
  }catch{ return ""; }
}

async function fetchTextDirect(url){
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`fetch ${res.status}`);
  return await res.text();
}

/* ★ Paywall等のフォールバック：Jina Reader */
async function fetchTextSmart(url){
  try { return await fetchTextDirect(url); }
  catch {}
  const proxy = "https://r.jina.ai/http/" + url.replace(/^https?:\/\//, "");
  const r = await fetch(proxy, { redirect: "follow" });
  if (!r.ok) throw new Error(`jina ${r.status}`);
  return await r.text();
}

async function summarizeJaMD(title, url, body){
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error("GOOGLE_API_KEY is required");
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
  const prompt = [
    "あなたは熟練のニュース要約者です。以下の本文を日本語Markdownで要約してください。",
    "必ず次の構成で出力：",
    "## TL;DR", "- 箇条書きで3〜5点",
    "## 重要ポイント", "- 箇条書きで5点前後",
    "## 概要", "3〜6行で本文要約",
    "",
    `タイトル: ${title}`,
    `ソース: ${url}`,
    "",
    "=== 本文 ===",
    body.slice(0, 18000)
  ].join("\n");

  const payload = { contents: [{ role: "user", parts: [{ text: prompt }]}]};
  const res = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
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

  const html = await fetchTextSmart(url);
  const bodyJsonLd = extractJsonLd(html);
  const bodyReadable = await extractReadable(html, url);
  const body = (bodyJsonLd && bodyJsonLd.length>300 ? bodyJsonLd : bodyReadable).slice(0, 40000);
  if (body.length < 200) console.log(`[warn] short body (fallback used): ${url}`);

  const summary = await summarizeJaMD(title, url, body);

  const newContent = [
    `# ${title}`, "", summary
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
  if (FILE) targets.push(path.resolve(FILE));
  else targets.push(...(await walk(ARTICLES)).filter(f=>f.endsWith(".md")).filter(f=> DATE ? path.basename(f).startsWith(`${DATE}--`) : true));
  for (const f of targets) {
    try { await processFile(f); } catch(e){ console.error(`[fail] ${path.relative(ROOT,f)}: ${e.message}`); }
    await new Promise(r=>setTimeout(r, 500));
  }
})();
