#!/usr/bin/env node
// scripts/backfill_links.mjs
// 日次ニュース(news/*.md)をスキャンし、記事テーブルのリンク化（[[articles/slug|Title]]）と記事ページ生成を行う

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { hashUrl, normalizeUrl } from "./lib/url_normalizer.mjs";
import { REPO_ROOT, NEWS_ROOT, NEWS_DIR, NEWS_AI_DIR, ARTICLES_DIR, DEDUPE_FILE } from "./lib/paths.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CLI Args
const DRY_RUN = process.argv.includes("--dry-run");
const MAX_FILES = parseInt(getArg("--max-files", "100"), 10);
const SLEEP_MS = parseInt(getArg("--sleep", "500"), 10);
const TARGET_MONTH = getArg("--month", null); // YYYY-MM
// 単一ファイル指定
const FILE_TARGET = getArg("--file", null);

function getArg(name, def) {
  const found = process.argv.find(a => a.startsWith(name + "="));
  return found ? found.split("=")[1] : def;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// --------------------------------------------------------------------------
// Dedupe Helpers
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
// Article Generation Helper
// --------------------------------------------------------------------------
async function findExistingArticle(url) {
  try {
    const entries = await fs.readdir(ARTICLES_DIR, { withFileTypes: true });
    const files = entries.filter(e => e.isFile() && e.name.endsWith(".md"));
    const normUrl = normalizeUrl(url);

    for (const file of files) {
      const fullPath = path.join(ARTICLES_DIR, file.name);
      const content = await fs.readFile(fullPath, "utf8");
      // source_url frontmatter
      const m = content.match(/source_url:\s*["']?([^\s"'\n]+)/);
      if (m && m[1]) {
        if (normalizeUrl(m[1]) === normUrl) {
          return file.name;
        }
      }
    }
  } catch {}
  return null;
}

function runSummarize(url, dateStr) {
  return new Promise((resolve, reject) => {
    const args = ["scripts/summarize_article.mjs", url];
    if (dateStr) args.push(`--date=${dateStr}`);
    
    // バックグラウンドだとAPI制限踏みやすいので同期的に待つ
    const child = spawn("node", args, {
      cwd: REPO_ROOT,
      stdio: "inherit",
      env: { ...process.env }
    });
    
    child.on("exit", (code) => {
      code === 0 ? resolve() : reject(new Error(`Exit code ${code}`));
    });
    child.on("error", reject);
  });
}

// --------------------------------------------------------------------------
// Main Rewrite Logic
// --------------------------------------------------------------------------

async function processDailyFile(filePath, dedupe) {
  const filename = path.basename(filePath);
  // 日付抽出
  const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
  const dateStr = dateMatch ? dateMatch[1] : null;

  console.log(`\n[backfill] Processing: ${filename}`);
  let content = await fs.readFile(filePath, "utf8");
  const lines = content.split("\n");
  const newLines = [];
  let modified = false;

  for (let line of lines) {
    // テーブル行チェック
    let isTable = false;
    let titleIdx = -1;
    let urlIdx = -1;
    let articleIdx = -1;
    let cols = line.split("|");

    // Format A: | # | Title | Source | Sum | Tag | URL | (len >= 8 due to empty start/end)
    // Format B: | Title | Article | Source | (len >= 5 due to empty start/end)

    if (cols.length >= 7 && line.includes("| # |")) {
       // Format A (New) matches my build_index_daily
       titleIdx = 2;
       urlIdx = 6;
       isTable = true;
    } else if (cols.length >= 4 && !line.includes("---")) { 
       // Format B (Old/Intermediate)
       // Empty | Title | Article | Source | Empty
       titleIdx = 1;
       articleIdx = 2;
       // Source might contain [引用元](url)
       urlIdx = 3; 
       isTable = true;
    }

    if (isTable && titleIdx >= 0) {
        let titleCell = cols[titleIdx].trim();
        // Check if already linked
        if (titleCell.includes("[[") && titleCell.includes("]]")) {
           // Already linked, skip
        } else {
            let url = null;
            let articleFile = null;

            // Try to get URL from URL column
            if (urlIdx >= 0 && cols[urlIdx]) {
               const raw = cols[urlIdx].trim();
               const m = raw.match(/\((https?:\/\/[^\)]+)\)/);
               if (m) url = m[1];
               else if (raw.match(/^https?:\/\//)) url = raw;
            }
            
            // Try to get Article File from Article column (Format B)
            if (articleIdx >= 0 && cols[articleIdx]) {
               const raw = cols[articleIdx].trim();
               const m = raw.match(/\[\[articles\/([^\|\]]+)/);
               if (m) {
                  articleFile = m[1];
                  // If we have article file, we can link title directly
               }
            }

            if (!url && !articleFile) {
               // Can't do anything
            } else {
                if (!articleFile && url) {
                   const urlHash = hashUrl(url);
                   
                   // Dedupe check
                   if (dedupe.hashes[urlHash] && dedupe.hashes[urlHash].articleFile) {
                      articleFile = dedupe.hashes[urlHash].articleFile;
                      try { await fs.stat(path.join(ARTICLES_DIR, articleFile)); } catch { articleFile = null; }
                   }
                   if (!articleFile) articleFile = await findExistingArticle(url);
                   
                   if (!articleFile) {
                      // Generate
                      if (DRY_RUN) {
                         console.log(`  [DRY] Would generate article for: ${url}`);
                         articleFile = "dummy-generated.md";
                      } else {
                         console.log(`  [GEN] Generating article for: ${url}`);
                         try {
                           await runSummarize(url, dateStr);
                           articleFile = await findExistingArticle(url);
                           if (articleFile) {
                              dedupe.hashes[urlHash] = { original: url, articleFile, timestamp: new Date().toISOString() };
                           }
                           await sleep(SLEEP_MS);
                         } catch(e) { console.error(e); }
                      }
                   } else {
                      // Update dedupe
                      if (!dedupe.hashes[urlHash]) dedupe.hashes[urlHash] = { original: url, articleFile, timestamp: new Date().toISOString() };
                   }
                }
                
                if (articleFile) {
                   const cleanTitle = titleCell;
                   const newTitleCell = ` [[articles/${articleFile}|${cleanTitle}]] `;
                   cols[titleIdx] = newTitleCell;
                   
                   const newLine = cols.join("|");
                   if (newLine !== line) {
                      console.log(`  [MOD] Linked Title: ${cleanTitle}`);
                      line = newLine;
                      modified = true;
                   }
                }
            }
        }
    }
    newLines.push(line);
  }

  if (modified) {
    if (DRY_RUN) {
      console.log(`[DRY] Would save changes to ${filename}`);
    } else {
      await fs.writeFile(filePath, newLines.join("\n"), "utf8");
      console.log(`[SAVE] Updated ${filename}`);
    }
  } else {
    console.log(`[SKIP] No changes for ${filename}`);
  }
}

async function main() {
  console.log(`[backfill] Start (DRY_RUN=${DRY_RUN})`);
  
  const dedupe = await loadDedupe();
  
  // 対象ファイル収集
  let files = [];
  if (FILE_TARGET) {
     files.push(path.resolve(FILE_TARGET));
  } else {
     // news/ai/*.md and news/*.md
     try {
       const aiFiles = (await fs.readdir(AI_NEWS_DIR)).map(f => path.join(AI_NEWS_DIR, f));
       files.push(...aiFiles);
     } catch {}
     
     try {
       const legacyFiles = (await fs.readdir(NEWS_DIR)).map(f => path.join(NEWS_DIR, f)).filter(f => f.endsWith(".md"));
       files.push(...legacyFiles);
     } catch {}
  }
  
  // Filter & Sort
  files = files
    .filter(f => f.match(/\d{4}-\d{2}-\d{2}.*\.md$/))
    .sort()
    .reverse(); // 最新から処理
    
  if (TARGET_MONTH) {
    files = files.filter(f => path.basename(f).includes(TARGET_MONTH));
  }
  
  files = files.slice(0, MAX_FILES);
  
  console.log(`[backfill] Targets: ${files.length} files`);
  
  for (const f of files) {
    await processDailyFile(f, dedupe);
  }
  
  if (!DRY_RUN) {
    await saveDedupe(dedupe);
  }
  console.log("[backfill] Done.");
}

main().catch(console.error);
