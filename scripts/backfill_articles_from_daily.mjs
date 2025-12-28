#!/usr/bin/env node
// scripts/backfill_articles_from_daily.mjs
// 既存news/*.mdをスキャンし、記事ページをバックフィル＆日次テーブルを内部リンク化

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { hashUrl, normalizeUrl } from "./lib/url_normalizer.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const NEWS_ROOT = path.resolve(__dirname, "..", "..");

// CLI引数パーサ
function getArg(name, def) {
  const found = process.argv.find(a => a.startsWith(name + "="));
  return found ? found.split("=").slice(1).join("=") : def;
}
function getFlag(name, def = false) {
  return process.argv.includes(name) ? true : def;
}

const MAX_ARTICLES = parseInt(getArg("--max", "50"), 10);
const SLEEP_MS = parseInt(getArg("--sleep", "1000"), 10);
const MONTH_FILTER = getArg("--month", null); // YYYY-MM
const DRY_RUN = getFlag("--dry-run");
const SKIP_GEMINI = getFlag("--skip-gemini");

const NEWS_DIR = path.join(NEWS_ROOT, "news");
const ARTICLES_DIR = path.join(NEWS_ROOT, "articles");
const DEDUPE_FILE = path.join(NEWS_ROOT, ".data", "news_dedupe.json");

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

console.log("[backfill] NEWS_ROOT:", NEWS_ROOT);
console.log("[backfill] NEWS_DIR:", NEWS_DIR);
console.log("[backfill] ARTICLES_DIR:", ARTICLES_DIR);
console.log("[backfill] MAX_ARTICLES:", MAX_ARTICLES);
console.log("[backfill] DRY_RUN:", DRY_RUN);
console.log("[backfill] MONTH_FILTER:", MONTH_FILTER || "(all)");

// --------------------------------------------------------------------------
// dedupe管理
// --------------------------------------------------------------------------

async function loadDedupe() {
  try {
    const data = await fs.readFile(DEDUPE_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return { hashes: {} };
  }
}

async function saveDedupe(dedupe) {
  await fs.mkdir(path.dirname(DEDUPE_FILE), { recursive: true });
  await fs.writeFile(DEDUPE_FILE, JSON.stringify(dedupe, null, 2), "utf8");
}

// --------------------------------------------------------------------------
// 日次ファイルからURL抽出
// --------------------------------------------------------------------------

function extractUrlsFromDaily(content) {
  const urls = [];
  // パターン1: [引用元へ](url) or [引用元](url)
  const linkPattern = /\[引用元[へ]?\]\((https?:\/\/[^\s)]+)\)/g;
  let match;
  while ((match = linkPattern.exec(content)) !== null) {
    urls.push(match[1]);
  }
  // パターン2: [リンク](url)
  const linkPattern2 = /\[リンク\]\((https?:\/\/[^\s)]+)\)/g;
  while ((match = linkPattern2.exec(content)) !== null) {
    urls.push(match[1]);
  }
  // パターン3: テーブル外の生URL
  const rawUrlPattern = /(?<!\()(https?:\/\/[^\s<>)\]]+)(?!\))/g;
  while ((match = rawUrlPattern.exec(content)) !== null) {
    if (!urls.includes(match[1])) {
      urls.push(match[1]);
    }
  }
  return [...new Set(urls)];
}

// --------------------------------------------------------------------------
// 記事ファイル存在チェック
// --------------------------------------------------------------------------

