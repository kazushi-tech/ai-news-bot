// scripts/queue_worker.mjs
// ai-news/queue/urls.txt を定期的にチェックして、
// 1件ずつ summarize_article.mjs を実行するワーカー。
// 成功したURLは urls.processed.txt に移し、
// NEWS_AUTO_COMMIT=1 のとき ai-news リポジトリを自動で add/commit/push する。

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEWS_ROOT = process.env.NEWS_ROOT || "../ai-news";
const AUTO_COMMIT = process.env.NEWS_AUTO_COMMIT === "1";
const QUEUE_INTERVAL_MS = Number(process.env.QUEUE_INTERVAL_MS || "60000");

const newsRoot = path.resolve(__dirname, "..", NEWS_ROOT);
const queueDir = path.join(newsRoot, "queue");
const queueFile = path.join(queueDir, "urls.txt");
const processedFile = path.join(queueDir, "urls.processed.txt");

const execAsync = promisify(exec);

async function runSummarizer(url) {
  console.log(`[queue_worker] ingest: ${url}`);

  const cmd = `node scripts/summarize_article.mjs "${url}"`;
  const { stdout, stderr } = await execAsync(cmd, {
    cwd: path.resolve(__dirname, ".."), // ai-news-bot ルートで実行
    maxBuffer: 10 * 1024 * 1024,
    shell: true,
  });

  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
}

async function processQueueOnce() {
  await fs.mkdir(queueDir, { recursive: true });

  let text = "";
  try {
    text = await fs.readFile(queueFile, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("[queue_worker] queue file not found, nothing to do.");
      return;
    }
    throw err;
  }

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (!lines.length) {
    console.log("[queue_worker] queue empty.");
    return;
  }

  console.log(`[queue_worker] found ${lines.length} URL(s) in queue.`);

  const remaining = [];

  for (const url of lines) {
    try {
      await runSummarizer(url);
      await fs.appendFile(processedFile, url + "\n", "utf8");
    } catch (err) {
      console.error(`[queue_worker] ERROR processing ${url}:`, err);
      remaining.push(url);
    }
  }

  const newContent =
    remaining.length > 0 ? remaining.join("\n") + "\n" : "";
  await fs.writeFile(queueFile, newContent, "utf8");

  console.log(
    `[queue_worker] done. success=${lines.length - remaining.length}, failed=${remaining.length}`
  );

  if (AUTO_COMMIT) {
    await autoCommit();
  }
}

async function autoCommit() {
  console.log(
    "[queue_worker] auto-commit enabled, running git add/commit/push..."
  );
  try {
    await execAsync("git add .", { cwd: newsRoot });
    // 何も変更がないと commit は exit code 1 になるので || true で握りつぶす
    await execAsync(
      'git commit -m "chore(news): auto-ingest from Discord" || true',
      { cwd: newsRoot, shell: true }
    );
    await execAsync("git push", { cwd: newsRoot });
    console.log("[queue_worker] git push done.");
  } catch (err) {
    console.error("[queue_worker] auto-commit error:", err);
  }
}

async function mainLoop() {
  console.log(
    `[queue_worker] starting loop. interval=${QUEUE_INTERVAL_MS}ms, NEWS_ROOT=${newsRoot}`
  );

  // 起動直後に1回実行
  await processQueueOnce();

  // 以降は一定間隔で実行
  setInterval(() => {
    processQueueOnce().catch((err) => {
      console.error("[queue_worker] loop error:", err);
    });
  }, QUEUE_INTERVAL_MS);
}

mainLoop().catch((err) => {
  console.error("[queue_worker] fatal error:", err);
  process.exit(1);
});
