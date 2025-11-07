// scripts/backfill_missing_summaries.mjs
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import {
  NEWS_ROOT,
  ARTICLES_DIR,
  collectRootArticles,
} from "./lib/index-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

function getArg(name, def) {
  const found = process.argv.find(a => a.startsWith(name + "="));
  return found ? found.split("=").slice(1).join("=") : def;
}
function getFlag(name, def=false) {
  return process.argv.includes(name) ? true : def;
}
const MAX   = parseInt(getArg("--max", "30"), 10);
const SLEEP = parseInt(getArg("--sleep", "800"), 10);
const DRY   = getFlag("--dry-run", false);

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function needsBackfill(item) {
  const noTLDR = !item.tldr || !String(item.tldr).trim();
  const noKP   = !Array.isArray(item.key_points) || item.key_points.length === 0;
  return noTLDR || noKP;
}

function runSummarize(url) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "node",
      ["scripts/summarize_article.mjs", "--url", url, "--lang", "ja", "--force"],
      {
        cwd: REPO_ROOT,
        stdio: "inherit",
        env: { ...process.env, EXTRACTOR: "readability" },
      }
    );
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error("summarize failed: " + code))
    );
  });
}

(async () => {
  console.log("[backfill] NEWS_ROOT:", NEWS_ROOT);
  console.log("[backfill] ARTICLES_DIR:", ARTICLES_DIR);

  const items = await collectRootArticles();
  let done = 0;

  for (const it of items) {
    if (!needsBackfill(it)) continue;

    if (!it.source_url) {
      console.log(`[skip] no source_url: ${it.relPath}`);
      continue;
    }

    if (DRY) {
      console.log(`[DRY] would backfill: ${it.relPath}`);
    } else {
      console.log(`[run] backfill: ${it.relPath} -> ${it.source_url}`);
      await runSummarize(it.source_url);
      await sleep(SLEEP);
    }

    done++;
    if (done >= MAX) break;
  }

  console.log(`[backfill] done, processed=${done}`);
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
