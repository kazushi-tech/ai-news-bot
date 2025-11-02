#!/usr/bin/env node
/**
 * summarize.mjs (rich)
 * Node 20 (ESM)
 *
 * 入力:
 *   --url or --seed-file (どちらか必須)
 *   --style general|casual|formal
 *   --lang  ja|en
 *   --model (指定があっても gemini-2.5-flash に固定)
 *   --docs-path, --publish-to-docs
 *
 * 出力:
 *   summary/<RUN_ID>-<host>/summary.md
 *   summary/<RUN_ID>-<host>/<host>.html
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { fetch } from "undici";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_ROOT = path.resolve(process.cwd(), "summary");
const DEFAULT_MODEL = "gemini-2.5-flash";

/* ---------------- args/env ---------------- */
function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
      out[key] = val;
    }
  }
  return out;
}
const args = parseArgs(process.argv);

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
if (!API_KEY) {
  console.error("Missing GEMINI_API_KEY/GOOGLE_API_KEY");
  process.exit(1);
}

const RUN_ID = process.env.GITHUB_RUN_ID || `${Date.now()}`;
const LANG = (args.lang || "ja").toLowerCase();
const STYLE = (args.style || "general").toLowerCase();
const REQUESTED_MODEL = args.model || DEFAULT_MODEL;
const MODEL = DEFAULT_MODEL; // 強制固定
if (REQUESTED_MODEL !== MODEL) {
  console.warn(`[warn] model is forced to ${MODEL} (requested: ${REQUESTED_MODEL})`);
}

/* ---------------- utils ---------------- */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const firstOf = (v) => (Array.isArray(v) ? v[0] : v);
const parseJsonSafe = (t) => { try { return JSON.parse(t); } catch { return null; } };
const toSlug = (s, fallback = "article") =>
  (s && typeof s === "string"
    ? s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 80)
    : "") || fallback;

async function ensureDir(p) { await fs.mkdir(p, { recursive: true }); }

async function fetchHtml(url) {
  const r = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; ai-news-bot/1.0; +https://github.com/)",
      accept: "text/html,application/xhtml+xml",
    },
  });
  if (!r.ok) throw new Error(`Fetch failed ${r.status}`);
  return await r.text();
}

function extractFromJsonLd(doc) {
  const scripts = [...doc.querySelectorAll('script[type="application/ld+json"]')];
  for (const s of scripts) {
    const json = parseJsonSafe(s.textContent.trim());
    if (!json) continue;
    const list = Array.isArray(json) ? json : [json];
    for (const c of list) {
      const type = (firstOf(c["@type"]) || "").toString().toLowerCase();
      if (["article", "newsarticle", "blogposting"].includes(type)) {
        const title = c.headline || c.name || doc.title || "";
        const body = typeof c.articleBody === "string" ? c.articleBody : "";
        if (body && body.trim().length > 30) {
          return { title, text: body };
        }
      }
    }
  }
  return null;
}

function extractReadable(html, baseUrl) {
  const dom = new JSDOM(html, { url: baseUrl });
  const reader = new Readability(dom.window.document);
  const parsed = reader.parse();
  if (!parsed) return null;
  return {
    title: parsed.title || dom.window.document.title || "",
    text: parsed.textContent || "",
    contentHTML: parsed.content || ""
  };
}

/* ---------------- summarizer ---------------- */
async function summarizeWithGemini(text, { lang, style, model, apiKey, sourceUrl, host }) {
  const chunk = text.length > 12000 ? text.slice(0, 12000) : text;

  const sys_ja =
`あなたはAI/テックニュースの編集者です。読者は技術に明るい日本語話者。事実に忠実に、見出し構造と要点を明確にまとめます。`;

  const instr_ja =
`以下の本文を元に、**深めの解説つき要約**をMarkdownで作成してください（目安 600–1200語）。事実にない推測はしないでください。

# 出力仕様
## 概要 (TL;DR)
- 2〜3文で最重要ポイントを要約（誰が/何を/なぜ重要か）

## 重要ポイント
- 5〜8個の箇条書き。数値・固有名詞・影響を優先。

## 詳細レポート
### はじめに：何が起こったのか？
- 3〜6文で背景と出来事を簡潔に。
### 背景
- 関連の経緯・市場/技術の文脈を説明。
### なぜ重要か（影響）
- 製品・ビジネス・規制/政策・投資の観点で箇条書き。
### 関係者・企業の動き
- 主要プレイヤーの発言/施策を列挙。

### データ・数値
| 指標 | 値 | 注記 |
|---|---|---|
| 代表的な数値 | 具体値 | 本文から根拠を簡潔に |

## 引用（Notable quotes）
> 本文から重要な1〜3文をそのまま引用し、話者/肩書きを添える。なければ省略。

## リスクと課題
- 3〜5点

## 今後の見通し / アクション
- 実務での示唆・次アクションを箇条書き（確度高い範囲で）。

## 出典
- ${host}（本文出典）
`;

  const sys_en =
`You are an editor for AI/tech news. Audience is technically literate. Write a rich, structured brief faithful to the source.`;

  const instr_en =
`Summarize with **deep context** in Markdown (600–1200 words). Avoid speculation.

# Output
## TL;DR
- 2–3 sentences capturing who/what/why-it-matters.

## Key Points
- 5–8 bullets emphasizing numbers, proper nouns, impact.

## Deep Dive
### What happened
### Background
### Why it matters (impact)
### Stakeholders & moves
### Data & Metrics
| Metric | Value | Note |
|---|---|---|

## Notable quotes
> 1–3 quotes with speaker, if present.

## Risks & challenges
## Outlook / Actions
## Source
- ${host}
`;

  const prompt = (lang === "ja")
    ? `${sys_ja}\n\n${instr_ja}\n\n---\n[Source URL] ${sourceUrl}\n\n[ARTICLE]\n${chunk}`
    : `${sys_en}\n\n${instr_en}\n\n---\n[Source URL] ${sourceUrl}\n\n[ARTICLE]\n${chunk}`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
  });
  if (!resp.ok) throw new Error(`Gemini API ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  const txt = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  if (!txt.trim()) throw new Error("Gemini returned empty text");
  return txt.trim();
}

function buildFrontmatter({ title, sourceUrl, dateISO, model }) {
  return [
    "---",
    `title: "${(title || "").replace(/"/g, '\\"')}"`,
    `source_url: "${sourceUrl}"`,
    `date: ${dateISO.slice(0, 10)}`,
    `tags: [ai-news, gemini]`,
    `model: ${model}`,
    "---",
    "",
  ].join("\n");
}

