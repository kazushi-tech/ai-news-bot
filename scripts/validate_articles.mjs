// scripts/validate_articles.mjs
import { collectRootArticles } from "./lib/index-utils.mjs";

const REQ = ["title", "date", "model", "source_url", "host", "tldr", "key_points"];

const items = await collectRootArticles();
let bad = 0;

for (const it of items) {
  const miss = REQ.filter((k) => {
    const v = it[k];
    if (Array.isArray(v)) return v.length === 0;
    return !v || String(v).trim() === "";
  });
  if (miss.length) {
    console.log(`NG ${it.relPath}: missing -> ${miss.join(", ")}`);
    bad++;
  }
}

if (bad === 0) {
  console.log("validate: OK");
} else {
  console.log(`validate: NG (${bad} files)`);
  process.exitCode = 1;
}
