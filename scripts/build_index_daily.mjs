// scripts/build_index_daily.mjs
import path from "node:path";
import { writeFile, mkdir } from "node:fs/promises";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { resolveRoot, newsDir, ymd } from "./lib/index-utils.mjs";

const argv = yargs(hideBin(process.argv))
  .option("date", { type: "string", demandOption: false }) // 省略可
  .option("link", { type: "string", default: "obsidian" })
  .help().argv;

async function main() {
  const ROOT = resolveRoot();
  const dateStr = ymd(argv.date ?? new Date());
  const outDir = path.join(newsDir(ROOT), "daily");
  const outPath = path.join(outDir, `${dateStr}.md`);

  const md = `---
title: ${dateStr}--AI-news
---

\`\`\`dataview
TABLE WITHOUT ID
  coalesce(title_ja, title) AS "タイトル",
  link(file.link, "記事ページへ") AS "記事ページへ",
  link(source_url, "引用元 ↗") AS "引用元"
FROM "news/articles"
WHERE date = date("${dateStr}")
SORT file.name ASC
\`\`\`
`;

  await mkdir(outDir, { recursive: true });
  await writeFile(outPath, md, "utf8");
  console.log(`[daily] wrote ${path.relative(ROOT, outPath)}`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
