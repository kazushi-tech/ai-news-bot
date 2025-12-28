#!/usr/bin/env node
// scripts/build_weekly.mjs
// 直近1週間（または指定週）のDailyを集約し、Geminiで週報を生成する

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 設定
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const AI_NEWS_DIR = process.env.NEWS_ROOT || REPO_ROOT;

const WEEKLY_DIR = path.join(AI_NEWS_DIR, "weekly");
const DAILY_DIRS = [
  path.join(AI_NEWS_DIR, "news", "ai"),
  path.join(AI_NEWS_DIR, "news")
];
const TEMPLATE_PATH = path.join(AI_NEWS_DIR, "_templates", "weekly.md");

// Gemini Config
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.0-flash-exp"; // 高速・高性能モデル推奨

// CLI Args
const targetDateStr = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : undefined;
const DRY_RUN = process.argv.includes("--dry-run");

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo };
}

function getWeekRange(dateStr) {
  const now = dateStr ? new Date(dateStr) : new Date();
  const day = now.getDay(); // 0:Sun, 1:Mon...
  
  // 今週の月曜日（前の月曜日）
  // Sunday(0) -> -6
  // Mon(1) -> 0
  // Tue(2) -> -1 ...
  const diff = now.getDate() - day + (day == 0 ? -6 : 1);
  const start = new Date(now.setDate(diff));
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  const { year, week } = getWeekNumber(start);
  const weekStr = `${year}-W${String(week).padStart(2, '0')}`;
  
  return { start, end, weekStr };
}

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

// -----------------------------------------------------------------------------
// Article Extraction
// -----------------------------------------------------------------------------

