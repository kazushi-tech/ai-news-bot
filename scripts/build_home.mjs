// scripts/build_home.mjs
// AI News トップページ (ai-news/index.md) を再生成する。
// - 最新 Weekly (weekly/)
// - 最近の Daily (news/)
// を Obsidian で確実にクリックできる「Markdown リンク形式」で一覧表示する。

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ====== パス設定 ======
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// NEWS_ROOT が指定されていなければ ../ai-news を見る
const AI_NEWS_DIR =
  process.env.NEWS_ROOT || path.resolve(__dirname, "..", "ai-news");

const DAILY_DIR = path.join(AI_NEWS_DIR, "news");
const WEEKLY_DIR = path.join(AI_NEWS_DIR, "weekly");
const HOME_INDEX_PATH = path.join(AI_NEWS_DIR, "index.md");

// 最近の Daily を何件出すか（環境変数で調整可）
const MAX_RECENT_DAILIES = Number.parseInt(
  process.env.HOME_RECENT_DAILIES || "7",
  10
);

// ====== ヘルパー ======
async function safeReaddir(dir) {
  try {
    return await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err && err.code === "ENOENT") {
      // ディレクトリがまだ無い場合は空扱いにする
      return [];
    }
    throw err;
  }
}

function getDowJa(dateStr) {
  // dateStr: "2025-11-22" など
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const labels = ["日", "月", "火", "水", "木", "金", "土"];
  return labels[d.getDay()];
}

// news/ 配下から最近の Daily を収集
async function collectRecentDailies() {
  const entries = await safeReaddir(DAILY_DIR);

  const files = entries
    .filter((ent) => ent.isFile() && ent.name.endsWith(".md"))
    .map((ent) => ent.name)
    // 形式: YYYY-MM-DD--AI-news.md のものだけ
    .filter((name) => /^\d{4}-\d{2}-\d{2}--AI-news\.md$/.test(name));

  // ファイル名先頭の日付 (YYYY-MM-DD) で降順ソート
  files.sort((a, b) => {
    const da = a.slice(0, 10);
    const db = b.slice(0, 10);
    // 降順
    return db.localeCompare(da);
  });

  const trimmed = files.slice(0, MAX_RECENT_DAILIES);

  return trimmed.map((name) => {
    const dateStr = name.slice(0, 10); // "YYYY-MM-DD"
    const dow = getDowJa(dateStr);
    const label = dow ? `${dateStr}（${dow}）` : dateStr;
    const basename = name.replace(/\.md$/, "");

    // index.md から見た相対パス（Markdownリンク用）
    const linkPath = `news/${basename}`;

    return { dateStr, label, linkPath };
  });
}

// weekly/ 配下から最新 Weekly を収集
async function collectLatestWeeklies(limit = 3) {
  const entries = await safeReaddir(WEEKLY_DIR);

  const files = entries
    .filter((ent) => ent.isFile() && ent.name.endsWith(".md"))
    .map((ent) => ent.name)
    // 形式: 2025-W47--AI-news.md など
    .filter((name) => /^\d{4}-W\d{2}--AI-news\.md$/.test(name));

  // ファイル名（= 年+週）で降順ソート
  files.sort((a, b) => b.localeCompare(a));

  const trimmed = files.slice(0, limit);

  return trimmed.map((name) => {
    const weekPart = name.split("--")[0]; // "2025-W47"
    const basename = name.replace(/\.md$/, "");
    const linkPath = `weekly/${basename}`; // index.md からの相対パス

    return { weekPart, linkPath };
  });
}

// index.md の Markdown を組み立て
function buildMarkdown({ weeklies, dailies }) {
  const weeklySection =
    weeklies.length === 0
      ? [
          "## 最新 Weekly",
          "",
          "> [!info]",
          "> まだ Weekly ノートが生成されていません。",
          "> `weekly/` ディレクトリが空の場合はこの表示になります。",
          "",
        ].join("\n")
      : [
          "## 最新 Weekly",
          "",
          ...weeklies.map(
            (w) => `- [${w.weekPart} AI News](${w.linkPath})`
          ),
          "",
        ].join("\n");

  const dailyHeader = "## 最近の Daily";
  let dailySection = "";

  if (dailies.length === 0) {
    dailySection = [
      dailyHeader,
      "",
      "> [!info]",
      "> まだ Daily ノートが生成されていません。",
      "> Discord に URL を貼ってキューが処理されると、ここに直近数日分が並びます。",
      "",
    ].join("\n");
  } else {
    const tableHeader = [
      dailyHeader,
      "",
      "| 日付 | Daily ノート |",
      "| --- | --- |",
    ].join("\n");

    const rows = dailies
      .map((d) => {
        const linkLabel = `${d.label} の AI News`;
        const link = `[${linkLabel}](${d.linkPath})`;
        return `| ${d.label} | ${link} |`;
      })
      .join("\n");

    dailySection = `${tableHeader}\n${rows}\n`;
  }

  const frontmatter = [
    "---",
    'title: "AI News index"',
    "cssclass: ai-news-home",
    "---",
    "",
  ].join("\n");

  const body = [
    "# AI News index",
    "",
    "> [!summary] このページの読み方",
    "> - まずは「最新 Weekly」から全体像をざっくり把握",
    "> - 次に「最近の Daily」から気になる日付を開く",
    "> - 個別記事は Daily ノート内のテーブルから読む",
    "",
    weeklySection,
    dailySection,
  ].join("\n");

  return `${frontmatter}${body}\n`;
}

// ====== エントリーポイント ======
async function main() {
  try {
    console.log("[build_home] AI_NEWS_DIR =", AI_NEWS_DIR);
    console.log("[build_home] DAILY_DIR   =", DAILY_DIR);
    console.log("[build_home] WEEKLY_DIR  =", WEEKLY_DIR);
    console.log("[build_home] OUTPUT      =", HOME_INDEX_PATH);

    const [weeklies, dailies] = await Promise.all([
      collectLatestWeeklies(3),
      collectRecentDailies(),
    ]);

    console.log(
      `[build_home] weeklies=${weeklies.length}, dailies=${dailies.length}`
    );

    const markdown = buildMarkdown({ weeklies, dailies });

    await fs.writeFile(HOME_INDEX_PATH, markdown, "utf8");

    console.log(
      `[build_home] done. wrote index.md with ${weeklies.length} weeklies & ${dailies.length} dailies.`
    );
  } catch (err) {
    console.error("[build_home] ❌ ERROR", err);
    process.exitCode = 1;
  }
}

main();
