import "dotenv/config";
import path from "node:path";
import { writeFile } from "node:fs/promises";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { ROOT, ensureDirs, collectArticles, readArticleMeta, makeArticleLink, threeColTable, header, jstToday, mondayOfISOWeek } from "./lib/index-utils.mjs";

export async function buildWeekly(baseDate) {
  await ensureDirs();
  const monday = mondayOfISOWeek(baseDate);
  const files = await collectArticles();
  const metas = await Promise.all(files.map(readArticleMeta));
  // その週(月〜日)に属するもの
  const inWeek = metas.filter(m => {
    const d = m.data?.date;
    if (!d) return false;
    // 月曜から+6日まで
    return d >= monday && d <= plusDays(monday, 6);
  });

  const rows = inWeek
    .map(m => {
      const title = (m.data?.title || path.basename(m.file, ".md")).replace(/[\|\n]/g, " ");
      const rel = path.relative(ROOT, m.file).replace(/\\/g, "/");
      const link = makeArticleLink(rel, "記事ページへ");
      const source_url = m.data?.source_url || "";
      return { title, link, source_url };
    })
    .sort((a, b) => a.title.localeCompare(b.title, "ja"));

  const content = [
    header(`${monday} 週のニュース`),
    rows.length ? threeColTable(rows) : "_この週は記事がありません_ \n"
  ].join("");

  const out = path.join(ROOT, "weekly", `${monday}.md`);
  await writeFile(out, content, "utf8");
  console.log(`Wrote weekly: weekly/${monday}.md (${rows.length} rows)`);
}

function plusDays(ymd, n) {
  const [Y, M, D] = ymd.split("-").map(Number);
  const d = new Date(Date.UTC(Y, M - 1, D + n));
  const yy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = yargs(hideBin(process.argv))
    .option("date", { type: "string", default: jstToday() })
    .help().argv;

  buildWeekly(argv.date).catch(e => {
    console.error(e);
    process.exit(1);
  });
}
