// scripts/build_index_weekly.mjs
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeFile, mkdir } from "node:fs/promises";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { collectRootArticles, readArticleMeta, inDateRange, makeArticleLink } from "./lib/index-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.NEWS_ROOT
  ? path.resolve(process.env.NEWS_ROOT)
  : path.resolve(__dirname, ".."); // ← ai-news-bot 直下

function ymd(dt = new Date()) { return dt.toISOString().slice(0,10); }
function ts(d) { return d ? new Date(d + "T00:00:00Z").getTime() : null; }

const argv = yargs(hideBin(process.argv))
  .option("from", { type: "string" })
  .option("to",   { type: "string" })
  .option("link", { type: "string", default: "publish" })
  .help().argv;

async function main() {
  let to = argv.to || ymd(new Date());
  let from = argv.from;
  if (!from) {
    const t = new Date(to + "T00:00:00Z");
    from = ymd(new Date(t.getTime() - 6*24*60*60*1000));
  }
  const fromTs = ts(from), toTs = ts(to);
  const linkMode = argv.link;

  const files = await collectRootArticles(ROOT);
  const rows = [];
  for (const fp of files) {
    const { data } = await readArticleMeta(fp);
    if (data?.date && inDateRange(data.date, fromTs, toTs)) {
      rows.push({
        date: data.date,
        title: data.title || "(untitled)",
        link: makeArticleLink(fp, linkMode),
        host: data.host || "",
        tldr: (data.tldr || "").replace(/\n/g, " ")
      });
    }
  }

  const outDir = path.join(ROOT, "weekly");
  await mkdir(outDir, { recursive: true });
  const out = path.join(outDir, `${to}.md`);

  const table = [
    "| 日付 | タイトル | 記事ページへ | 引用元 | 要約 |",
    "|---|---|---|---|---|",
    ...rows
      .sort((a,b)=>b.date.localeCompare(a.date))
      .map(r => `| ${r.date} | ${r.title} | [記事ページへ](${r.link}) | ${r.host} | ${r.tldr} |`)
  ].join("\n");

  const md = [`---\nfrom: ${from}\nto: ${to}\n---`, "", "# Weekly Index", "", table].join("\n");
  await writeFile(out, md, "utf-8");
  console.log(out);
}

main().catch(e => { console.error(e); process.exit(1); });
