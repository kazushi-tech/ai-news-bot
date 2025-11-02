#!/usr/bin/env node
/**
 * summarize_clip.mjs
 * Node 20+ (ESM)
 * 使い方:
 *   node scripts/summarize_clip.mjs "src/clips/2025-11-02--foo.md"
 * 前提:
 *   export GOOGLE_API_KEY="..."   # Google AI Studio
 */

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { fetch } from "undici";

/* ---------------- env ---------------- */
const API_KEY = process.env.GOOGLE_API_KEY || "";
if (!API_KEY) {
  console.error("ERROR: GOOGLE_API_KEY が未設定です。`export GOOGLE_API_KEY=...`");
  process.exit(1);
}
const MODEL = "gemini-2.5-flash";

/* ---------------- args ---------------- */
const inPath = process.argv[2];
if (!inPath || !inPath.endsWith(".md")) {
  console.error('Usage: node scripts/summarize_clip.mjs "<path/to/clip.md>"');
  process.exit(1);
}

/* ---------------- helpers ---------------- */
function slugify(s, fallback = "article") {
  if (!s) return fallback;
  return s
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || fallback;
}
async function ensureDir(d) { await fs.mkdir(d, { recursive: true }); }

async function callGemini(text, { lang = "ja", style = "general" } = {}) {
  const sys = `あなたはニュース要約アシスタントです。出力はMarkdown。冗長表現は避け、数字・固有名詞は正確に。`;
  const instr = `以下の本文を${lang === "ja" ? "日本語" : "英語"}で${style === "formal" ? "ややフォーマルに" : style === "casual" ? "ややカジュアルに" : "中立的に"}短く要約してください。
出力テンプレ:
# TL;DR
- 3〜5行

## Key Points
- 箇条書き5〜8個（重要度順）

## Details
本文の構造を保ちながら簡潔に。

----- 本文ここから -----
${text}
----- 本文ここまで -----
`;

  const body = {
    contents: [
      { role: "user", parts: [{ text: sys }] },
      { role: "user", parts: [{ text: instr }] },
    ],
    generationConfig: { temperature: 0.2, topP: 0.9, maxOutputTokens: 2048 },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
  );

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Gemini API ${res.status}: ${t.slice(0, 500)}`);
  }
  const json = await res.json();
  const out =
    json.candidates?.[0]?.content?.parts?.map((p) => p.text).join("")?.trim() || "";
  if (!out) throw new Error("Gemini応答が空でした");
  return out;
}

/* ---------------- main ---------------- */
const raw = await fs.readFile(inPath, "utf8");
const parsed = matter(raw);
const fm = parsed.data || {};
const body = parsed.content || "";

const title = (fm.title || "Untitled").toString().trim();
const date = (fm.date || new Date().toISOString().slice(0, 10)).toString();
const sourceUrl = (fm.source_url || "").toString();
const host = (fm.host || (sourceUrl ? new URL(sourceUrl).host.replace(/^www\./, "") : "unknown")).toString();

const titleSlug = slugify(title);
const outDir = "summary";
await ensureDir(outDir);
const outPath = path.join(outDir, `${date}--${host}--${titleSlug}.md`);

/* 既存ならスキップ */
try {
  await fs.access(outPath);
  console.log("⏩ skip (already exists):", outPath);
  process.exit(0);
} catch { /* not exists */ }

/* 要約（2回までリトライ） */
let summary = "";
for (let attempt = 1; attempt <= 2; attempt++) {
  try {
    summary = await callGemini(body, { lang: "ja", style: "general" });
    break;
  } catch (e) {
    if (attempt === 2) { console.error(e.message || e); process.exit(1); }
    await new Promise(r => setTimeout(r, 2000 * attempt));
  }
}

/* frontmatter + write */
const front =
  `---\n` +
  `title: "${title.replace(/"/g, '\\"')}"\n` +
  `date: "${date}"\n` +
  `model: "${MODEL}"\n` +
  `lang: "ja"\n` +                  // ← 追加（日本語フラグ）
  `source_url: "${sourceUrl}"\n` +
  `host: "${host}"\n` +
  `---\n\n`;


await fs.writeFile(outPath, front + summary.trim() + "\n", "utf8");
console.log("✔ summarized →", outPath);
