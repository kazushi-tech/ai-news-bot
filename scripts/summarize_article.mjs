// ai-news-bot/scripts/summarize_article.mjs
// URL -> ai-news/articles/YYYY-MM-DD--host--slug.md を生成するスクリプト
// 依存: gray-matter, node >=18 (fetch), jsdom, @mozilla/readability

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

let Readability = null;
let JSDOM = null;

// ESM 用 __dirname 相当
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------
// .env ローダー（簡易版）
// -----------------------------
function loadEnvFromDotenv() {
  try {
    const rootDir = path.resolve(__dirname, "..");
    const envPath = path.join(rootDir, ".env");
    if (!fs.existsSync(envPath)) return;

    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;

      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
    console.log("[summarize] .env loaded from", envPath);
  } catch (err) {
    console.warn("[summarize] WARN: failed to load .env:", err.message);
  }
}

loadEnvFromDotenv();

// -----------------------------
// CLI 引数パーサ
// -----------------------------
const argv = process.argv.slice(2);

function getArgValue(name, defaultValue = null) {
  const idx = argv.indexOf(`--${name}`);
  if (idx !== -1) {
    const next = argv[idx + 1];
    if (next && !next.startsWith("--")) return next;
    return true;
  }
  const prefix = `--${name}=`;
  const found = argv.find((a) => a.startsWith(prefix));
  if (found) return found.slice(prefix.length);
  return defaultValue;
}

const urlArg = getArgValue("url");
const lang = getArgValue("lang", "ja");
const force = argv.includes("--force") || getArgValue("force") === true;

if (!urlArg || typeof urlArg !== "string") {
  console.error("[summarize] ERROR: --url を指定してください");
  process.exit(1);
}

// -----------------------------
// 環境変数 & パス解決
// -----------------------------
const ROOT =
  process.env.ROOT || path.resolve(process.cwd(), "..", "ai-news");
const ARTICLES_DIR = path.join(ROOT, "articles");

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const EXTRACTOR = process.env.EXTRACTOR || "readability";
const OFFLINE = process.env.AI_NEWS_OFFLINE === "1";

console.log("[summarize] ROOT      =", ROOT);
console.log("[summarize] ARTICLES  =", ARTICLES_DIR);
console.log("[summarize] URL       =", urlArg);
console.log("[summarize] LANG      =", lang);
console.log("[summarize] EXTRACTOR =", EXTRACTOR);
console.log("[summarize] OFFLINE   =", OFFLINE);
console.log("[summarize] FORCE     =", force);

if (!OFFLINE && !GOOGLE_API_KEY) {
  console.error("[summarize] ERROR: GOOGLE_API_KEY が未設定です");
  process.exit(1);
}

// -----------------------------
// Utility: 日付, スラッグ
// -----------------------------
function getTodayDateString() {
  const now = new Date();
  const iso = new Date(
    now.getTime() - now.getTimezoneOffset() * 60 * 1000
  ).toISOString();
  return iso.slice(0, 10);
}

