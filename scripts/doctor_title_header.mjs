// scripts/doctor_title_header.mjs
// 各記事の「タイトル見出し」を本文先頭に揃える doctor。
//
// ポリシー：
// - title 候補は frontmatter.title（ただし URL っぽい値は除外）か、本文から自動推定
// - タイトル候補が本文中に現れる最初の行より「上」は全部捨てる
// - その行自体も削除し、本文先頭に "# タイトル" を 1 行だけ置く
// - frontmatter.title が無くて本文から拾えた場合は、ついでに frontmatter に title を追記（あれば）
// - タイトル候補がどうしても見つからない記事は何も変えない（noCandidate）
// - 同じファイルに何度回しても 2 回目以降はスキップされる（idempotent）
//
// 実行例：
//   NEWS_ROOT=../ai-news node scripts/doctor_title_header.mjs

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEWS_ROOT =
  process.env.NEWS_ROOT ||
  path.resolve(__dirname, "..", "ai-news");
const ARTICLES_DIR = path.join(NEWS_ROOT, "articles");

// =======================
// utils: ファイル列挙
// =======================

async function collectMarkdownFiles(dir, acc = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectMarkdownFiles(full, acc);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      acc.push(full);
    }
  }
  return acc;
}

// =======================
// frontmatter 周り
// =======================

function splitFrontmatter(content) {
  const fmRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]*/;
  const match = content.match(fmRegex);
  if (match) {
    const frontmatter = match[1];
    const body = content.slice(match[0].length);
    return { frontmatter, body, fmMatch: match };
  }
  return { frontmatter: null, body: content, fmMatch: null };
}

function extractTitleFromFrontmatter(fm) {
  if (!fm) return null;
  const lines = fm.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^title\s*:\s*(.*)\s*$/);
    if (m) {
      let value = m[1].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      return value;
    }
  }
  return null;
}

