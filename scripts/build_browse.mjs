#!/usr/bin/env node
// scripts/build_browse.mjs
// browse/ ディレクトリ配下にタグ・ソース・アーカイブ別の静的一覧ページを生成する

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import slugify from "@sindresorhus/slugify";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const NEWS_ROOT = process.env.NEWS_ROOT || REPO_ROOT; // 簡易フォールバック
const ARTICLES_DIR = path.join(NEWS_ROOT, "articles");
const BROWSE_DIR = path.join(NEWS_ROOT, "browse");

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

function getMonthKey(dateStr) {
  // dateStr: YYYY-MM-DD...
  if (!dateStr) return "unknown";
  return dateStr.slice(0, 7); // YYYY-MM
}

function escapePipe(str) {
  return (str || '').replace(/\|/g, '\\|');
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

// -----------------------------------------------------------------------------
// 記事ローダー
// -----------------------------------------------------------------------------

async function loadArticles() {
  console.log(`[browse] Scanning articles in ${ARTICLES_DIR}...`);
  let entries = [];
  try {
    entries = await fs.readdir(ARTICLES_DIR, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn(`[browse] Articles dir not found: ${ARTICLES_DIR}`);
      return [];
    }
    throw err;
  }

  const articles = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    
    const filepath = path.join(ARTICLES_DIR, entry.name);
    try {
      const content = await fs.readFile(filepath, "utf8");
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!fmMatch) continue;

      const fm = YAML.parse(fmMatch[1]);
      
      const title = fm.title || entry.name.replace(/\.md$/, "");
      const date = fm.created || fm.date || "";
      const source = fm.source || fm.host || "";
      const url = fm.url || "";
      
      // Tags
      let tags = [];
      if (Array.isArray(fm.tags)) {
        tags = fm.tags.filter(t => t && t !== 'ai-news');
      }
      
      // Importance
      const importance = fm.importance || fm.interest || 3;

      articles.push({
        file: entry.name,
        title,
        date, // YYYY-MM-DD
        source,
        url,
        tags,
        importance
      });

    } catch (err) {
      console.warn(`[browse] Failed to parse ${entry.name}: ${err.message}`);
    }
  }
  
  // Sort by date desc
  articles.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return articles;
}

// -----------------------------------------------------------------------------
// ページ生成
// -----------------------------------------------------------------------------

function generateTable(articleList, rootRelPath = "..") {
  const header = `| Title | Date | Imp | Source | Links |\n| --- | --- | --- | --- | --- |`;
  const rows = articleList.map(art => {
    // 記事への相対パス
    // browse/tags/xxx.md から articles/yyy.md へのパスは ../../articles/yyy.md
    // rootRelPath が ".." なら browse/index.md からなので articles/yyy.md
    // browse/tags/xxx.md からなら rootRelPath="../.." と指定する
    
    // Obsidian WikiLink形式なら相対パスを気にしなくて良い（Vaultルートからのパスではないが、ファイル名重複なければOK）
    // task要求: "slug化必須" とあるが、WikiLinkはファイル名を指定する。
    // ここでは [[articles/filename|Title]] の形式を使う。Obsidianはこれで認識する。
    // 普通のMarkdownリンクなら相対パス計算が必要。
    
    const titleCell = `[[articles/${art.file}|${escapePipe(art.title)}]]`;
    const sourceCell = escapePipe(art.source);
    
    // Links: [記事](path) / [元サイト](url)
    // WikiLinkを使っているので [記事] は不要かもだが、明示的に入れるなら
    // [Local](${rootRelPath}/articles/${art.file}) のようになるが、
    // Obsidian Publish等を考えると WikiLink の方が安全。
    // User要望: Links列がある。
    const linksCell = [];
    // linksCell.push(`[Local](${rootRelPath}/articles/${art.file})`); // WikiLinkがあるので冗長かも
    // ここでは元サイトへのリンクのみにするか、あるいはWikiLinkが使えない環境用にLocalリンクを入れるか。
    // 要望は "記事ページ / 引用元" とある。
    // ArticleページへはTitleリンクで飛べるので、ここはSource URLへのリンクを置くのが良い。
    if (art.url) {
        linksCell.push(`[Source](${art.url})`);
    } else {
        linksCell.push(`-`);
    }
    
    return `| ${titleCell} | ${art.date} | ${art.importance} | ${sourceCell} | ${linksCell.join(" / ")} |`;
  });
  
  return [header, ...rows].join("\n");
}

