// scripts/doctor_generate_tldr_from_overview.mjs
// 記事ノートから [tldr] / TL;DR コールアウトを拾って frontmatter.tldr に反映し、
// 本文側の [tldr] / [cite] ブロックを削除するドクター。
// YAML はパースせず、文字列置換だけで扱う。

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEWS_ROOT =
  process.env.NEWS_ROOT || path.resolve(__dirname, "..", "ai-news");
const ARTICLES_DIR = path.join(NEWS_ROOT, "articles");

async function main() {
  console.log("[doctor-tldr] NEWS_ROOT   =", NEWS_ROOT);
  console.log("[doctor-tldr] ARTICLES_DIR =", ARTICLES_DIR);

  const files = (await fs.readdir(ARTICLES_DIR)).filter((f) =>
    f.endsWith(".md"),
  );
  console.log("[doctor-tldr] markdown articles found:", files.length);

  let updatedCount = 0;
  let updatedTldrCount = 0;

  for (const file of files) {
    const fullPath = path.join(ARTICLES_DIR, file);
    const orig = await fs.readFile(fullPath, "utf8");

    const { frontmatter, body } = splitFrontmatter(orig);
    if (!frontmatter) {
      continue;
    }

    let fm = frontmatter;
    let content = body;

    // 1) TL;DR 抽出（[tldr] ヘッダ or TL;DR コールアウト）
    const tldrResult =
      extractTldrFromHeading(content) || extractTldrFromCallout(content);

    let tldr = null;
    if (tldrResult) {
      tldr = tldrResult.tldr;
      content = tldrResult.body;
      updatedTldrCount++;
      console.log("[doctor-tldr] updated tldr:", file);
    }

    // 2) [cite] ブロック除去
    const citeResult = removeCiteBlocks(content);
    if (citeResult.changed) {
      content = citeResult.body;
      console.log("[doctor-tldr] removed [cite] block:", file);
    }

    // 3) frontmatter に tldr を注入（既存 tldr は無視して新しく追記）
    if (tldr) {
      fm = upsertTldrInFrontmatter(fm, tldr);
    }

    const next = `---\n${fm}\n---\n${content}`;
    if (next !== orig) {
      await fs.writeFile(fullPath, next, "utf8");
      updatedCount++;
    }
  }

  console.log(
    `[doctor-tldr] summary: updated=${updatedCount}, updatedTldr=${updatedTldrCount}`,
  );
}

function splitFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { frontmatter: null, body: text };
  return { frontmatter: m[1], body: m[2] || "" };
}

// [tldr] という見出しブロックから TL;DR を作る
function extractTldrFromHeading(body) {
  const lines = body.split("\n");
  let start = -1;

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim().toLowerCase();
    if (t === "[tldr]" || t === "[tl;dr]" || t === "[tl-dr]") {
      start = i;
      break;
    }
  }
  if (start === -1) return null;

  let end = start + 1;
  const bullets = [];
  while (end < lines.length) {
    const raw = lines[end];
    const t = raw.trim();

    if (!t) {
      end++;
      continue;
    }
    // 次のセクション開始っぽい所で止める
    if (/^#{1,6}\s/.test(t)) break;
    if (t.startsWith("[") && t.endsWith("]")) break;
    if (/^\[cite\]/i.test(t)) break;

    const withoutBullet = t.replace(/^\s*[-*+]\s*/, "").trim();
    if (withoutBullet) bullets.push(withoutBullet);

    end++;
  }

  const tldr = bullets.join(" ").replace(/\s+/g, " ").trim();
  const newLines = [...lines.slice(0, start), ...lines.slice(end)];
  return tldr ? { tldr, body: newLines.join("\n") } : null;
}

// > [!summary] TL;DR 系のコールアウトから TL;DR を作る
function extractTldrFromCallout(body) {
  const lines = body.split("\n");
  let start = -1;

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim().toLowerCase();
    if (/^>\s*\[!.*tldr.*\]/.test(t) || /^>\s*\[!summary\]/.test(t)) {
      start = i;
      break;
    }
  }
  if (start === -1) return null;

  let end = start + 1;
  const bullets = [];

  while (end < lines.length) {
    const raw = lines[end];
    const t = raw.trim();

    if (!t.startsWith(">")) break;

    const inner = t.replace(/^>\s*/, "");
    if (!inner || /^\[!/.test(inner)) {
      end++;
      continue;
    }

    const withoutBullet = inner.replace(/^\s*[-*+]\s*/, "").trim();
    if (withoutBullet) bullets.push(withoutBullet);

    end++;
  }

  const tldr = bullets.join(" ").replace(/\s+/g, " ").trim();
  const newLines = [...lines.slice(0, start), ...lines.slice(end)];
  return tldr ? { tldr, body: newLines.join("\n") } : null;
}

// [cite] ブロック（見出し or コールアウト）を削る
function removeCiteBlocks(body) {
  const lines = body.split("\n");
  const out = [];
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const t = raw.trim().toLowerCase();

    // [cite] 見出し
    if (t === "[cite]") {
      changed = true;
      i++;
      // URL や説明っぽい行を空行 or 見出しまで飛ばす
      while (i < lines.length) {
        const tt = lines[i].trim();
        if (!tt) {
          i++;
          break;
        }
        if (/^#{1,6}\s/.test(tt) || tt.startsWith("[") || tt.startsWith(">"))
          break;
        i++;
      }
      i--; // for ループで i++ されるので戻す
      continue;
    }

    // > [!cite] コールアウト
    if (/^>\s*\[!cite.*\]/.test(t)) {
      changed = true;
      i++;
      while (i < lines.length) {
        const tt = lines[i].trim();
        if (!tt.startsWith(">")) break;
        i++;
      }
      i--;
      continue;
    }

    out.push(raw);
  }

  return { body: out.join("\n"), changed };
}

// frontmatter に tldr: >- を雑に追記する（既存 tldr はまとめて捨ててから）
function upsertTldrInFrontmatter(frontmatter, tldr) {
  if (!tldr) return frontmatter;

  const lines = frontmatter.split("\n");

  // 既存 tldr ブロックを雑にスキップ
  const cleaned = [];
  let skipping = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!skipping && /^tldr\s*:/i.test(line.trim())) {
      skipping = true;
      continue;
    }
    if (skipping) {
      // 次の key: っぽい行で終了
      if (/^\s*[A-Za-z0-9_-]+\s*:/.test(line) || !line.trim()) {
        skipping = false;
      } else {
        continue;
      }
    }
    cleaned.push(line);
  }

  const tldrLines = [`tldr: >-`, `  ${tldr.replace(/\n/g, " ").replace(/\s+/g, " ")}`];

  // title/url のすぐ下あたりに差し込む
  let insertIndex = cleaned.length;
  for (let i = 0; i < cleaned.length; i++) {
    const key = cleaned[i].split(":")[0].trim();
    if (["title", "url", "source_url"].includes(key)) {
      insertIndex = i + 1;
    }
  }

  cleaned.splice(insertIndex, 0, ...tldrLines);

  return cleaned.join("\n");
}

main().catch((err) => {
  console.error("[doctor-tldr] ❌ unexpected error:", err);
  process.exit(1);
});
