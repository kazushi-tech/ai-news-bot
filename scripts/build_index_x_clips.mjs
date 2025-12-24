// scripts/build_index_x_clips.mjs
// X(Twitter) クリップノート (ai-news/x-clips/*.md) から
// ai-news/x-clips/index.md を自動生成するスクリプト。

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// /Users/omats/git-check/myapp
const ROOT = path.resolve(__dirname, "..", "..");

// NEWS_ROOT は ai-news へのパス（.env で指定されていればそれを優先）
const NEWS_ROOT =
  process.env.NEWS_ROOT || path.join(ROOT, "ai-news");

const XCLIPS_DIR = path.join(NEWS_ROOT, "x-clips");
const OUTPUT_PATH = path.join(XCLIPS_DIR, "index.md");

/**
 * かなり雑な frontmatter パーサー。
 * YAML ライブラリを入れずに key: value のみ抜き出す。
 */
function parseFrontmatter(text) {
  const fmMatch = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return {};

  const fmText = fmMatch[1];
  const result = {};

  for (const line of fmText.split("\n")) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    const value = m[2].trim();
    // 文字列の両端のクォートを外す
    const cleaned = value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    result[key] = cleaned;
  }

  return result;
}

/**
 * x-clips ディレクトリのノートを読み込む。
 */
async function loadClips() {
  let files = [];
  try {
    files = await fs.readdir(XCLIPS_DIR);
  } catch (e) {
    console.error("[xclips] XCLIPS_DIR を読めません:", XCLIPS_DIR, e);
    return [];
  }

  const mdFiles = files.filter(
    (f) => f.endsWith(".md") && f !== "index.md"
  );

  const clips = [];
  for (const file of mdFiles) {
    const fullPath = path.join(XCLIPS_DIR, file);
    let text;
    try {
      text = await fs.readFile(fullPath, "utf8");
    } catch (e) {
      console.error("[xclips] 読み込み失敗:", fullPath, e);
      continue;
    }

    const fm = parseFrontmatter(text);

    // ファイル名からの日付推定 (YYYY-MM-DD-- 形式)
    let guessedDate = "";
    const m = file.match(/^(\d{4}-\d{2}-\d{2})--/);
    if (m) guessedDate = m[1];

    const title = fm.title || file.replace(/\.md$/, "");
    const created = fm.created || guessedDate || "";
    const url = fm.url || fm.source_url || "";
    const domain = fm.domain || "x.com";

    clips.push({
      file,
      relPath: `ai-news/x-clips/${file}`,
      title,
      created,
      url,
      domain,
    });
  }

  // 日付降順でソート（created がなければファイル名順）
  clips.sort((a, b) => {
    const da = a.created || "";
    const db = b.created || "";
    if (da === db) return b.file.localeCompare(a.file);
    return db.localeCompare(da);
  });

  return clips;
}

/**
 * index.md の Markdown 本文を生成。
 */
function buildIndexMarkdown(clips) {
  const lines = [];

  lines.push("---");
  lines.push("title: X clips index");
  lines.push("---", "");

  lines.push("# X clips 一覧", "");
  lines.push(
    "> このページは `scripts/build_index_x_clips.mjs` によって自動生成されています。手動で編集しないでください。",
    ""
  );

  if (clips.length === 0) {
    lines.push("まだ X clips のノートはありません。");
    lines.push("");
    return lines.join("\n");
  }

  lines.push("| 日付 | タイトル | クリップノート | 元ツイート |");
  lines.push("| --- | --- | --- | --- |");

  for (const c of clips) {
    const date = c.created || "";
    const title = c.title || c.file.replace(/\.md$/, "");
    const noteLink = `[ノート](${c.relPath})`;
    const tweetLink = c.url ? `[リンク](${c.url})` : "";

    lines.push(
      `| ${date} | ${title} | ${noteLink} | ${tweetLink} |`
    );
  }

  lines.push("");

  return lines.join("\n");
}

async function main() {
  console.log("[xclips] ROOT      =", ROOT);
  console.log("[xclips] NEWS_ROOT =", NEWS_ROOT);
  console.log("[xclips] XCLIPS_DIR =", XCLIPS_DIR);
  console.log("[xclips] OUTPUT_PATH =", OUTPUT_PATH);

  const clips = await loadClips();
  console.log("[xclips] clip count =", clips.length);

  const md = buildIndexMarkdown(clips);
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, md, "utf8");

  console.log("[xclips] wrote:", OUTPUT_PATH);
}

main().catch((err) => {
  console.error("[xclips] Fatal error:", err);
  process.exit(1);
});
