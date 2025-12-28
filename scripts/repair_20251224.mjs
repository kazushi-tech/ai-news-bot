#!/usr/bin/env node
// scripts/repair_20251224.mjs

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const AI_NEWS_DIR = process.env.AI_NEWS_DIR || path.resolve(ROOT_DIR, "..", "ai-news");
const ARTICLES_DIR = path.join(AI_NEWS_DIR, "articles");

const TARGET_DATE_PREFIX = "2025-12-24--";

async function main() {
  console.log(`[repair] Scanning ${ARTICLES_DIR} for ${TARGET_DATE_PREFIX}...`);
  
  const files = await fs.readdir(ARTICLES_DIR);
  const targetFiles = files.filter(f => f.startsWith(TARGET_DATE_PREFIX) && f.endsWith(".md"));
  
  if (targetFiles.length === 0) {
    console.log("[repair] No files found.");
    return;
  }

  const uniqueUrls = new Set();
  const filePathsToDelete = [];

  for (const file of targetFiles) {
    const filePath = path.join(ARTICLES_DIR, file);
    const content = await fs.readFile(filePath, "utf8");
    
    // Frontmatterから source_url を抽出
    const match = content.match(/^source_url:\s*"?([^"\n]+)"?/m);
    if (match) {
      const url = match[1].trim();
      uniqueUrls.add(url);
    } else {
      console.warn(`[repair] Could not find source_url in ${file}`);
    }
    
    filePathsToDelete.push(filePath);
  }

  console.log(`[repair] Found ${targetFiles.length} files.`);
  console.log(`[repair] Extracted ${uniqueUrls.size} unique URLs.`);
  
  // 1. Delete old files
  console.log("[repair] Deleting old files...");
  for (const fp of filePathsToDelete) {
    await fs.unlink(fp);
  }
  
  // 2. Re-summarize
  console.log("[repair] Re-summarizing articles...");
  let count = 0;
  for (const url of uniqueUrls) {
    count++;
    console.log(`\n[repair] Processing ${count}/${uniqueUrls.size}: ${url}`);
    
    // summarize_article.mjs を呼び出す
    // --date=2025-12-24 を指定して日付を維持
    const success = await runNodeScript("scripts/summarize_article.mjs", [url, "--date=2025-12-24"]);
    if (!success) {
      console.error(`[repair] Failed to process ${url}`);
    }
  }
  
  console.log("\n[repair] Done.");
}

function runNodeScript(scriptPath, args = []) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      stdio: "inherit",
      env: { ...process.env, AI_NEWS_DIR },
      cwd: ROOT_DIR,
    });
    child.on("close", (code) => {
      resolve(code === 0);
    });
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