async function writePage(relPath, title, articleList, backLink = true) {
  const fullPath = path.join(BROWSE_DIR, relPath);
  await ensureDir(path.dirname(fullPath));
  
  // rootRelPath計算
  // relPath = "tags/openai.md" -> depth=1 -> "../.."
  const depth = relPath.split("/").length - 1;
  const rootRel = "../".repeat(depth + 1); // articlesディレクトリへのパスとしては browse/ から一つ上へ行く必要があるので +1 か？
  // NEWS_ROOT/articles を指すには
  // browse/tags/foo.md -> ../../articles
  
  const table = generateTable(articleList);
  
  const lines = [
    `# ${title}`,
    "",
    `**Count:** ${articleList.length} articles`,
    "",
    table,
    ""
  ];
  
  if (backLink) {
    const parentPath = "../".repeat(depth) + "index.md";
    lines.push(`[← Browse Index](${parentPath})`);
  }
  
  await fs.writeFile(fullPath, lines.join("\n"), "utf8");
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

async function main() {
  const articles = await loadArticles();
  console.log(`[browse] Loaded ${articles.length} articles.`);

  // Grouping
  const byTags = new Map();
  const bySource = new Map();
  const byMonth = new Map();

  for (const art of articles) {
    // Tags
    for (const tag of art.tags) {
      if (!byTags.has(tag)) byTags.set(tag, []);
      byTags.get(tag).push(art);
    }
    // Source
    if (art.source) {
      const slug = slugify(art.source);
      if (!bySource.has(slug)) bySource.set(slug, { name: art.source, list: [] });
      bySource.get(slug).list.push(art);
    }
    // Month
    const month = getMonthKey(art.date);
    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month).push(art);
  }
  
  // Generate Tag Pages
  const tagList = [];
  for (const [tag, list] of byTags.entries()) {
    const slug = slugify(tag);
    const relPath = `tags/${slug}.md`;
    await writePage(relPath, `Tag: ${tag}`, list);
    tagList.push({ name: tag, count: list.length, path: relPath });
  }
  
  // Generate Source Pages
  const sourceList = [];
  for (const [slug, data] of bySource.entries()) {
    const relPath = `sources/${slug}.md`;
    await writePage(relPath, `Source: ${data.name}`, data.list);
    sourceList.push({ name: data.name, count: data.list.length, path: relPath });
  }
  
  // Generate Archive Pages
  const archiveList = [];
  const sortedMonths = Array.from(byMonth.keys()).sort().reverse();
  for (const month of sortedMonths) {
    if (month === 'unknown') continue;
    const list = byMonth.get(month);
    const relPath = `archive/${month}.md`;
    await writePage(relPath, `Archive: ${month}`, list);
    archiveList.push({ name: month, count: list.length, path: relPath });
  }
  
  // Generate Index Page
  console.log(`[browse] Generating index... (Tags: ${tagList.length}, Sources: ${sourceList.length}, Archives: ${archiveList.length})`);
  
  // Sort lists for index
  tagList.sort((a, b) => b.count - a.count); // Count desc
  sourceList.sort((a, b) => b.count - a.count); // Count desc
  // archiveList is already sorted by date desc
  
  const indexLines = [
    "# 📂 Browse Articles",
    "",
    "## 📅 Archive",
    ...archiveList.map(a => `- [${a.name}](${a.path}) (${a.count})`),
    "",
    "## 🏷️ Tags",
    ...tagList.map(t => `- [${t.name}](${t.path}) (${t.count})`),
    "",
    "## 📡 Sources",
    ...sourceList.map(s => `- [${s.name}](${s.path}) (${s.count})`),
    ""
  ];
  
  await fs.writeFile(path.join(BROWSE_DIR, "index.md"), indexLines.join("\n"), "utf8");
  console.log(`[browse] Done. Generated pages in ${BROWSE_DIR}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
