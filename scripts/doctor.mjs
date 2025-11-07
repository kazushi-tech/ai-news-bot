// scripts/doctor.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYAML, stringify as stringifyYAML } from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.NEWS_ROOT
  ? path.resolve(process.env.NEWS_ROOT)
  : path.resolve(__dirname, "..", "news");

function toFrontmatter(obj){ return `---\n${stringifyYAML(obj, { lineWidth: 0 })}---\n`; }
function isYMD(s){ return /^\d{4}-\d{2}-\d{2}$/.test(s||""); }

async function readArticle(fp){
  const raw = await fs.readFile(fp, "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { data:{}, body: raw, raw };
  const data = parseYAML(m[1] || "") || {};
  const body = raw.slice(m[0].length);
  return { data, body, raw };
}

function firstLinkFrom(body){
  // 「## 引用元」節内の最初のリンク > それが無ければ本文中の最初のリンク
  const sect = body.split(/^##\s*引用元.*$/m)[1] || body;
  const m = sect.match(/\((https?:\/\/[^\s)]+)\)/);
  return m ? m[1] : null;
}

function firstH1(body){
  const m = body.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : null;
}

async function fixOne(fp){
  let changed = false;
  const { data, body } = await readArticle(fp);
  const base = path.basename(fp); // YYYY-MM-DD--host--slug.md
  const [dateFromName, hostFromName] = base.split("--");
  const filenameDate = (dateFromName||"").trim();

  // date
  if (!isYMD(data.date)) { data.date = isYMD(filenameDate) ? filenameDate : data.date; changed = true; }

  // source_url
  if (!data.source_url || !/^https?:\/\//.test(data.source_url)) {
    const link = firstLinkFrom(body);
    if (link) { data.source_url = link; changed = true; }
  }

  // host
  const hostFromUrl = (()=>{ try{ return new URL(data.source_url).host; }catch{ return null; }})();
  if (!data.host && hostFromUrl) { data.host = hostFromUrl; changed = true; }
  if (data.host && hostFromUrl && data.host !== hostFromUrl) { data.host = hostFromUrl; changed = true; }
  if (!data.host && !hostFromUrl && hostFromName) { data.host = hostFromName; changed = true; }

  // model
  if ((data.model||"") !== "gemini-2.5-flash") { data.model = "gemini-2.5-flash"; changed = true; }

  // title
  if (!data.title || String(data.title).trim()==="") {
    const h1 = firstH1(body);
    data.title = h1 || base.replace(/\.md$/,"");
    changed = true;
  }

  if (!changed) return false;
  const out = toFrontmatter(data) + body;
  await fs.writeFile(fp, out, "utf8");
  return true;
}

async function main(){
  const dir = path.join(ROOT, "articles");
  const files = (await fs.readdir(dir)).filter(f=>f.endsWith(".md"));
  let fixed=0;
  for (const f of files) {
    const fp = path.join(dir, f);
    const ok = await fixOne(fp);
    if (ok) { fixed++; console.log("fixed:", `articles/${f}`); }
  }
  console.log(`done: ${fixed} file(s) fixed`);
}
main().catch(e => { console.error(e); process.exit(1); });
