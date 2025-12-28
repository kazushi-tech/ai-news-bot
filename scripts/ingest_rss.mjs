#!/usr/bin/env node
// scripts/ingest_rss.mjs
// Configured RSS feeds -> state/url_inbox.md
// 重複排除: 既存記事(news_dedupe.json) + Inbox内の既存URL

import fs from 'node:fs/promises';
import path from 'node:path';
import Parser from 'rss-parser';
import { normalizeUrl, hashUrl } from './lib/url_normalizer.mjs';
import { NEWS_ROOT, STATE_DIR, DEDUPE_FILE, REPO_ROOT } from './lib/paths.mjs';
import logger from './lib/logger.mjs';

const INBOX_FILE = path.join(STATE_DIR, 'url_inbox.md');
const SOURCES_CONFIG = path.join(REPO_ROOT, 'config', 'ai_sources.json');

// RSS Parser setup with timeout
const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; AI-News-Bot/1.0; +https://github.com/omats/ai-news-bot)'
  }
});

async function loadConfig() {
  const content = await fs.readFile(SOURCES_CONFIG, 'utf8');
  return JSON.parse(content);
}

async function loadDedupe() {
  try {
    const content = await fs.readFile(DEDUPE_FILE, 'utf8');
    return JSON.parse(content);
  } catch {
    return { hashes: {} };
  }
}

async function loadInboxUrls() {
  try {
    const content = await fs.readFile(INBOX_FILE, 'utf8');
    const urls = new Set();
    // Markdown link pattern: [Title](URL)
    const matches = content.matchAll(/\]\((https?:\/\/[^\)]+)\)/g);
    for (const m of matches) {
      urls.add(normalizeUrl(m[1]));
    }
    return { content, urls };
  } catch {
    return { content: '# URL Inbox\n\n| Done | Date | Title | Source |\n| --- | --- | --- | --- |\n', urls: new Set() };
  }
}

async function fetchFeed(source) {
  if (source.disabled) return [];
  try {
    logger.info(`Fetching ${source.label}...`);
    const feed = await parser.parseURL(source.rss);
    return feed.items.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      source: source.label
    }));
  } catch (err) {
    logger.warn(`Failed to fetch ${source.label}: ${err.message}`);
    return [];
  }
}

async function main() {
  logger.info('Starting RSS ingestion...');
  
  // Create state dir if needed
  await fs.mkdir(STATE_DIR, { recursive: true });

  const config = await loadConfig();
  const dedupe = await loadDedupe();
  let { content: inboxContent, urls: inboxUrls } = await loadInboxUrls();
  
  let newCount = 0;
  const today = new Date().toISOString().split('T')[0];
  const newLines = [];

  for (const source of config.sources) {
    const items = await fetchFeed(source);
    
    for (const item of items) {
      if (!item.link) continue;
      
      const normalized = normalizeUrl(item.link);
      const hash = hashUrl(item.link);
      
      // 1. Check dedupe store (already processed articles)
      if (dedupe.hashes[hash]) {
        continue;
      }
      
      // 2. Check inbox (already pending)
      if (inboxUrls.has(normalized)) {
        continue;
      }
      
      // New candidate!
      const pubDate = item.pubDate.toISOString().split('T')[0];
      const safeTitle = (item.title || 'No Title').replace(/\|/g, '\\|').replace(/\n/g, ' ').trim();
      const line = `- [ ] ${pubDate} [${safeTitle}](${item.link}) *(${item.source})*`;
      
      newLines.push(line);
      inboxUrls.add(normalized); // Add to local set to prevent dups within same run
      newCount++;
    }
  }

  if (newCount > 0) {
    // Append to inbox
    // 既存のコンテンツの最後に追記するか、テーブル形式にするか
    // 前回のフォーマット: | Done | Date | Title | Source | で初期化しているが
    // promptでは `- [ ]` 形式を要求されているため、リスト形式で追記する
    
    // Markdownのテーブルとリストが混在すると見づらいので、今回はシンプルにリスト追記にする
    // もしファイルが空ならヘッダーを入れる
    if (!inboxContent.trim()) {
      inboxContent = '# URL Inbox\n\n';
    }
    
    // 日付ヘッダーを入れると分かりやすいかも
    const appendContent = `\n## Collected on ${new Date().toISOString()}\n` + newLines.join('\n') + '\n';
    await fs.appendFile(INBOX_FILE, appendContent, 'utf8');
    
    logger.info(`Added ${newCount} new articles to inbox.`);
    console.log(`Saved to: ${INBOX_FILE}`);
  } else {
    logger.info('No new articles found.');
  }
}

main().catch(err => {
  logger.error(err);
  process.exit(1);
});
