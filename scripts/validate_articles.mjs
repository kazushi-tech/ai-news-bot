import "dotenv/config";
import { collectArticles, readArticleMeta } from "./lib/index-utils.mjs";

function isYMD(s){ return /^\d{4}-\d{2}-\d{2}$/.test(s || ""); }

async function main() {
  const files = await collectArticles();
  const metas = await Promise.all(files.map(readArticleMeta));
  const errs = [];
  for (const m of metas) {
    const d = m.data || {};
    if (!d.title) errs.push(`${m.file}: missing title`);
    if (!isYMD(d.date)) errs.push(`${m.file}: invalid date`);
    if ((d.model || "") !== "gemini-2.5-flash") errs.push(`${m.file}: model must be gemini-2.5-flash`);
    if (!d.source_url || !/^https?:\/\//.test(d.source_url)) errs.push(`${m.file}: invalid source_url`);
    if (!d.host) errs.push(`${m.file}: missing host`);
    // host vs URL
    try {
      const h = new URL(d.source_url).host;
      if (h !== d.host) errs.push(`${m.file}: host mismatch (${d.host} vs ${h})`);
    } catch {}
  }
  if (errs.length) {
    console.error("Validation errors:");
    errs.forEach(e => console.error(" - " + e));
    process.exit(1);
  }
  console.log(`Validated ${files.length} articles: OK`);
}

main().catch(e => { console.error(e); process.exit(1); });