function slugify(input) {
  return (
    input
      .toLowerCase()
      .replace(/https?:\/\//g, "")
      .replace(/[^a-z0-9\-_.\/]/g, "-")
      .replace(/\/+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^[-.]+|[-.]+$/g, "")
      .slice(0, 80) || "article"
  );
}

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// -----------------------------
// HTML 取得 & 本文抽出
// -----------------------------
async function fetchHtml(url) {
  const res = await fetch(url, { method: "GET", redirect: "follow" });
  if (!res.ok) {
    throw new Error(`fetch failed: ${res.status} ${res.statusText}`);
  }
  return await res.text();
}

async function maybeLoadReadability() {
  if (Readability && JSDOM) return;
  try {
    const jsdomMod = await import("jsdom");
    JSDOM = jsdomMod.JSDOM;
  } catch (err) {
    console.warn(
      "[summarize] WARN: jsdom を読み込めませんでした。`npm i jsdom` が必要かもです。",
      err.message
    );
  }
  try {
    const readabilityMod = await import("@mozilla/readability");
    Readability = readabilityMod.Readability;
  } catch (err) {
    console.warn(
      "[summarize] WARN: @mozilla/readability を読み込めませんでした。`npm i @mozilla/readability` が必要かもです。",
      err.message
    );
  }
}

async function extractArticle(urlStr, html) {
  const url = new URL(urlStr);
  const fallbackTitle = url.hostname;
  const fallbackText = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/(p|div|h[1-6]|li|br)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (EXTRACTOR !== "readability") {
    return {
      url,
      host: url.hostname,
      title: fallbackTitle,
      text: fallbackText,
    };
  }

  await maybeLoadReadability();

  if (!Readability || !JSDOM) {
    console.warn(
      "[summarize] readability を利用できないので fallback に切り替えます"
    );
    return {
      url,
      host: url.hostname,
      title: fallbackTitle,
      text: fallbackText,
    };
  }

  try {
    const dom = new JSDOM(html, { url: urlStr });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    const title = (article && article.title) || fallbackTitle;
    const text = (article && article.textContent) || fallbackText;

    return {
      url,
      host: url.hostname,
      title: title.trim(),
      text: text.trim(),
    };
  } catch (err) {
    console.warn(
      "[summarize] readability 解析に失敗したので fallback に切り替えます:",
      err.message
    );
    return {
      url,
      host: url.hostname,
      title: fallbackTitle,
      text: fallbackText,
    };
  }
}

// -----------------------------
// Gemini 呼び出し
// -----------------------------
function extractJsonFromText(raw) {
  if (!raw) return "";
  let s = raw.trim();

  // ```json ～ ``` を剥がす
  if (s.startsWith("```")) {
    const lines = s.split(/\r?\n/);
    if (lines[0].trim().startsWith("```")) lines.shift();
    if (
      lines.length &&
      lines[lines.length - 1].trim().startsWith("```")
    ) {
      lines.pop();
    }
    s = lines.join("\n");
  }

  // 先頭の { と最後の } の間だけを取る
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    s = s.slice(first, last + 1);
  }

  return s.trim();
}

async function callGeminiSummary({ text, url, lang }) {
  if (OFFLINE) {
    console.warn(
      "[summarize] OFFLINE モードのため Gemini 呼び出しをスキップします"
    );
    return buildFallbackSummary(text, url, lang);
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    GEMINI_MODEL
  )}:generateContent?key=${encodeURIComponent(GOOGLE_API_KEY)}`;

  const langLabel = lang === "ja" ? "Japanese" : "English";

  const prompt = `
You are an expert news analyst.

Summarize the following article and respond ONLY in valid JSON with this structure:

{
  "title": "short title in ${langLabel}",
  "tldr": "1-2 sentence TL;DR in ${langLabel}",
  "key_points": ["bullet point 1 in ${langLabel}", "bullet point 2 in ${langLabel}"],
  "overview": "overview section in ${langLabel}",
  "details": "detailed analysis in ${langLabel}",
  "insights": "important implications in ${langLabel}",
  "risks": "risks and unknowns in ${langLabel}"
}

Do NOT include any extra explanation or markdown, ONLY the JSON.

Article URL: ${url}

