// scripts/doctor_title_and_trim.mjs
// ai-news/articles/ 配下の「AI News 記事」に対して、
//  - URLだけの先頭行があれば除去
//  - 本文から日本語タイトルを自動抽出して H1 を付与
//  - frontmatter の title をそのタイトルに揃える
//  - 末尾に余っているダブりの「抽出ポイント」セクションがあれば削除
//
// ※ cssclass: ai-news-article が付いている記事だけを対象にする

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEWS_ROOT =
  process.env.NEWS_ROOT ||
  path.resolve(__dirname, "..", "ai-news");
const ARTICLES_DIR = path.join(NEWS_ROOT, "articles");

console.log("[doctor-title-trim] NEWS_ROOT   =", NEWS_ROOT);
console.log("[doctor-title-trim] ARTICLES_DIR =", ARTICLES_DIR);

function hasJapanese(str = "") {
  return /[\u3040-\u30FF\u4E00-\u9FFF々]/.test(str);
}

function splitFrontmatter(raw) {
  const lines = raw.split("\n");
  if (lines[0]?.trim() !== "---") {
    return {
      meta: {},
      fmLines: [],
      bodyLines: lines,
    };
  }
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) {
    return {
      meta: {},
      fmLines: [],
      bodyLines: lines,
    };
  }
  const fmLines = lines.slice(1, end);
  const bodyLines = lines.slice(end + 1);
  const meta = {};
  for (const line of fmLines) {
    const m = line.trim().match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (m) {
      const key = m[1];
      let value = m[2].trim();
      if (
        (value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"'))
      ) {
        value = value.slice(1, -1);
      }
      meta[key] = value;
    }
  }
  return { meta, fmLines, bodyLines };
}

function updateTitleInFrontmatter(fmLines, newTitle) {
  if (!newTitle) return fmLines;
  let found = false;
  const updated = fmLines.map((line) => {
    if (line.trim().startsWith("title:")) {
      found = true;
      return `title: ${newTitle}`;
    }
    return line;
  });
  if (!found) {
    updated.unshift(`title: ${newTitle}`);
  }
  return updated;
}

// 本文からタイトル候補を拾う
function deriveTitleFromBody(body) {
  const lines = body.split("\n");

  const pickSentenceFrom = (startIndex) => {
    for (let i = startIndex + 1; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) continue;
      if (line.startsWith("#")) break; // 次の見出しに来たら終わり
      if (line.startsWith("-") || line.startsWith("*")) {
        line = line.replace(/^[-*]\s*/, "");
      }
      const m = line.match(/^(.+?[。．])/);
      return (m ? m[1] : line).trim();
    }
    return "";
  };

  // 1. 「抽出ポイント」の最初の1文
  let idx = lines.findIndex((l) => /^##+\s*抽出ポイント/.test(l.trim()));
  if (idx !== -1) {
    const t = pickSentenceFrom(idx);
    if (t && hasJapanese(t)) return t;
  }

  // 2. 「概要」の最初の1文
  idx = lines.findIndex((l) => /^##+\s*概要/.test(l.trim()));
  if (idx !== -1) {
    const t = pickSentenceFrom(idx);
    if (t) return t;
  }

  // 3. 最初の「見出しではない」行
  for (const l of lines) {
    const line = l.trim();
    if (!line || line.startsWith("#")) continue;
    return line;
  }
  return "";
}

// 末尾にダブっている「抽出ポイント」セクションがあればカットする
function removeTrailingExtractStub(body) {
  const lines = body.split("\n");
  const indices = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^##+\s*抽出ポイント/.test(lines[i].trim())) {
      indices.push(i);
    }
  }
  // 抽出ポイントが1回しか出てこないなら何もしない
  if (indices.length <= 1) return body;

  const last = indices[indices.length - 1];

  // 末尾側の「抽出ポイント」に、さらに別の見出しが続いていたら消さない
  for (let i = last + 1; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t) continue;
    if (t.startsWith("#")) {
      return body;
    }
  }

  const kept = lines.slice(0, last);
  return kept.join("\n").replace(/\n+$/, "\n");
}

async function main() {
  const entries = await fs.readdir(ARTICLES_DIR, { withFileTypes: true });
  const markdownFiles = entries
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) => e.name);

  console.log("[doctor-title-trim] markdown articles found:", markdownFiles.length);

  let updated = 0;
  let skipped = 0;

  for (const filename of markdownFiles) {
    const fullPath = path.join(ARTICLES_DIR, filename);
    const raw = await fs.readFile(fullPath, "utf8");

    const { meta, fmLines, bodyLines } = splitFrontmatter(raw);

    const hasCss =
      fmLines.some((l) =>
        /^cssclass:\s*ai-news-article\s*$/.test(l.trim())
      );

    if (!hasCss) {
      skipped++;
      continue;
    }

    let body = bodyLines.join("\n");

    let lines = body.split("\n");
    let firstIdx = lines.findIndex((l) => l.trim() !== "");
    if (firstIdx === -1) {
      skipped++;
      continue;
    }

    // 先頭が URL だけの行（# 付きでも可）なら削除
    let first = lines[firstIdx].trim();
    if (/^#?\s*https?:\/\//.test(first)) {
      lines.splice(firstIdx, 1);
      firstIdx = lines.findIndex((l) => l.trim() !== "");
      first = firstIdx === -1 ? "" : lines[firstIdx].trim();
    }

    let newTitle = meta.title || "";

    // すでにまともな H1 があるなら、それを title に採用するだけ
    if (first && first.startsWith("# ") && !first.includes("http")) {
      const h1 = first.replace(/^#\s+/, "").trim();
      if (h1 && h1 !== newTitle) {
        newTitle = h1;
      }
    } else {
      // H1 がない or URL しかなかった場合は本文からタイトル生成
      if (!newTitle || !hasJapanese(newTitle)) {
        const derived = deriveTitleFromBody(lines.join("\n"));
        if (derived) {
          newTitle = derived;
        }
      }
      if (newTitle) {
        const before = firstIdx === -1 ? [] : lines.slice(0, firstIdx);
        const after = firstIdx === -1 ? [] : lines.slice(firstIdx);
        lines = [...before, `# ${newTitle}`, "", ...after];
      }
    }

    let newBody = lines.join("\n");
    newBody = removeTrailingExtractStub(newBody);

    const newFmLines =
      newTitle && newTitle !== meta.title
        ? updateTitleInFrontmatter(fmLines, newTitle)
        : fmLines;

    const rebuilt =
      (newFmLines.length ? ["---", ...newFmLines, "---", ""].join("\n") : "") +
      newBody.replace(/^\n+/, "");

    if (rebuilt !== raw) {
      await fs.writeFile(fullPath, rebuilt, "utf8");
      console.log("[doctor-title-trim] updated:", filename);
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(
    "[doctor-title-trim] done. updated=%d, skipped=%d",
    updated,
    skipped
  );
}

main().catch((err) => {
  console.error("[doctor-title-trim] ERROR:", err);
  process.exit(1);
});
