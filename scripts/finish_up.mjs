// scripts/finish_up.mjs
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import matter from "gray-matter";
import { fetch } from "undici";
import { collectRootArticles, readArticleMeta } from "./lib/index-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.NEWS_ROOT ? path.resolve(process.env.NEWS_ROOT) : path.resolve(__dirname, "..");
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const OFFLINE = String(process.env.AI_NEWS_OFFLINE || "0") === "1";

function ymd(d=new Date()){ return d.toISOString().slice(0,10); }
function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

async function summarize(text, url){
  if (OFFLINE || !GOOGLE_API_KEY){
    const lines = text.split(/\n+/).filter(Boolean);
    const tldr = (lines[0]||"").slice(0,140);
    const key_points = lines.slice(1,6).map(s=>`- ${s.slice(0,120)}`);
    return { tldr, key_points };
  }
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${GOOGLE_API_KEY}`;
  const body = { contents: [{ role: "user", parts: [{ text:
`Summarize to pure JSON with keys:
- tldr (<=140 chars, one sentence)
- key_points (3-6 bullet lines, <=120 chars)
Source URL: ${url}

--- ARTICLE START ---
${text.slice(0,30000)}
--- ARTICLE END ---` }]}] };
  const res = await fetch(endpoint, { method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Gemini ${res.status} ${res.statusText}`);
  const data = await res.json();
  const out = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  try {
    const json = JSON.parse(out.match(/\{[\s\S]*\}/)?.[0] || out);
    return { tldr: (json.tldr||"").trim(), key_points: (json.key_points||[]).map(String) };
  } catch {
    const lines = out.split(/\n+/).map(s=>s.replace(/^[-•]\s*/,"").trim()).filter(Boolean);
    return { tldr: (lines[0]||"").slice(0,140), key_points: lines.slice(1,6).map(s=>`- ${s.slice(0,120)}`) };
  }
}

async function backfillRound(limit=40, pauseMs=900){
  const files = await collectRootArticles(ROOT);
  let done = 0;
  for (const fp of files){
    if (done >= limit) break;
    const { data } = await readArticleMeta(fp);
    if (data.tldr && Array.isArray(data.key_points) && data.key_points.length) continue;

    let content = (await readFile(fp,"utf-8"));
    const parsed = matter(content);
    let text = (parsed.content||"").trim();

    if (!text || text.length < 200){
      if (!data.source_url) continue;
      try{
        const html = await (await fetch(data.source_url)).text();
        const { Readability } = await import("@mozilla/readability");
        const { JSDOM } = await import("jsdom");
        const dom = new JSDOM(html, { url: data.source_url });
        const r = new Readability(dom.window.document).parse();
        text = r?.textContent || "";
      }catch{}
    }
    if (!text) continue;

    const { tldr, key_points } = await summarize(text, data.source_url||"");
    const next = matter.stringify(parsed.content, { ...data, tldr, key_points });
    await writeFile(fp, next, "utf-8");
    console.log(`[OK] updated: ${fp}`);
    done++;
    if (pauseMs) await sleep(pauseMs);
  }
  return done;
}

async function validateOnce(){
  const files = await collectRootArticles(ROOT);
  let bad = 0;
  for (const fp of files){
    const { data } = await readArticleMeta(fp);
    const lacks = ["title","date","model","source_url","host","tldr","key_points"].filter(k => !(k in (data||{})));
    if (lacks.length || !data.key_points?.length) bad++;
  }
  return bad === 0;
}

async function buildIndexes(){
  await mkdir(path.join(ROOT,"daily"), { recursive: true });
  await mkdir(path.join(ROOT,"weekly"), { recursive: true });
  const DATE = ymd(new Date());
  await new Promise((ok,ng)=>{
    const p = spawn(process.execPath, [path.join(ROOT,"scripts","build_index_daily.mjs"), "--date", DATE, "--link", "publish"], { stdio:"inherit" });
    p.on("exit", code => code===0?ok():ng(new Error("daily failed")));
  });
  await new Promise((ok,ng)=>{
    const p = spawn(process.execPath, [path.join(ROOT,"scripts","build_index_weekly.mjs"), "--to", DATE, "--link", "publish"], { stdio:"inherit" });
    p.on("exit", code => code===0?ok():ng(new Error("weekly failed")));
  });
}

async function main(){
  // 1) backfill を繰り返し（最大 10 ラウンド）
  for (let i=1;i<=10;i++){
    const n = await backfillRound(40, 900);
    console.log(`round ${i}: filled ${n}`);
    const ok = await validateOnce();
    if (ok){ console.log("✅ validate OK"); break; }
    if (n === 0 && i >= 2){ console.log("⚠️ no progress; stopping"); break; }
  }
  // 2) indexes 再生成
  await buildIndexes();
  console.log("✅ daily/weekly rebuilt");
}

main().catch(e=>{ console.error(e); process.exit(1); });
