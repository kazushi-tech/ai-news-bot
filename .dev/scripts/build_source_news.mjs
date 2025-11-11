import "dotenv/config";
import path from "node:path";
import { writeFile } from "node:fs/promises";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { ROOT, collectArticles, readArticleMeta, jstToday } from "./scripts/lib/index-utils.mjs";

const argv = yargs(hideBin(process.argv))
  .option("today", { type: "boolean", default: false })
  .option("from", { type: "string" })
  .option("to", { type: "string" })
  .help().argv;

function inRange(d, from, to){
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

async function main() {
  const files = await collectArticles();
  const metas = await Promise.all(files.map(readArticleMeta));
  let from = argv.from || null, to = argv.to || null;

  if (argv.today) {
    const t = jstToday();
    from = t; to = t;
  }

  const picked = metas.filter(m => {
    const d = m.data?.date; if (!d) return false;
    return inRange(d, from, to);
  }).sort((a,b)=> (a.data?.date||"").localeCompare(b.data?.date||"") || (a.data?.title||"").localeCompare(b.data?.title||"","ja"));

  const lines = [];
  lines.push(`# Sources ${from ? `(${from}${to && from!==to ? "〜"+to : ""})` : ""}\n`);
  for (const m of picked) {
    const t = m.data?.title || "(no title)";
    const u = m.data?.source_url || "";
    lines.push(`- ${m.data?.date} — [${t}](${u})`);
  }
  lines.push("");

  const name = argv.today ? `${jstToday()}.md` : `${(from||"all")}_${(to||"")}.md`.replace(/_$/,"");
  const out = path.join(ROOT, "source", name);
  await writeFile(out, lines.join("\n"), "utf8");
  console.log(`Wrote source: source/${name} (${picked.length} items)`);
}

main().catch(e => { console.error(e); process.exit(1); });
