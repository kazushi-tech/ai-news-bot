// scripts/backfill_missing_summaries.mjs
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, writeFile } from "node:fs/promises";
import matter from "gray-matter";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { collectRootArticles } from "./lib/index-utils.mjs";
import { fetch } from "undici";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.NEWS_ROOT
  ? path.resolve(process.env.NEWS_ROOT)
  : path.resolve(__dirname, "..");

const argv = yargs(hideBin(process.argv))
  .option("max",   { type: "number",  default: 10 })
  .option("dry-run",{ type: "boolean", default: true })
  .option("sleep", { type: "number",  default: 800 }) // ms between API calls
  .help().argv;

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";
const GEMINI_MODEL   = process.env.GEMINI_MODEL   || "gemini-2.5-flash";
const OFFLINE        = String(process.env.AI_NEWS_OFFLINE || "0") === "1";

async function pause(ms){ return new Promise(r => setTimeout(r, ms)); }

async function summarize(text, url){
  if (OFFLINE || !GOOGLE_API_KEY){
    const lines = text.split(/\n+/).filter(Boolean);
    const tldr = (lines[0] || "").slice(0,140);
    const key_points = lines.slice(1,6).map(s=>`- ${s.slice(0,120)}`);
    return { tldr, key_points };
  }
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${GOOGLE_API_KEY}`;
  const body = {
    contents: [{ role: "user", parts: [{ text:
`Summarize the following article to pure JSON with keys:
- tldr (<=140 chars, one sentence)
- key_points (3-6 bullet lines, <=120 chars each)
Source URL: ${url}

--- ARTICLE START ---
${text.slice(0,30000)}
--- ARTICLE END ---`
    }]}]
  };
  const res = await fetch(endpoint, { method: "POST", headers: { "content-type":"application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Gemini ${res.status} ${res.statusText}`);
  const data = await res.json();
  const out = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  try {
    const json = JSON.parse(out.match(/\{[\s\S]*\}/)?.[0] || out);
    return { tldr: (json.tldr||"").trim(), key_points: (json.key_points||[]).map(s=>String(s)) };
  } catch {
    const lines = out.split(/\n+/).map(s=>s.replace(/^[-•]\s*/,"").trim()).filter(Boolean);
    return { tldr: (lines[0]||"").slice(0,140), key_points: lines.slice(1,6).map(s=>`- ${s.slice(0,120)}`) };
  }
}

async function main(){
  const files = await collectRootArticles(ROOT);
  let done = 0;

  for (const fp of files) {
    if (done >= argv.max) break;

    const raw = await readFile(fp, "utf-8");
    const parsed = matter(raw);
    const fm = parsed.data || {};

    // 既に揃っていればスキップ
    if (fm.tldr && fm.key_points && Array.isArray(fm.key_points) && fm.key_points.length) continue;

    // テキスト本文を使う。薄ければURLから再抽出
    let text = (parsed.content || "").trim();
    if (!text || text.length < 200) {
      if (!fm.source_url) continue;
      try {
        const html = await (await fetch(fm.source_url)).text();
        const { Readability } = await import("@mozilla/readability");
        const { JSDOM } = await import("jsdom");
        const dom = new JSDOM(html, { url: fm.source_url });
        const reader = new Readability(dom.window.document);
        text = reader.parse()?.textContent || "";
      } catch {}
    }
    if (!text) continue;

    const { tldr, key_points } = await summarize(text, fm.source_url || "");
    const next = matter.stringify(parsed.content, { ...fm, tldr, key_points });

    if (argv["dry-run"]) {
      console.log(`[DRY] would update: ${fp}`);
    } else {
      await writeFile(fp, next, "utf-8");
      console.log(`[OK] updated: ${fp}`);
    }

    done++;
    if (!argv["dry-run"] && argv.sleep > 0) await pause(argv.sleep);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
