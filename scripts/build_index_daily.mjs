// scripts/build_index_daily.mjs
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeFile, mkdir } from "node:fs/promises";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { collectRootArticles, readArticleMeta, makeArticleLink } from "./lib/index-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.NEWS_ROOT
  ? path.resolve(process.env.NEWS_ROOT)
  : path.resolve(__dirname, ".."); // ← ai-news-bot 直下

const argv = yargs(hideBin(process.argv))
  .option("date", { type: "string", demandOption: true })
  .option("link", { type: "string", default: "publish" })
  .help().argv;

async function main() {
  const date = argv.date;
  const linkMode = argv.link;

  const list = await collectRootArticles(ROOT);
  const rows = [];
  for (const fp of list) {
    const { data } = await readArticleMeta(fp);
    if (data?.date === date) {
      rows.push({
        title: data.title || "(untitled)",
        link: makeArticleLink(fp, linkMode),
        host: data.host || "",
        tldr: (data.tldr || "").replace(/\n/g, " ")
      });
    }
  }

  const outDir = path.join(ROOT, "daily");
  await mkdir(outDir, { recursive: true });
  const out = path.join(outDir, `${date}.md`);

  const table = [
    "| タイトル | 記事ページへ | 引用元 | 要約 |",
    "|---|---|---|---|",
    ...rows
      .sort((a,b)=>a.title.localeCompare(b.title))
      .map(r => `| ${r.title} | [記事ページへ](${r.link}) | ${r.host} | ${r.tldr} |`)
  ].join("\n");

  const md = [`---\ndate: ${date}\n---`, "", "# Daily Index", "", table].join("\n");
  await writeFile(out, md, "utf-8");
  console.log(out);
}

main().catch(e => { console.error(e); process.exit(1); });
