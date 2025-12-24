#!/usr/bin/env node
// scripts/queue_smoke_test.mjs
//
// 役割：queue/urls_smoke.txt から少量（デフォルト3件）の URL を処理し、
//      成功/失敗と失敗理由を詳細にレポートする。
//      本番の queue_worker 起動前の動作確認用。
//
// 実行例：
//   NEWS_ROOT=../ai-news node --env-file=.env scripts/queue_smoke_test.mjs
//   NEWS_ROOT=../ai-news node --env-file=.env scripts/queue_smoke_test.mjs --queue-file=queue/urls_smoke.txt
//
// 出力：
//   - コンソールログ（成功/失敗の詳細）
//   - queue/smoke_test_report_YYYYMMDD_HHMMSS.md（Markdownレポート）

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====== 環境変数 & パス ======

const NEWS_ROOT =
  process.env.NEWS_ROOT || path.resolve(__dirname, "..", "ai-news");

const REPO_ROOT = path.resolve(__dirname, "..");
const QUEUE_DIR = path.join(NEWS_ROOT, "queue");

// コマンドライン引数で queue ファイルを指定可能
const args = process.argv.slice(2);
const queueFileArg = args.find((a) => a.startsWith("--queue-file="));
const queueFileName = queueFileArg
  ? queueFileArg.split("=")[1]
  : "urls_smoke.txt";

const URLS_FILE = path.join(QUEUE_DIR, queueFileName);
const SCRIPTS_DIR = __dirname;
const SUMMARIZE_SCRIPT = path.join(SCRIPTS_DIR, "summarize_article.mjs");

console.log(`[smoke] NEWS_ROOT   = ${NEWS_ROOT}`);
console.log(`[smoke] QUEUE_FILE  = ${URLS_FILE}`);

// ====== util ======

async function readLinesIfExists(filePath) {
  try {
    const txt = await fs.readFile(filePath, "utf8");
    return txt
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("#"));
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

function runNodeScript(scriptPath, args = [], extraEnv = {}) {
  const env = { ...process.env, ...extraEnv };

  return new Promise((resolve) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      stdio: "inherit",
      env,
      cwd: REPO_ROOT,
    });
    child.on("close", (code) => {
      resolve(code === 0);
    });
  });
}

function timestamp() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const sec = String(d.getSeconds()).padStart(2, "0");
  return `${y}${m}${day}_${h}${min}${sec}`;
}

// ====== メイン処理 ======

async function smokeTest() {
  const urls = await readLinesIfExists(URLS_FILE);
  if (urls.length === 0) {
    console.log(`[smoke] ${queueFileName} が空なので処理するものはありません。`);
    return [];
  }

  console.log(`[smoke] ${urls.length} 件の URL を処理します。\n`);

  const results = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const idx = i + 1;

    console.log(`\n[smoke] ===== ${idx}/${urls.length}: ${url} =====`);

    const startTime = Date.now();
    const ok = await runNodeScript(SUMMARIZE_SCRIPT, [url], { NEWS_ROOT });
    const elapsed = Date.now() - startTime;

    const result = {
      index: idx,
      url,
      success: ok,
      elapsed: `${(elapsed / 1000).toFixed(1)}s`,
      reason: ok ? "成功" : "失敗（詳細はログ参照）",
    };

    if (ok) {
      console.log(`[smoke] ✅ 成功: ${url} (${result.elapsed})`);
    } else {
      console.error(`[smoke] ❌ 失敗: ${url} (${result.elapsed})`);
      // 失敗理由の推測（簡易版）
      result.reason = "失敗（原因: HTTP エラー, Readability 失敗, Gemini API エラーなど）";
    }

    results.push(result);
  }

  return results;
}

function generateReport(results) {
  const lines = [];
  lines.push(`# Queue Smoke Test Report`);
  lines.push(``);
  lines.push(`**実行日時**: ${new Date().toISOString()}`);
  lines.push(`**処理件数**: ${results.length} 件`);
  lines.push(``);

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.length - successCount;

  lines.push(`## サマリ`);
  lines.push(``);
  lines.push(`- ✅ 成功: **${successCount} 件**`);
  lines.push(`- ❌ 失敗: **${failureCount} 件**`);
  lines.push(``);

  if (failureCount === 0) {
    lines.push(`🎉 **すべての URL が成功しました！**`);
    lines.push(``);
  }

  lines.push(`## 詳細`);
  lines.push(``);
  lines.push(`| # | URL | 結果 | 時間 | 備考 |`);
  lines.push(`|---|-----|------|------|------|`);

  for (const r of results) {
    const status = r.success ? "✅ 成功" : "❌ 失敗";
    const urlShort =
      r.url.length > 60 ? r.url.slice(0, 57) + "..." : r.url;
    lines.push(`| ${r.index} | ${urlShort} | ${status} | ${r.elapsed} | ${r.reason} |`);
  }

  lines.push(``);

  if (failureCount > 0) {
    lines.push(`## 失敗 URL の詳細`);
    lines.push(``);
    const failed = results.filter((r) => !r.success);
    for (const r of failed) {
      lines.push(`### ${r.index}. ${r.url}`);
      lines.push(``);
      lines.push(`- **原因**: ${r.reason}`);
      lines.push(`- **推奨対応**: ログを確認し、HTTP エラー/paywall/API エラーなどを特定`);
      lines.push(``);
    }
  }

  lines.push(`---`);
  lines.push(``);
  lines.push(`**次のステップ**:`);
  lines.push(``);
  if (failureCount === 0) {
    lines.push(`1. ✅ スモークテストが成功したので、queue worker を本番起動可能`);
    lines.push(`2. \`NEWS_ROOT=../ai-news node --env-file=.env scripts/queue_worker.mjs\``);
  } else {
    lines.push(`1. 失敗した URL のログを確認し、原因を分類`);
    lines.push(`2. 修正可能なもの（URL正規化、Gemini APIエラーなど）は修正`);
    lines.push(`3. 修正後、再度 smoke test を実行`);
    lines.push(`4. すべて成功したら queue worker を起動`);
  }
  lines.push(``);

  return lines.join("\n");
}

async function main() {
  console.log(`[smoke] ===== Queue Smoke Test 開始 =====\n`);

  const results = await smokeTest();

  if (results.length === 0) {
    console.log(`\n[smoke] 処理対象の URL がありませんでした。`);
    return;
  }

  const report = generateReport(results);

  const reportFileName = `smoke_test_report_${timestamp()}.md`;
  const reportPath = path.join(QUEUE_DIR, reportFileName);
  await fs.writeFile(reportPath, report, "utf8");

  console.log(`\n[smoke] ===== 結果 =====`);
  console.log(report);
  console.log(`\n[smoke] レポートを保存しました: ${reportPath}`);

  const successCount = results.filter((r) => r.success).length;
  if (successCount === results.length) {
    console.log(`\n[smoke] 🎉 すべての URL が成功しました！`);
    process.exit(0);
  } else {
    console.log(`\n[smoke] ⚠️ 一部の URL が失敗しました。レポートを確認してください。`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[smoke] FATAL:", err);
  process.exit(1);
});