Article content:
${text.slice(0, 16000)}
`.trim();

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  };

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `Gemini API error: ${res.status} ${res.statusText}: ${errText}`
    );
  }

  const data = await res.json();
  const candidates = data.candidates;
  if (!candidates || !candidates.length) {
    throw new Error("Gemini API returned no candidates");
  }

  const parts = candidates[0].content?.parts || [];
  const rawText = parts.map((p) => p.text || "").join("").trim();
  const jsonText = extractJsonFromText(rawText);

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    console.warn(
      "[summarize] WARN: Gemini からの JSON パースに失敗しました。fallback に切り替えます:",
      err.message
    );
    return buildFallbackSummary(text, url, lang);
  }

  return normalizeSummaryJson(parsed, text, url, lang);
}

function buildFallbackSummary(text, urlStr, lang) {
  const url = new URL(urlStr);
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  const firstLines = lines.slice(0, 3).join(" / ").slice(0, 180);

  const tldr =
    lang === "ja"
      ? firstLines || "記事本文から要約を生成できませんでした。"
      : firstLines || "Failed to generate summary from the article body.";

  const keyPoints = lines.slice(0, 5).map((l) => l.slice(0, 120));

  return {
    title: url.hostname,
    tldr,
    key_points: keyPoints.length ? keyPoints : [tldr],
    overview: "",
    details: "",
    insights: "",
    risks: "",
  };
}

function normalizeSummaryJson(obj, text, urlStr, lang) {
  const fallback = buildFallbackSummary(text, urlStr, lang);

  return {
    title:
      typeof obj.title === "string" && obj.title.trim()
        ? obj.title.trim()
        : fallback.title,
    tldr:
      typeof obj.tldr === "string" && obj.tldr.trim()
        ? obj.tldr.trim()
        : fallback.tldr,
    key_points:
      Array.isArray(obj.key_points) && obj.key_points.length
        ? obj.key_points.map((p) => String(p).trim()).filter(Boolean)
        : fallback.key_points,
    overview: typeof obj.overview === "string" ? obj.overview.trim() : "",
    details: typeof obj.details === "string" ? obj.details.trim() : "",
    insights: typeof obj.insights === "string" ? obj.insights.trim() : "",
    risks: typeof obj.risks === "string" ? obj.risks.trim() : "",
  };
}

// -----------------------------
// Markdown 生成
// -----------------------------
function buildMarkdown({ meta, sections }) {
  const bodyLines = [];

  bodyLines.push(`# ${meta.title}`);
  bodyLines.push("");

  bodyLines.push("## TL;DR");
  bodyLines.push("");
  if (meta.tldr) {
    bodyLines.push(`- ${meta.tldr}`);
  } else {
    bodyLines.push("- (TL;DR なし)");
  }
  bodyLines.push("");

  bodyLines.push("## 概要");
  bodyLines.push("");
  bodyLines.push(sections.overview || "(概要なし)");
  bodyLines.push("");

  bodyLines.push("## 詳細レポート");
  bodyLines.push("");
  bodyLines.push(sections.details || "(詳細レポートなし)");
  bodyLines.push("");

  bodyLines.push("## 重要な示唆");
  bodyLines.push("");
  bodyLines.push(sections.insights || "(重要な示唆なし)");
  bodyLines.push("");

  bodyLines.push("## リスク・未確定要素");
  bodyLines.push("");
  bodyLines.push(sections.risks || "(リスク・未確定要素なし)");
  bodyLines.push("");

  bodyLines.push("## 引用・ソース");
  bodyLines.push("");
  if (meta.source_url) {
    bodyLines.push(`- [元記事](${meta.source_url})`);
  } else {
    bodyLines.push("- (元記事 URL 不明)");
  }
  bodyLines.push("");

  const data = {
    title: meta.title,
    date: meta.date,
    model: meta.model,
    source_url: meta.source_url,
    host: meta.host,
    tldr: meta.tldr,
    key_points: meta.key_points,
    kind: "summary",
  };

  const body = bodyLines.join("\n").trim() + "\n";
  return matter.stringify(body, data);
}

// -----------------------------
// メイン処理
// -----------------------------
async function main() {
  try {
    ensureDirSync(ARTICLES_DIR);

    const targetUrl = new URL(urlArg);
    const dateStr = getTodayDateString();
    const host = targetUrl.hostname;
    const slug = slugify(targetUrl.pathname || targetUrl.hostname);

    const filename = `${dateStr}--${host}--${slug}.md`;
    const outPath = path.join(ARTICLES_DIR, filename);

    console.log("[summarize] filename =", filename);
    console.log("[summarize] outPath  =", outPath);

    if (fs.existsSync(outPath) && !force) {
      console.log(
        "[summarize] 既にファイルが存在するためスキップします (--force で上書き可能):",
        outPath
      );
      return;
    }

    console.log("[summarize] HTML を取得中...");
    const html = await fetchHtml(targetUrl.toString());

    console.log("[summarize] 本文を抽出中...");
    const article = await extractArticle(targetUrl.toString(), html);

    if (!article.text || article.text.length < 50) {
      console.warn(
        "[summarize] WARN: 抽出本文が短すぎます。Gemini にはそのまま投げますが、要約品質は低いかもしれません。"
      );
    }

    console.log("[summarize] Gemini に要約を依頼中...");
    const summary = await callGeminiSummary({
      text: article.text,
      url: targetUrl.toString(),
      lang,
    });

    const meta = {
      title: summary.title || article.title || targetUrl.toString(),
      date: dateStr,
      model: GEMINI_MODEL,
      source_url: targetUrl.toString(),
      host: article.host,
      tldr: summary.tldr,
      key_points: summary.key_points,
    };

    const sections = {
      overview: summary.overview,
      details: summary.details,
      insights: summary.insights,
      risks: summary.risks,
    };

    const markdown = buildMarkdown({ meta, sections });

    fs.writeFileSync(outPath, markdown, "utf8");

    console.log("[summarize] 書き込み完了:", outPath);
  } catch (err) {
    console.error("[summarize] FATAL:", err);
    process.exit(1);
  }
}

main();