function ensureTitleInFrontmatter(fm, title) {
  if (!fm) {
    return { frontmatter: fm, changed: false };
  }
  const lines = fm.split(/\r?\n/);
  let hasTitle = false;
  for (const line of lines) {
    if (/^title\s*:/.test(line)) {
      hasTitle = true;
      break;
    }
  }
  if (hasTitle) {
    return { frontmatter: fm, changed: false };
  }

  const safeTitle = title.replace(/"/g, '\\"');
  const titleLine = `title: "${safeTitle}"`;
  const next = [titleLine, ...lines].join("\n");
  return { frontmatter: next, changed: true };
}

function isProbableUrl(str) {
  return /^https?:\/\//.test(str.trim());
}

// =======================
// 本文処理
// =======================

/**
 * 本文からタイトル候補（文字列とその index）を推定する。
 * - まず H1/H2 から探す（ただしよくあるセクション名は除外）
 * - 見つからなければ「プレーンな長めの1行テキスト」を探す
 */
function findTitleCandidateFromBody(lines) {
  const NON_TITLE_HEADINGS = new Set([
    "概要",
    "要約",
    "要約（TL;DR）",
    "TL;DR",
    "詳細レポート",
    "抽出テキスト",
    "重要な示唆",
    "リスク・未確定要素",
    "リスク・未確定要因",
  ]);

  // 1st pass: H1 / H2
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    const m = line.match(/^(#{1,2})\s+(.+)$/);
    if (!m) continue;
    const text = m[2].trim();
    if (!text) continue;
    if (NON_TITLE_HEADINGS.has(text)) continue;
    if (isProbableUrl(text)) continue;
    return { title: text, index: i };
  }

  // 2nd pass: プレーンテキスト行
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) continue;
    if (/^(#{1,6}|>|\*|-|\[|`)/.test(line)) continue; // 見出し・引用・箇条書きなどは除外
    if (isProbableUrl(line)) continue;
    if (line.length < 6) continue; // 短すぎるのは除外

    return { title: line, index: i };
  }

  return null;
}

/**
 * Fallback：
 *  - 本文中にタイトル行そのものは無いが、title は分かっている
 *  - 既存の本文はそのまま残しつつ、先頭に "# タイトル" を差し込む
 */
function fallbackInsertTitleAtTop(body, title) {
  const lines = body.split(/\r?\n/);
  const newLines = [];

  newLines.push(`# ${title.trim()}`);
  newLines.push("");

  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i++;
  for (; i < lines.length; i++) {
    newLines.push(lines[i]);
  }

  return newLines.join("\n");
}

/**
 * body と「タイトル文字列 & その index（あれば）」から、新しい body を作る。
 * - index が指定されていれば、その行より上は全部捨てる
 * - その行自体も捨てる
 * - 先頭に "# タイトル" を挿入
 * - index が無い（-1）の場合は fallbackInsertTitleAtTop
 */
function transformBodyWithTitle(body, title, titleIndexInBody) {
  const lines = body.split(/\r?\n/);

  if (titleIndexInBody == null || titleIndexInBody < 0) {
    return fallbackInsertTitleAtTop(body, title);
  }

  let restLines = lines.slice(titleIndexInBody + 1);

  while (restLines.length > 0 && restLines[0].trim() === "") {
    restLines.shift();
  }

  const newLines = [];
  newLines.push(`# ${title.trim()}`);
  newLines.push("");
  newLines.push(...restLines);

  return newLines.join("\n");
}

// =======================
// ファイル単位処理
// =======================

async function processFile(filePath, counters) {
  const raw = await fs.readFile(filePath, "utf8");
  const { frontmatter, body, fmMatch } = splitFrontmatter(raw);

  const hasFrontmatter = !!frontmatter;
  let title = extractTitleFromFrontmatter(frontmatter);
  let titleFromBody = false;

  const bodyLines = body.split(/\r?\n/);

  let titleIndexInBody = -1;

  // frontmatter.title が無い or URL っぽい → 本文から探す
  if (!title || isProbableUrl(title)) {
    if (!title) {
      counters.noTitleInFrontmatter++;
    } else if (isProbableUrl(title)) {
      // URL が title に入っていたパターン
      counters.frontmatterTitleLooksLikeUrl =
        (counters.frontmatterTitleLooksLikeUrl || 0) + 1;
    }

    const cand = findTitleCandidateFromBody(bodyLines);
    if (cand) {
      title = cand.title;
      titleIndexInBody = cand.index;
      titleFromBody = true;
    } else {
      // frontmatter に URL ではない title が入っていればそれをそのまま使う
      if (title && !isProbableUrl(title)) {
        // title はあるが本文中には見つからない → 上はそのまま残しつつ先頭に H1 を足す
        titleIndexInBody = -1;
      } else {
        counters.noCandidate++;
        counters.skipped++;
        return;
      }
    }
  } else {
    // frontmatter.title がちゃんとある場合は、それを本文中から探す
    const cand = findTitleCandidateFromBody(bodyLines);
    if (cand && cand.title === title) {
      titleIndexInBody = cand.index;
    } else {
      titleIndexInBody = -1; // 本文中に同じ行がない → 上は残したまま先頭に H1 を足す
    }
  }

  const newBody = transformBodyWithTitle(body, title, titleIndexInBody);

  let newContent;
  let fmChanged = false;
  let fmNew = frontmatter;

  if (titleFromBody && frontmatter) {
    const ensured = ensureTitleInFrontmatter(frontmatter, title);
    fmNew = ensured.frontmatter;
    fmChanged = ensured.changed;
  }

  if (frontmatter) {
    if (fmChanged) {
      const bodyNormalized = newBody.replace(/^\n+/, "");
      newContent = `---\n${fmNew}\n---\n\n${bodyNormalized}`;
    } else {
      const prefixLength = fmMatch[0].length;
      newContent = raw.slice(0, prefixLength) + newBody;
    }
  } else {
    newContent = newBody;
  }

  if (newContent === raw) {
    counters.skipped++;
    return;
  }

  await fs.writeFile(filePath, newContent, "utf8");
  counters.updated++;
}

// =======================
// main
// =======================

async function main() {
  console.log(`[title-header] NEWS_ROOT   = ${NEWS_ROOT}`);
  console.log(`[title-header] ARTICLES_DIR = ${ARTICLES_DIR}`);

  const files = await collectMarkdownFiles(ARTICLES_DIR);

  const counters = {
    updated: 0,
    skipped: 0,
    noCandidate: 0,
    noFrontmatter: 0,
    noTitleInFrontmatter: 0,
    frontmatterTitleLooksLikeUrl: 0,
  };

  for (const filePath of files) {
    try {
      const { frontmatter } = splitFrontmatter(
        await fs.readFile(filePath, "utf8")
      );
      if (!frontmatter) counters.noFrontmatter++;

      await processFile(filePath, counters);
    } catch (err) {
      console.error(`[title-header] ERROR in ${filePath}:`, err);
      counters.skipped++;
    }
  }

  console.log(
    `[title-header] done. updated=${counters.updated}, skipped=${counters.skipped}, ` +
      `noCandidate=${counters.noCandidate}, noFrontmatter=${counters.noFrontmatter}, ` +
      `noTitleInFrontmatter=${counters.noTitleInFrontmatter}, ` +
      `frontmatterTitleLooksLikeUrl=${counters.frontmatterTitleLooksLikeUrl || 0}`
  );
}

main().catch((err) => {
  console.error("[title-header] FATAL:", err);
  process.exit(1);
});
