import "dotenv/config";
import path from "node:path";
import { writeFile } from "node:fs/promises";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { ROOT, ensureDirs, collectArticles, readArticleMeta, makeArticleLink, threeColTable, header, jstToday } from "./lib/index-utils.mjs";

export async function buildDaily(targetDate) {
  await ensureDirs();
  const files = await collectArticles();
  const metas = await Promise.all(files.map(readArticleMeta));
  const rows = metas
    .filter(m => (m.data?.date || "").trim() === targetDate)
    .map(m => {
      const title = (m.data?.title || path.basename(m.file, ".md")).replace(/[\|\n]/g, " ");
      const rel = path.relative(ROOT, m.file).replace(/\\/g, "/");
      const link = makeArticleLink(rel, "記事ページへ");
      const source_url = m.data?.source_url || "";
      return { title, link, source_url };
    })
    .sort((a, b) => a.title.localeCompare(b.title, "ja"));

  const content = [
    header(`${targetDate} のニュース`),
    rows.length ? threeColTable(rows) : "_この日は記事がありません_ \n"
  ].join("");

  const out = path.join(ROOT, "daily", `${targetDate}.md`);
  await writeFile(out, content, "utf8");
  console.log(`Wrote daily: daily/${targetDate}.md (${rows.length} rows)`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = yargs(hideBin(process.argv))
    .option("date", { type: "string", default: jstToday() })
    .help().argv;

  buildDaily(argv.date).catch(e => {
    console.error(e);
    process.exit(1);
  });
}