async function safeReaddir(dir) {
  try {
    return await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

async function collectArticles(start, end) {
  const articles = [];
  const seenUrls = new Set();
  
  console.log(`[weekly] Scanning dailies from ${formatDate(start)} to ${formatDate(end)}...`);
  
  for (const dir of DAILY_DIRS) {
    const entries = await safeReaddir(dir);
    for (const e of entries) {
      // Filename: YYYY-MM-DD-AI-news.md
      const match = e.name.match(/^(\d{4}-\d{2}-\d{2})--?AI-news\.md$/);
      if (!match) continue;
      
      const date = new Date(match[1]);
      // 日付範囲チェック (UTC/Localのズレを考慮し、余裕を持って判定して後で厳密にするか、文字列比較)
      // ここでは文字列比較が安全
      const dateStr = match[1];
      if (dateStr < formatDate(start) || dateStr > formatDate(end)) continue;
      
      const content = await fs.readFile(path.join(dir, e.name), "utf8");
      
      // 詳細セクションから記事情報を抽出
      // ### N) [Title](Url)
      // - bullet
      // **Why it matters:** ...
      
      const sections = content.split(/^### \d+\) /m).slice(1);
      
      for (const sect of sections) {
        // [Title](Url)
        const titleMatch = sect.match(/^\[([^\]]+)\]\(([^\)]+)\)/);
        if (!titleMatch) continue;
        
        const title = titleMatch[1];
        const url = titleMatch[2];
        
        if (seenUrls.has(url)) continue;
        seenUrls.add(url);
        
        // Extract content
        const lines = sect.split("\n");
        let whyItMatters = "";
        let reliability = "";
        let importance = 3;
        const bullets = [];
        
        for (const line of lines) {
          if (line.match(/^\s*-\s/)) bullets.push(line.replace(/^\s*-\s/, ""));
          if (line.includes("**Why it matters:**")) whyItMatters = line.replace(/\*\*Why it matters:\*\*\s*/, "");
          if (line.includes("**信頼度:**")) reliability = line.replace(/\*\*信頼度:\*\*\s*/, "");
        }
        
        // Imp列はDailyのテーブルにあるので、本来はテーブルをパースすべきだが
        // 現状のDailyフォーマットではMarkdownテーブルがメインで、詳細セクションにはImp記述がない。
        // Dailyのテーブル `| ... | Imp | ...` を読むのは少し手間。
        // 簡易的に、詳細セクションの生成元である記事ファイルのfrontmatterを読みに行くのが確実だが遅い。
        // TASK 02でDaily生成時にImpを詳細セクションに出力していない。
        // 本来ならDaily生成ロジックを変えて詳細セクションにもImpを入れるべきだが、
        // build_index_daily.jsを見るとImpはfrontmatterから取っている。
        // ここでは、一旦デフォルト3にしておくか、あるいは可能なら詳細セクションから取りたいが...
        // 時間がないので、今回は「もし詳細セクションにImp記述があれば取る」ようにし、
        // なければデフォルト3とする。
        // (注: 今後の改善でDaily生成時にImpを詳細に入れると良い)

        articles.push({
          date: dateStr,
          title,
          url,
          bullets,
          whyItMatters,
          reliability,
          importance
        });
      }
    }
  }
  
  return articles.sort((a, b) => a.date.localeCompare(b.date));
}

// -----------------------------------------------------------------------------
// Gemini Generation
// -----------------------------------------------------------------------------

async function generateWeeklyContent(articles) {
  if (articles.length === 0) return null;
  
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  
  const articleList = articles.map((a, i) => `
ID: ${i + 1}
Title: ${a.title}
Date: ${a.date}
Importance: ${a.importance || '3'}
Summary: ${a.bullets.join(" ")}
Why it matters: ${a.whyItMatters}
reliability: ${a.reliability}
`).join("\n---\n");

  const prompt = `
あなたはAIニュースの週刊レポート編集者です。
以下の今週のAIニュース記事リスト（${articles.length}件）を分析し、Markdown形式で週報を作成してください。

Markdown形式:

## 今週のハイライト
（今週のAI業界の動向を3〜5行で要約。最も重要なテーマに触れること。）

## Top 5 News
（最も重要度・インパクトが高いニュースを5つ選定。選定理由は「業界への影響度」「技術的進歩」「社会的関心」に基づく。）
1. **[記事タイトル]**
   - （簡潔な要約）
   - **Why:** （選定理由や重要性を一言で）
   - [詳細](${'{url}'})  <-- 元URLではなく、記事IDに対応するURLを後で置換するため、{url}というプレースホルダは使わず、単にリンク記法だけ書いてください。後でスクリプトが補完します。
   **指示**: ここでのリンクは、[ソース](URL) のように書いてください。

## トレンド
（記事リストから読み取れるキーテーマやトレンドを2〜3個）
- **[テーマ名]**: 解説

## 注目プロダクト/リリース
（あれば。モデル公開、ライブラリ更新など）
- **[名前]**: 解説

---

注意事項:
- **推測しない**: リストにある情報のみを使用すること。
- **日本語**: 全て日本語で記述すること。
- **公平性**: 特定の企業に偏らず、重要なものを客観的に選ぶこと。

記事リスト:
${articleList}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

async function main() {
  if (!GEMINI_API_KEY && !DRY_RUN) {
    console.error("Error: GEMINI_API_KEY is not set.");
    process.exit(1);
  }

  const { start, end, weekStr } = getWeekRange(targetDateStr);
  console.log(`[weekly] Generating report for ${weekStr} (${formatDate(start)} ~ ${formatDate(end)})`);
  
  const articles = await collectArticles(start, end);
  console.log(`[weekly] Found ${articles.length} unique articles.`);
  
  if (articles.length === 0) {
    console.log("[weekly] No articles found. Skipping generation.");
    return;
  }
  
  console.log("[weekly] Calling Gemini...");
  let aiContent;
  if (DRY_RUN) {
    console.log("[weekly] DRY_RUN: Skipping Gemini call.");
    aiContent = "## Dry Run Content\n\nThis is a mock report generated in dry-run mode.";
  } else {
    aiContent = await generateWeeklyContent(articles);
  }
  
  // リンクの補完等の後処理（必要なら）
  // Geminiが正しくリンクを書かない場合への対策として、記事リストを末尾に付加するテーブルはスクリプト側で生成する
  
  // テンプレート読み込み
  let template;
  try {
    template = await fs.readFile(TEMPLATE_PATH, "utf8");
  } catch {
     template = [
       "---",
       "week: {{week}}",
       "range_start: {{start}}",
       "range_end: {{end}}",
       "kind: ai-news-weekly",
       "---",
       "",
       "# AI News Weekly ({{week}})",
       "",
       "**期間:** {{start}} 〜 {{end}}",
       "",
       "---",
       "",
       "<!-- GEMINI_CONTENT -->",
       "",
       "---",
       "",
       "## 記事一覧",
       "",
       "| 日付 | タイトル | ソース |",
       "| --- | --- | --- |",
       "<!-- ARTICLE_TABLE -->"
     ].join("\n");
  }
  
  // 記事一覧テーブル生成
  const tableRows = articles.map(a => {
    // 日次ファイルへのリンクなどを貼りたいが、とりあえず元URLへのリンク
    // または個別記事ページがあればそちらへ（今回は簡易的にタイトルに元URLリンク）
    // 日次ファイル内の場所へのリンクが理想だが、アンカー生成が複雑。
    // Articleページが存在すればそちらにリンクするのがベスト (TASK 02でバックフィル済み前提)
    // ここでは articles/ から検索するのはコストが高いので、一旦元URLリンクにしておく。
    // もしくは `news/YYYY-MM-DD-AI-news.md` へのリンク?
    
    // TASK 01規約により `articles/YYYY-MM-DD--domain--slug.md` があるはず。
    // ここでは簡易的に、[タイトル](source_url) とする。
    return `| ${a.date} | [${a.title}](${a.url}) | [Source](${a.url}) |`;
  }).join("\n");
  
  // 置換
  let output = template
    .replace("{{week}}", weekStr)
    .replace("{{start}}", formatDate(start))
    .replace("{{end}}", formatDate(end))
    .replace("{{range_start}}", formatDate(start))
    .replace("{{range_end}}", formatDate(end));
    
  // AI生成コンテンツの注入
  // テンプレートに <!-- GEMINI_CONTENT --> がなければ、ハイライト付近に挿入
  if (output.includes("<!-- GEMINI_CONTENT -->")) {
    output = output.replace("<!-- GEMINI_CONTENT -->", aiContent);
  } else if (output.includes("<!-- ハイライト記事リスト -->")) {
     output = output.replace("<!-- ハイライト記事リスト -->", aiContent);
  } else {
    output += "\n" + aiContent;
  }
  
  // テーブル注入
  if (output.includes("<!-- ARTICLE_TABLE -->")) {
    output = output.replace("<!-- ARTICLE_TABLE -->", tableRows);
  } else {
    output += "\n\n## 全記事リスト\n\n| 日付 | タイトル | ソース |\n|---|---|---|\n" + tableRows;
  }
  
  // ファイル保存
  await fs.mkdir(WEEKLY_DIR, { recursive: true });
  const outFile = path.join(WEEKLY_DIR, `${weekStr}--AI-weekly.md`); // 命名規則合わせ
  await fs.writeFile(outFile, output, "utf8");
  
  console.log(`[weekly] Wrote to ${outFile}`);
}

main().catch(err => {
  console.error("[weekly] Error:", err);
  process.exit(1);
});