/* ---------------- core ---------------- */
async function processOne(targetUrl) {
  const u = new URL(targetUrl);
  const host = u.hostname;
  console.log(`==> Fetching: ${targetUrl}`);

  const html = await fetchHtml(targetUrl);
  const dom = new JSDOM(html, { url: targetUrl });
  const doc = dom.window.document;

  let extracted = extractFromJsonLd(doc);
  let contentHTML = "";
  if (!extracted) {
    const rd = extractReadable(html, targetUrl);
    if (rd) {
      extracted = { title: rd.title, text: rd.text };
      contentHTML = rd.contentHTML || "";
    }
  }

  // ---- フォールバック：抽出失敗でもURLだけ保存
  if (!extracted || !extracted.text || extracted.text.trim().length < 80) {
    const dateISO = new Date().toISOString();
    const title = (extracted?.title || host || "article").toString();
    const outDir = path.join(OUT_ROOT, `${RUN_ID}-${host}`);
    await ensureDir(outDir);
    const fm = buildFrontmatter({ title, sourceUrl: targetUrl, dateISO, model: MODEL });
    const body = [
      "> [!warning] 抽出失敗",
      "本文抽出に失敗しました。共有リンクや別ソースで再実行してください。",
      "",
      "## Source URL",
      targetUrl
    ].join("\n");
    await fs.writeFile(path.join(outDir, "summary.md"), fm + body + "\n", "utf8");
    await fs.writeFile(path.join(outDir, `${host}.html`), html, "utf8");
    console.warn("extract failed: wrote stub markdown");
    return;
  }

  const dateISO = new Date().toISOString();
  const title = extracted.title || host;

  const summaryMd = await summarizeWithGemini(extracted.text, {
    lang: LANG,
    style: STYLE,
    model: MODEL,
    apiKey: API_KEY,
    sourceUrl: targetUrl,
    host
  });

  const outDir = path.join(OUT_ROOT, `${RUN_ID}-${host}`);
  await ensureDir(outDir);

  // ✅ ここが修正ポイント：オブジェクト渡し + テンプレ文字列
  const fm = buildFrontmatter({ title, sourceUrl: targetUrl, dateISO, model: MODEL });
  const appendix = `

## Source URL
${targetUrl}
`;

  await fs.writeFile(path.join(outDir, "summary.md"), fm + summaryMd + appendix, "utf8");

  // 参考HTMLも保存（Obsidianで原文確認したい時に便利）
  if (contentHTML) {
    const htmlOut = `<!doctype html><meta charset="utf-8"><title>${title}</title><article>${contentHTML}</article>`;
    await fs.writeFile(path.join(outDir, `${host}.html`), htmlOut, "utf8");
  } else {
    await fs.writeFile(path.join(outDir, `${host}.html`), html, "utf8");
  }

  console.log(`✔ Wrote: summary/${RUN_ID}-${host}/summary.md`);
}

async function processSeedFile(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) throw new Error("seed_fileが空です");
  for (const line of lines) {
    try {
      await processOne(line);
      await sleep(500);
    } catch (e) {
      console.error(`seed_item failed: ${line} :: ${e.message}`);
    }
  }
}

(async () => {
  const url = (args.url || "").trim();
  const seed = (args.seedFile || "").trim();

  if (!url && !seed) {
    console.error("input_policy違反: --url or --seed-file 必須");
    process.exit(1);
  }

  await ensureDir(OUT_ROOT);

  try {
    if (url) await processOne(url);
    if (seed) await processSeedFile(seed);
    console.log(`publish_to_docs: ${String(args.publishToDocs || "false")}`);
  } catch (e) {
    console.error("ERROR:", e.stack || e.message);
    process.exit(1);
  }
})();
