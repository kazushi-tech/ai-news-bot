// scripts/validate_articles.mjs
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectRootArticles, readArticleMeta } from "./lib/index-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// ルートは ai-news-bot 直下を指す。必要なら NEWS_ROOT で上書き可
const ROOT = process.env.NEWS_ROOT
  ? path.resolve(process.env.NEWS_ROOT)
  : path.resolve(__dirname, "..");

const REQUIRED = ["title", "date", "model", "source_url", "host", "tldr", "key_points"];

async function main() {
  const files = await collectRootArticles(ROOT);
  let bad = 0;

  for (const fp of files) {
    try {
      const { data, missing } = await readArticleMeta(fp);
      const lacks = (missing?.length ? missing : []).concat(
        REQUIRED.filter(k => !(k in (data || {})))
      );
      if (lacks.length) {
        console.error(`✗ ${fp} missing: ${[...new Set(lacks)].join(", ")}`);
        bad++;
      }
    } catch (e) {
      console.error(`✗ ${fp}: ${e.message}`);
      bad++;
    }
  }

  if (bad) process.exit(1);
  console.log("OK");
}

main().catch(e => { console.error(e); process.exit(1); });
