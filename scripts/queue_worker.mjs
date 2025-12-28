// scripts/queue_worker.mjs
//
// 役割：ai-news/queue/urls.txt を見て、未処理 URL をまとめて ingest する worker。
//
// - queue/urls.txt         … Discord などから貯められた URL 一覧
// - queue/processed.txt    … 正常に処理完了した URL のログ
// - queue/failed.txt       … エラーで落ちた URL のログ
// - queue/usage-YYYY-MM-DD.txt … その日処理した件数（1日上限のため）
//
// 動き：
//   1. urls.txt を読み込む（空行と # で始まる行は無視）
//   2. processed/failed に載ってない URL だけ順番に処理
//   3. 各 URL について：
//       - MAX_ARTICLES_PER_DAY の上限チェック
//       - node scripts/summarize_article.mjs <URL> を実行（NEWS_ROOT を渡す）
//       - 成功なら processed.txt に追加＆ usage を +1
//       - 失敗なら failed.txt に追加
//   4. 1 件以上 ingest できたら：
//       - node scripts/finish_up.mjs を実行（doctor + index 生成）
//       - AUTO_PUSH=1 のときだけ git add / commit / push まで自動実行
//
// 実行例：
//   npm run queue:worker
//   （package.json 側で NEWS_ROOT=../ai-news と --env-file=.env を付ける）

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====== 環境変数 & パス ======

// 統一パス定義を使用（ai-news-bot/ = Vault root）
import { REPO_ROOT, NEWS_ROOT, QUEUE_DIR as QUEUE_PATH } from "./lib/paths.mjs";

const QUEUE_DIR = QUEUE_PATH;
const URLS_FILE = path.join(QUEUE_DIR, "urls.txt");
const PROCESSED_FILE = path.join(QUEUE_DIR, "processed.txt");
const FAILED_FILE = path.join(QUEUE_DIR, "failed.txt");
const METADATA_FILE = path.join(QUEUE_DIR, "metadata.json");

// 1日の処理上限（0 or 未設定なら無制限）
const MAX_ARTICLES_PER_DAY = Number(
  process.env.MAX_ARTICLES_PER_DAY || "0"
);

const SCRIPTS_DIR = __dirname;
const SUMMARIZE_SCRIPT = path.join(SCRIPTS_DIR, "summarize_article.mjs");
const FINISH_SCRIPT = path.join(SCRIPTS_DIR, "finish_up.mjs");

// AUTO_PUSH=1 のときだけ git まで自動で回す
const AUTO_PUSH = process.env.AUTO_PUSH || "0";

// ====== 小物 util ======

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

async function loadMetadata() {
  try {
    const data = await fs.readFile(METADATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") return {};
    console.warn(`[queue] Failed to load metadata: ${err.message}`);
    return {};
  }
}

async function appendLine(filePath, line) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.appendFile(filePath, line + "\n", "utf8");
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

function runGit(args) {
  return new Promise((resolve) => {
    const child = spawn("git", args, {
      stdio: "inherit",
      cwd: REPO_ROOT,
    });
    child.on("close", (code) => {
      resolve(code === 0);
    });
  });
}

function gitStatusPorcelain() {
  return new Promise((resolve) => {
    const child = spawn("git", ["status", "--porcelain"], {
      cwd: REPO_ROOT,
    });
    let out = "";
    child.stdout.on("data", (d) => {
      out += d.toString();
    });
    child.stderr.on("data", (d) => {
      process.stderr.write(d);
    });
    child.on("close", () => {
      resolve(out.trim());
    });
  });
}

// ====== 日次使用数の管理 ======

function todayKey() {
  const d = new Date(); // ローカルタイム（JST）でOK
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function usageFilePath(dateStr) {
  return path.join(QUEUE_DIR, `usage-${dateStr}.txt`);
}

async function readUsageCount(filePath) {
  try {
    const txt = await fs.readFile(filePath, "utf8");
    const n = parseInt(txt.trim(), 10);
    if (Number.isFinite(n) && n >= 0) return n;
    return 0;
  } catch (err) {
    if (err.code === "ENOENT") return 0;
    throw err;
  }
}

async function writeUsageCount(filePath, count) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, String(count) + "\n", "utf8");
}

// ====== メイン処理 ======

