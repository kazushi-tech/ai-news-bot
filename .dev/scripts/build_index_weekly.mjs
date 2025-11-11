// scripts/build_index_weekly.mjs
import path from "node:path";
import { writeFile, mkdir } from "node:fs/promises";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { resolveRoot, newsDir, ymd, startOfISOWeek, endOfISOWeek } from "./scripts/lib/index-utils.mjs";

const argv = yargs(hideBin(process.argv))
  .option("date", { type: "string", demandOption: false }) // 任意の基準日
  .option("link", { type: "string", default: "obsidian" })
  .help().argv;

function isoWeekLabel(d) {
  // yyyy-Www
  const dt = new Date(d);
  const t = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()));
  // ISO week number
  const target = new Date(t.valueOf());
  const dayNr = (t.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const weekNo = 1 + Math.round(
    ((target - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7
  );
  const yy = target.getUTCFullYear();
  return `${yy}-W${String(weekNo).padStart(2, "0")}`;
}

async function main() {
  const ROOT = resolveRoot();
  const base = argv.date ? new Date(argv.date) : new Date();
  const s = startOfISOWeek(base);
  const e = endOfISOWeek(base);
  const startStr = ymd(s);
  const endStr = ymd(e);
  const label = isoWeekLabel(base);

  const outDir = path.join(newsDir(ROOT), "weekly");
  const outPath = path.join(outDir, `${label}.md`);

  const md = `---
title: ${label}--AI-news
---

> 期間: ${startStr} 〜 ${endStr}

\`\`\`dataview
TABLE WITHOUT ID
  coalesce(title_ja, title) AS "タイトル",
  link(file.link, "記事ページへ") AS "記事ページへ",
  link(source_url, "引用元 ↗") AS "引用元"
FROM "news/articles"
WHERE date >= date("${startStr}") AND date <= date("${endStr}")
SORT date DESC
\`\`\`
`;

  await mkdir(outDir, { recursive: true });
  await writeFile(outPath, md, "utf8");
  console.log(`[weekly] wrote ${path.relative(ROOT, outPath)}`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
