import "dotenv/config";
import { collectArticles, readArticleMeta } from "./scripts/lib/index-utils.mjs";
import { buildDaily } from "./build_index_daily.mjs";

async function main() {
  const files = await collectArticles();
  const metas = await Promise.all(files.map(readArticleMeta));
  const dates = Array.from(new Set(metas.map(m => m.data?.date).filter(Boolean))).sort();
  for (const d of dates) {
    await buildDaily(d);
  }
  console.log(`Rebuilt daily for ${dates.length} days`);
}

main().catch(e => { console.error(e); process.exit(1); });
