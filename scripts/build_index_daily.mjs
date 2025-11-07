// scripts/build_index_daily.mjs
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeFile, mkdir } from "node:fs/promises";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {
  collectRootArticles,
  readArticleMeta,
  makeArticleLink,
} from "./lib/index-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.NEWS_ROOT
  ? path.resolve(process.env.NEWS_ROOT)
  : path.resolve(__dirname, ".."); // ai-news-bot 直下

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

const argv = yargs(hideBin(process.argv))
  .option("date", { type: "string", describe: "YYYY-MM-DD (default: today)" })
  .option("link", {
    type: "string",
    default: process.env.LINK_MODE || "publish",
    choices: ["publish", "obsidian"],
  })
  .help().argv;

async function main() {
  const date = argv.date || todayStr();
  const linkMode = argv.link;

  const list = await collectRootArticles(ROOT);
  const rows = [];
  for (const fp of list) {
    const { data } = await readArticleMeta(fp);
    if ((data?.date || "").slice(0, 10) === date) {
      rows.push({
        title: data.title || "(untitled)",
        link: makeArticleLink(fp, linkMode),
        host: data.host || data.domain || data.source || "",
        tldr: String(data.tldr || "").replace(/\n/g, " ").trim(),
      });
    }
  }

  // タイトル昇順
  rows.sort((a, b) => a.title.localeCompare(b.title));

  // 出力先（ファイル名を YYYY-MM-DD--AI-news.md に）
  const outDir = path.join(ROOT, "daily");
  await mkdir(outDir, { recursive: true });
  const out = path.join(outDir, `${date}--AI-news.md`);

  const header = [
    "| タイトル | 記事ページへ | 引用元 | 要約 |",
    "|---|---|---|---|",
  ];
  const body = rows.length
    ? rows.map(
        (r) =>
          `| ${r.title} | [記事ページへ](${r.link}) | ${r.host} | ${r.tldr} |`
      )
    : ["| (なし) | - | - | - |"];

  const md = [
    "---",
    `date: ${date}`,
    "type: daily-index",
    "---",
    "",
    `# Daily Index — ${date}`,
    "",
    ...header,
    ...body,
    "",
  ].join("\n");

  await writeFile(out, md, "utf-8");
  console.log(out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