async function ingestQueueOnce() {
  const urls = await readLinesIfExists(URLS_FILE);
  if (urls.length === 0) {
    console.log("[queue] urls.txt が空なので処理するものはありません。");
    return { ingested: 0, usedToday: 0, remaining: null };
  }

  const processed = new Set(await readLinesIfExists(PROCESSED_FILE));
  const failed = new Set(await readLinesIfExists(FAILED_FILE));
  const metadata = await loadMetadata();

  const today = todayKey();
  const usagePath = usageFilePath(today);
  let usedToday = await readUsageCount(usagePath);

  const max = MAX_ARTICLES_PER_DAY;
  if (max > 0) {
    console.log(
      `[queue] 今日すでに ${usedToday} 件処理済み / 上限 ${max} 件`
    );
  } else {
    console.log("[queue] MAX_ARTICLES_PER_DAY は無制限モードです。");
  }

  let ingestedCount = 0;

  for (const url of urls) {
    if (processed.has(url)) {
      console.log(`[queue] skip (already processed): ${url}`);
      continue;
    }
    if (failed.has(url)) {
      console.log(`[queue] skip (marked failed): ${url}`);
      continue;
    }

    if (max > 0 && usedToday >= max) {
      console.log(
        `[queue] MAX_ARTICLES_PER_DAY=${max} に達したので、今日の処理はここで終了します。`
      );
      break;
    }

    console.log(`[queue] ingest: ${url}`);
    
    // メタデータからタイトル・説明を引数として渡す
    const meta = metadata[url] || {};
    const args = [url];
    if (meta.title) {
      args.push(`--title=${meta.title}`);
    }
    if (meta.description) {
      args.push(`--description=${meta.description}`);
    }
    
    const ok = await runNodeScript(SUMMARIZE_SCRIPT, args, { NEWS_ROOT });

    if (ok) {
      console.log(`[queue] ✅ success: ${url}`);
      processed.add(url);
      await appendLine(PROCESSED_FILE, url);
      ingestedCount++;
      usedToday++;
    } else {
      console.error(`[queue] ❌ failed: ${url}`);
      failed.add(url);
      await appendLine(FAILED_FILE, url);
    }
  }

  await writeUsageCount(usagePath, usedToday);

  const remaining =
    max > 0 ? Math.max(0, max - usedToday) : null;

  return { ingested: ingestedCount, usedToday, remaining };
}

async function autoPushIfNeeded() {
  if (AUTO_PUSH !== "1") {
    console.log("[queue] AUTO_PUSH != 1 のため git push はスキップします。");
    return;
  }

  const status = await gitStatusPorcelain();
  if (!status) {
    console.log("[queue] git status が clean なので push するものはありません。");
    return;
  }

  console.log("[queue] git add / commit / push を実行します。");
  const date = new Date().toISOString().slice(0, 10);
  const msg = `news: add ${date}`;

  await runGit(["add", "-A"]);
  await runGit(["commit", "-m", msg]);
  await runGit(["push"]);
}

async function main() {
  console.log(`[queue] NEWS_ROOT   = ${NEWS_ROOT}`);
  console.log(`[queue] URLS_FILE   = ${URLS_FILE}`);
  if (MAX_ARTICLES_PER_DAY > 0) {
    console.log(
      `[queue] 1日の処理上限: ${MAX_ARTICLES_PER_DAY} 件 (MAX_ARTICLES_PER_DAY)`
    );
  } else {
    console.log("[queue] 1日の処理上限: 無制限（MAX_ARTICLES_PER_DAY 未設定）");
  }

  const { ingested, usedToday, remaining } = await ingestQueueOnce();

  console.log(
    `[queue] 今日の累計処理数: ${usedToday}` +
      (MAX_ARTICLES_PER_DAY > 0
        ? ` / 上限 ${MAX_ARTICLES_PER_DAY}（残り ${remaining} 件）`
        : "")
  );

  if (ingested > 0) {
    console.log(
      `[queue] ${ingested} 件 ingest されたので finish_up を実行します。`
    );
    const ok = await runNodeScript(FINISH_SCRIPT, [], { NEWS_ROOT });
    if (!ok) {
      console.error("[queue] finish_up.mjs がエラーで終了しました。");
    }
    await autoPushIfNeeded();
  } else {
    console.log("[queue] 新規 ingest なしのため finish / push はスキップします。");
  }
}

main().catch((err) => {
  console.error("[queue] FATAL:", err);
  process.exit(1);
});
