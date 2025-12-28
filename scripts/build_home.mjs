// scripts/build_home.mjs
// root/index.md を自動更新
// 最新Weeklyと最近のDailyを表示（手書き部分は保護）

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NEWS_ROOT, WEEKLY_DIR, NEWS_DIR, NEWS_AI_DIR } from "./lib/paths.mjs";

// 設定
const AI_NEWS_DIR = NEWS_ROOT;
const MAX_RECENT_DAILIES = Number.parseInt(
  process.env.HOME_RECENT_DAILIES || "10",
  10
); // .env or default

const INDEX_PATH = path.join(AI_NEWS_DIR, "index.md");
const TEMPLATE_PATH = path.join(AI_NEWS_DIR, "_templates", "index.md");
const WEEKLY_DIR_PATH = WEEKLY_DIR;
const DAILY_DIRS = [
  NEWS_AI_DIR, // 新
  NEWS_DIR     // 旧互換
];

const MAX_DAILIES = 7;
const AUTO_START = "<!-- AUTO:START -->";
const AUTO_END = "<!-- AUTO:END -->";

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

async function safeReaddir(dir) {
  try {
    return await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

async function getTemplate() {
  try {
    return await fs.readFile(TEMPLATE_PATH, "utf8");
  } catch {
    // デフォルトテンプレート（万が一テンプレートファイルがない場合）
    return [
      "---",
      "kind: ai-news-index",
      "---",
      "# AI News Index",
      "",
      AUTO_START,
      "## 📅 日次まとめ",
      "",
      "<!-- 日次ファイルへのリンク一覧 -->",
      "",
      "---",
      "",
      "## 📰 最新ニュース",
      "",
      "| 日付 | タイトル | ソース |",
      "| --- | --- | --- |",
      "",
      AUTO_END,
      "",
      "_最終更新: {{timestamp}}_"
    ].join("\n");
  }
}

// -----------------------------------------------------------------------------
// Data Collection
// -----------------------------------------------------------------------------

async function collectWeeklies() {
  try {
    const entries = await fs.readdir(WEEKLY_DIR_PATH, { withFileTypes: true });
    return entries
    .filter(e => e.isFile() && e.name.match(/^\d{4}-W\d{2}(--AI-(news|weekly))?\.md$/))
    .map(e => e.name)
    .sort()
    .reverse(); // 新しい順
  } catch {
    return [];
  }
}

async function collectDailies() {
  const files = [];
  const seen = new Set();
  
  for (const dir of DAILY_DIRS) {
    const entries = await safeReaddir(dir);
    for (const e of entries) {
      // YYYY-MM-DD-AI-news.md (新) or YYYY-MM-DD--AI-news.md (旧)
      if (e.isFile() && e.name.match(/^\d{4}-\d{2}-\d{2}--?AI-news\.md$/)) {
        // 重複排除（同じファイル名なら先にスキャンした方=news/ai優先）
        if (seen.has(e.name)) continue;
        seen.add(e.name);
        
        // パス情報を付加
        // index.md から見た相対ディレクトリ
        const relDir = path.relative(AI_NEWS_DIR, dir);
        files.push({
          name: e.name,
          relPath: path.join(relDir, e.name)
        });
      }
    }
  }
  
  // 日付順ソート（ファイル名先頭YYYY-MM-DD）
  return files.sort((a, b) => b.name.localeCompare(a.name));
}

async function getDailyHeadlines(dailyFiles, limit = 5) {
  const headlines = [];
  // 最新のDailyファイルいくつかを開いてヘッドラインを取得する処理...
  // だが、今回はindex.mdの仕様（日次まとめリンク + 最新ニューステーブル）に合わせる
  // 最新ニューステーブルは `articles/*.md` から生成するほうが正確だが、
  // TASK 02の要件は「直近N件のDailyをテーブルで表示（リンク付き）」とある
  // 「最新Weekly」「最近のDaily（テーブル：日付 / Dailyノート）」
  
  // ということなので、今回はDailyファイルの中身を展開するのではなく、Dailyノートへのリンク一覧を表示する。
  return dailyFiles.slice(0, limit);
}

/**
 * Daily ノートから記事件数を取得
 */
async function getDailyArticleCount(dailyPath) {
  try {
    const content = await fs.readFile(dailyPath, "utf8");
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const yamlContent = frontmatterMatch[1];
      const countMatch = yamlContent.match(/article_count:\s*(\d+)/);
      if (countMatch) return Number.parseInt(countMatch[1], 10);
    }
    // フォールバック: テーブル行数をカウント
    const tableLines = content.match(/^\|\s*\d+\s*\|/gm);
    return tableLines ? tableLines.length : 0;
  } catch {
    return 0;
  }
}

/**
 * Daily ノートから注目記事を取得
 */
async function getDailyFeaturedArticle(dailyPath) {
  try {
    const content = await fs.readFile(dailyPath, "utf8");
    // テーブルから記事リンクを抽出
    const articleLinks = [];
    const tableRegex = /\[\[articles\/(.*?)\.md\|/g;
    let match;
    while ((match = tableRegex.exec(content)) !== null) {
      articleLinks.push(match[1]);
    }
    
    if (articleLinks.length === 0) return null;
    
    // 各記事の interest を取得
    let maxInterest = -1;
    let featuredArticle = null;
    
    for (const articleFile of articleLinks) {
      const articlePath = path.join(AI_NEWS_DIR, "articles", `${articleFile}.md`);
      try {
        const articleContent = await fs.readFile(articlePath, "utf8");
        const frontmatterMatch = articleContent.match(/^---\n([\s\S]*?)\n---/);
        if (frontmatterMatch) {
          const yamlContent = frontmatterMatch[1];
          const interestMatch = yamlContent.match(/interest:\s*(\d+)/);
          const titleMatch = yamlContent.match(/title:\s*(.+)/);
          
          const interest = interestMatch ? Number.parseInt(interestMatch[1], 10) : 0;
          const title = titleMatch ? titleMatch[1].replace(/^["']|["']$/g, "").trim() : null;
          
          if (interest > maxInterest && title) {
            maxInterest = interest;
            featuredArticle = { title, link: `articles/${articleFile}` };
          }
        }
      } catch {
        // 記事ファイルが見つからない場合はスキップ
      }
    }
    
    // 注目記事が見つからない場合は最初の記事を返す
    if (!featuredArticle && articleLinks.length > 0) {
      const firstArticleFile = articleLinks[0];
      const firstArticlePath = path.join(AI_NEWS_DIR, "articles", `${firstArticleFile}.md`);
      try {
        const articleContent = await fs.readFile(firstArticlePath, "utf8");
        const frontmatterMatch = articleContent.match(/^---\n([\s\S]*?)\n---/);
        if (frontmatterMatch) {
          const yamlContent = frontmatterMatch[1];
          const titleMatch = yamlContent.match(/title:\s*(.+)/);
          const title = titleMatch ? titleMatch[1].replace(/^["']|["']$/g, "").trim() : articleLinks[0];
          featuredArticle = { title, link: `articles/${firstArticleFile}` };
        }
      } catch {
        // エラー時はファイル名を使用
        featuredArticle = { title: articleLinks[0], link: `articles/${firstArticleFile}` };
      }
    }
    
    return featuredArticle;
  } catch {
    return null;
  }
}

/**
 * Weekly ノートから TL;DR を取得
 */
async function getWeeklyTldr(weeklyPath) {
  try {
    const content = await fs.readFile(weeklyPath, "utf8");
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const yamlContent = frontmatterMatch[1];
      const tldrMatch = yamlContent.match(/tldr:\s*(.+)/);
      if (tldrMatch) return tldrMatch[1].replace(/^["']|["']$/g, "").trim();
    }
    
    // フォールバック: 本文の最初の意味のある段落を取得
    // frontmatterの後、見出しや空行をスキップして最初の段落を探す
    const bodyMatch = content.match(/^---[\s\S]*?---\n([\s\S]+)/);
    if (bodyMatch) {
      const body = bodyMatch[1];
      // 行ごとに分割して、最初の意味のある段落を探す
      const lines = body.split("\n");
      let paragraph = "";
      
      for (const line of lines) {
        const trimmed = line.trim();
        // 見出し、空行、区切り線、リスト、テーブルをスキップ
        if (!trimmed || 
            trimmed.startsWith("#") || 
            trimmed.startsWith("---") ||
            trimmed.startsWith("|") ||
            trimmed.startsWith("-") ||
            trimmed.startsWith("*") ||
            trimmed.startsWith(">")) {
          if (paragraph) break; // 既に段落があればそこで終了
          continue;
        }
        
        // 意味のあるテキスト行を見つけた
        paragraph += (paragraph ? " " : "") + trimmed;
        
        // 120文字を超えたらそこで切る
        if (paragraph.length >= 120) {
          paragraph = paragraph.slice(0, 120) + "...";
          break;
        }
      }
      
      if (paragraph) return paragraph;
    }
    
    return "週次レポートの要約はまだありません。";
  } catch {
    return "週次レポートの要約を取得できませんでした。";
  }
}

// -----------------------------------------------------------------------------
// Builder
// -----------------------------------------------------------------------------

async function generateAutoContent(weeklies, dailies) {
  const lines = [];

  // Hero セクション
  lines.push("# 🤖 AI News Bot");
  lines.push("");
  lines.push("AI/ML 関連の最新ニュースを毎日自動収集・要約するプロジェクトです。Discord に投稿されたURLを自動的に記事化し、Obsidian で閲覧できます。");
  lines.push("");
  lines.push("> [!tip] 使い方");
  lines.push("> - **Daily**: 毎日の記事一覧をチェック");
  lines.push("> - **Weekly**: 週ごとの重要トピックをまとめて確認");
  lines.push("> - **Browse**: トピックやソース別に記事を探索");
  lines.push("");
  lines.push("---");
  lines.push("");

  // Quick Links
  lines.push("## ⚡ Quick Links");
  lines.push("");
  const today = new Date().toISOString().slice(0, 10);
  const todayDaily = dailies.find(d => d.name.includes(today));
  if (todayDaily) {
    const linkPath = todayDaily.relPath.replace(/\.md$/, "");
    lines.push(`- 📅 **Today**: [[${linkPath}|今日のニュース]]`);
  } else {
    lines.push("- 📅 **Today**: _準備中_");
  }
  if (weeklies.length > 0) {
    const latestWeekly = weeklies[0].replace(/\.md$/, "");
    lines.push(`- 📰 **Latest Weekly**: [[weekly/${latestWeekly}|最新の週次レポート]]`);
  }
  lines.push("- 🔍 **Browse**: [[browse/index|アーカイブ・分類別]]");
  lines.push("");
  lines.push("---");
  lines.push("");

  // Latest Weekly（強調表示 + TL;DR）
  lines.push("## 📰 最新の週次レポート");
  lines.push("");
  if (weeklies.length > 0) {
    const latest = weeklies[0];
    const weekPart = latest.split("--")[0];
    const basename = latest.replace(/\.md$/, "");
    const linkPath = `weekly/${basename}`;
    const weeklyPath = path.join(WEEKLY_DIR_PATH, latest);
    
    // TL;DR を取得
    const tldr = await getWeeklyTldr(weeklyPath);
    
    lines.push(`> [!note] ${weekPart} 週次まとめ`);
    lines.push(`> [[${linkPath}|${weekPart} 週のまとめを読む →]]`);
    lines.push(`> `);
    lines.push(`> **要約**: ${tldr}`);
  } else {
    lines.push("> [!info] まだWeeklyレポートはありません");
    lines.push("> Dailyニュースが蓄積されると、週次レポートが自動生成されます。");
  }
  lines.push("");
  lines.push("---");
  lines.push("");

  // Recent Daily（拡張テーブル）
  lines.push("## 📅 最近のデイリーニュース");
  lines.push("");
  lines.push("| 日付 | 件数 | 今日の注目 | リンク |");
  lines.push("| --- | --- | --- | --- |");

  const displayDailies = dailies.slice(0, MAX_DAILIES);
  for (const d of displayDailies) {
    const dateMatch = d.name.match(/^(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : d.name;
    const linkPath = d.relPath.replace(/\.md$/, "");
    
    // Daily ファイルのフルパスを構築
    const dailyFullPath = path.join(AI_NEWS_DIR, d.relPath);
    
    // 件数を取得
    const count = await getDailyArticleCount(dailyFullPath);
    
    // 注目記事を取得
    const featured = await getDailyFeaturedArticle(dailyFullPath);
    const featuredText = featured 
      ? `[[${featured.link}|${featured.title}]]` 
      : "-";
    
    lines.push(`| ${date} | ${count} | ${featuredText} | [[${linkPath}|→]] |`);
  }

  lines.push("");
  lines.push("---");
  lines.push("");

  // Browse & Navigation
  lines.push("## 🔍 Browse & Navigation");
  lines.push("");
  lines.push("### 📚 アーカイブ");
  lines.push("- [[weekly/index|📰 Weekly アーカイブ]] - 週次レポート一覧");
  lines.push("- [[news/ai/index|📅 Daily アーカイブ]] - 日次ニュース一覧");
  lines.push("- [[articles/index|📝 Articles]] - 全記事一覧");
  lines.push("");
  lines.push("### 🏷️ 分類別");
  lines.push("- [[browse/tags/index|🏷️ Tag Index]] - トピック別");
  lines.push("- [[browse/sources/index|📡 Source Index]] - ソース別");
  lines.push("- [[browse/monthly/index|📅 Monthly Index]] - 月別アーカイブ");
  lines.push("");

  return lines.join("\n");
}

async function main() {
  console.log("[build_home] Target:", INDEX_PATH);
  
  const weeklies = await collectWeeklies();
  const dailies = await collectDailies();
  
  console.log(`[build_home] Found ${weeklies.length} weeklies, ${dailies.length} dailies`);
  
  const autoContent = await generateAutoContent(weeklies, dailies);
  const replacement = `${AUTO_START}\n${autoContent}\n${AUTO_END}`;
  
  let currentContent;
  try {
    currentContent = await fs.readFile(INDEX_PATH, "utf8");
  } catch {
    console.log("[build_home] index.md not found, creating from template.");
    currentContent = await getTemplate();
  }
  
  // 置換処理
  const regex = new RegExp(`${AUTO_START}[\\s\\S]*?${AUTO_END}`);
  let newContent;
  
  if (regex.test(currentContent)) {
    console.log("[build_home] Updating existing AUTO block.");
    newContent = currentContent.replace(regex, replacement);
  } else {
    console.log("[build_home] AUTO block not found, appending.");
    newContent = currentContent + "\n\n" + replacement;
  }
  
  // タイムスタンプ更新（_最終更新: ..._ があれば）
  // ただし、手書き部分を壊さないため、AUTOブロック外の更新は慎重に。
  // 今回はAUTOブロック内のみ更新が安全だが、footerのタイムスタンプ更新要望があれば対応。
  // テンプレートには `_最終更新: {{timestamp}}_` があるので、初回作成時は置換。
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  newContent = newContent.replace(/\{\{\s*timestamp\s*\}\}/g, now);
  newContent = newContent.replace(/\{\{\s*date\s*\}\}/g, now.slice(0, 10));

  if (newContent !== currentContent) {
    await fs.writeFile(INDEX_PATH, newContent, "utf8");
    console.log("[build_home] Updated index.md");
  } else {
    console.log("[build_home] No changes needed.");
  }
}

main().catch(err => {
  console.error("[build_home] Error:", err);
  process.exit(1);
});