async function findExistingArticle(url) {
  try {
    const entries = await fs.readdir(ARTICLES_DIR, { withFileTypes: true });
    const files = entries.filter(e => e.isFile() && e.name.endsWith(".md"));
    
    for (const file of files) {
      const fullPath = path.join(ARTICLES_DIR, file.name);
      const content = await fs.readFile(fullPath, "utf8");
      // frontmatterからsource_urlを抽出
      const sourceMatch = content.match(/source_url:\s*["']?([^\s"'\n]+)/);
      if (sourceMatch && sourceMatch[1]) {
        const normalizedFile = normalizeUrl(sourceMatch[1]);
        const normalizedInput = normalizeUrl(url);
        if (normalizedFile === normalizedInput) {
          return file.name;
        }
      }
    }
  } catch {
    // ディレクトリなし等
  }
  return null;
}

// --------------------------------------------------------------------------
// summarize_article.mjsを実行
// --------------------------------------------------------------------------

function runSummarize(url, dateStr) {
  return new Promise((resolve, reject) => {
    const args = [
      "scripts/summarize_article.mjs",
      url
    ];
    if (dateStr) {
      args.push(`--date=${dateStr}`);
    }
    
    const child = spawn("node", args, {
      cwd: REPO_ROOT,
      stdio: "inherit",
      env: { ...process.env }
    });
    
    child.on("exit", (code) => {
      code === 0 ? resolve() : reject(new Error(`summarize failed: ${code}`));
    });
    child.on("error", reject);
  });
}

// --------------------------------------------------------------------------
// メイン処理
// --------------------------------------------------------------------------

async function main() {
  // 日次ファイル一覧取得
  let dailyFiles;
  try {
    const entries = await fs.readdir(NEWS_DIR, { withFileTypes: true });
    dailyFiles = entries
      .filter(e => e.isFile() && e.name.match(/^\d{4}-\d{2}-\d{2}--?AI-news\.md$/))
      .map(e => e.name)
      .sort();
  } catch {
    console.log("[backfill] news/ ディレクトリが見つかりません");
    return;
  }
  
  // 月フィルタ
  if (MONTH_FILTER) {
    dailyFiles = dailyFiles.filter(f => f.startsWith(MONTH_FILTER));
  }
  
  console.log(`[backfill] ${dailyFiles.length} 日次ファイルを処理対象`);
  
  const dedupe = await loadDedupe();
  let processedCount = 0;
  let skippedDedupe = 0;
  let skippedExists = 0;
  let newArticles = 0;
  
  for (const dailyFile of dailyFiles) {
    if (processedCount >= MAX_ARTICLES) break;
    
    const dailyPath = path.join(NEWS_DIR, dailyFile);
    const content = await fs.readFile(dailyPath, "utf8");
    const urls = extractUrlsFromDaily(content);
    
    // 日付を抽出
    const dateMatch = dailyFile.match(/^(\d{4}-\d{2}-\d{2})/);
    const dateStr = dateMatch ? dateMatch[1] : null;
    
    console.log(`\n[backfill] ${dailyFile}: ${urls.length} URLs found`);
    
    for (const url of urls) {
      if (processedCount >= MAX_ARTICLES) break;
      
      // dedupe チェック
      const urlHash = hashUrl(url);
      if (dedupe.hashes[urlHash]) {
        skippedDedupe++;
        continue;
      }
      
      // 既存記事チェック
      const existing = await findExistingArticle(url);
      if (existing) {
        // dedupeに登録して次回スキップ
        dedupe.hashes[urlHash] = {
          original: url,
          normalized: normalizeUrl(url),
          articleFile: existing,
          timestamp: new Date().toISOString()
        };
        skippedExists++;
        continue;
      }
      
      // 記事生成
      if (DRY_RUN) {
        console.log(`[DRY] would generate: ${url}`);
      } else if (SKIP_GEMINI) {
        console.log(`[SKIP-GEMINI] would generate: ${url}`);
      } else {
        console.log(`[RUN] generating article for: ${url}`);
        try {
          await runSummarize(url, dateStr);
          newArticles++;
          
          // dedupeに登録
          dedupe.hashes[urlHash] = {
            original: url,
            normalized: normalizeUrl(url),
            timestamp: new Date().toISOString()
          };
          
          await sleep(SLEEP_MS);
        } catch (err) {
          console.error(`[ERROR] ${url}: ${err.message}`);
        }
      }
      
      processedCount++;
    }
  }
  
  // dedupe保存
  if (!DRY_RUN) {
    await saveDedupe(dedupe);
  }
  
  console.log("\n[backfill] ========== Summary ==========");
  console.log(`  Total URLs processed: ${processedCount}`);
  console.log(`  Skipped (dedupe): ${skippedDedupe}`);
  console.log(`  Skipped (exists): ${skippedExists}`);
  console.log(`  New articles: ${newArticles}`);
  console.log(`  DRY_RUN: ${DRY_RUN}`);
}

main().catch(err => {
  console.error("[backfill] FATAL:", err);
  process.exit(1);
});
