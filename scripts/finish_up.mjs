// scripts/finish_up.mjs
// ingest 後にまとめて実行する仕上げ処理。
// 1) 各種 doctor スクリプト
// 2) Daily / Weekly / Home index 更新
// 3) 新規記事を Discord に自動ポスト

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEWS_ROOT =
  process.env.NEWS_ROOT ||
  path.resolve(__dirname, "..", "ai-news");

function runStep(label, scriptPath) {
  console.log(`[finish_up] ▶ node ${scriptPath}`);
  const result = spawnSync("node", [scriptPath], {
    stdio: "inherit",
    env: { 
      ...process.env, 
      NEWS_ROOT,
      AI_NEWS_DIR: NEWS_ROOT  // build_index_daily.mjs が AI_NEWS_DIR を要求
    },
  });

  if (result.status !== 0) {
    console.error(
      `[finish_up] ❌ step failed: ${label} (exit=${result.status})`
    );
    process.exit(result.status ?? 1);
  }
}

console.log("[finish_up] NEWS_ROOT =", NEWS_ROOT);

const steps = [
  ["cssclass", "scripts/doctor_cssclass_ai_news_article.mjs"],
  ["callouts", "scripts/doctor_callouts_sections.mjs"],
  ["layout", "scripts/doctor_layout_articles.mjs"],
  ["title-header", "scripts/doctor_title_header.mjs"],
  ["tldr-from-overview", "scripts/doctor_generate_tldr_from_overview.mjs"],
  ["build-daily", "scripts/build_index_daily.mjs"],
  ["build-weekly", "scripts/build_index_weekly.mjs"],
  ["build-home", "scripts/build_home.mjs"],
  // ★ここで Discord に新規記事をポスト
  ["discord-post", "scripts/discord_post_new_articles.mjs"],
];

for (const [label, script] of steps) {
  runStep(label, script);
}
