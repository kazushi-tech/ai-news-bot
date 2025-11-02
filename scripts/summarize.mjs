#!/usr/bin/env node
/**
 * summarize.mjs
 * Node 20 (ESM)
 * 入力: --url または --seed-file（改行区切りURLリスト）, --style, --lang, --model（無視して強制固定）
 * 出力: summary/<RUN_ID>-<host>/summary.md, <host>.html, 規約名の md(YYYY-MM-DD--host--slug.md)
 * 本文抽出: JSON-LD(Article/NewsArticle/BlogPosting).articleBody 優先 + Readability 併用
 * 要約: Google AI Studio (Gemini) REST / models: gemini-2.5-flash（強制固定）
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { fetch } from "undici";

/* ---------------- constants ---------------- */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FORCED_MODEL = "gemini-2.5-flash";
const MAX_ARTICLE_CHARS = 30000; // 要約前に切り詰める上限
const SHORT_BODY_THRESHOLD = 120; // これ未満は抽出失敗扱い
const USER_AGENT =
  "Mozilla/5.0 (compatible; ai-news-bot/1.0; +https://github.com/kazushi-tech/ai-news-bot)";

/* ---------------- tiny utils ---------------- */

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
      out[key] = val;
    }
  }
  return out;
}

function firstOf(val) {
  return Array.isArray(val) ? val[0] : val;
}

function slugify(s) {
  return (s || "untitled")
    .toLowerCase()
    .replace(/[^a-z0-9\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function todayParts(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return { yyyy, mm, dd };
}

function ensureLf(str) {
  return (str || "").replace(/\r\n?/g, "\n");
}

function trimLen(s, max) {
  if (!s) return "";
  if (s.length <= max) return s;
  return s.slice(0, max) + "\n...[truncated]...";
}

function pickApiKey() {
  // Workflow 側で GEMINI_API_KEY を GOOGLE_API_KEY にもエイリアスしている前提
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
}

function toPlainTextFromHtml(html) {
  const dom = new JSDOM(html);
  const text = dom.window.document.body.textContent || "";
  return ensureLf(text).replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

/* ---------------- fetch + extract ---------------- */

async function fetchHtml(url, retry = 2) {
  for (let i = 0; i <= retry; i++) {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      return html;
    } catch (e) {
      if (i === retry) throw e;
      await delay(1000 * (i + 1));
    }
  }
}

/** JSON-LDから articleBody / headline を抽出 */
function extractFromJsonLd(doc) {
  const scripts = [...doc.querySelectorAll('script[type="application/ld+json"]')];
  for (const s of scripts) {
    const raw = s.textContent?.trim();
    if (!raw) continue;
    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      continue;
    }
    const arr = Array.isArray(json) ? json : [json];
    for (const c of arr) {
      const type = (firstOf(c["@type"]) || "").toString().toLowerCase();
      if (["article", "newsarticle", "blogposting"].includes(type)) {
        const title = firstOf(c.headline) || c.name || "";
        const body = typeof c.articleBody === "string" ? c.articleBody : "";
        if (body && body.trim().length >= SHORT_BODY_THRESHOLD) {
          return { title, articleBody: body };
        }
      }
    }
  }
  return null;
}

/** Readability で本文HTMLを抽出し、プレーンテキスト化 */
function extractWithReadability(html) {
  const dom = new JSDOM(html, { url: "https://example.com/" });
  const reader = new Readability(dom.window.document);
  const result = reader.parse();
  if (!result) return null;
  const title = result.title || "";
  const plain = toPlainTextFromHtml(result.content || "");
  if (plain.trim().length < SHORT_BODY_THRESHOLD) return null;
  return { title, articleBody: plain, readableHtml: result.content || "" };
}

/* ---------------- LLM (Gemini) ---------------- */

async function callGemini({ apiKey, model, prompt }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, topP: 0.9, topK: 40 },
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini HTTP ${res.status}: ${text}`);
  }

  const json = await res.json();
  const candidates = json.candidates || [];
  const parts = candidates[0]?.content?.parts || [];
  const text = parts.map((p) => p.text || "").join("");
  return text || "";
}

/* ---------------- markdown template builder ---------------- */

function buildPromptJa({ title, url, articleText }) {
  return [
    "あなたは一流のテックニュース編集者です。以下の記事本文を読み、指定のテンプレで日本語要約してください。",
    "",
    "出力はMarkdown。各セクション見出しはそのまま使い、簡潔かつ具体的に。表が必要そうならMarkdownのTABLEで。",
    "",
    "## 概要 (TL;DR)",
    "## 重要ポイント",
    "## 詳細レポート（What happened/背景/影響/関係者/データ表）",
    "## 引用（Notable quotes）",
    "## リスクと課題",
    "## 今後の見通し/アクション",
    "## Source URL（必須）",
    url,
    "",
    `タイトル: ${title || ""}`,
    `URL: ${url}`,
    "",
    "【本文】",
    articleText,
  ].join("\n");
}

function buildFrontmatter({ title, url, model, host, dateY, dateM, dateD }) {
  const safeTitle = (title || "").replace(/"/g, '\\"');
  const dateStr = `${dateY}-${dateM}-${dateD}`;
  return [
    "---",
    `title: "${safeTitle}"`,
    `source_url: "${url}"`,
    `date: "${dateStr}"`,
    `model: "${model}"`,
    `host: "${host}"`,
    "tags: [ai-news]",
    "---",
    "",
  ].join("\n");
}

/* ---------------- core per-URL pipeline ---------------- */

async function processOneUrl(targetUrl, runId, outRootDir) {
  const { yyyy, mm, dd } = todayParts();
  let title = "";
  let articleText = "";
  let readableHtml = "";

  // URL 正規化と host/slug
  let u;
  try {
    u = new URL(targetUrl);
  } catch (e) {
    throw new Error(`Invalid URL: ${targetUrl}`);
  }
  const host = u.host.toLowerCase();

  // 取得
  let html = "";
  try {
    html = await fetchHtml(targetUrl);
  } catch (e) {
    console.warn(`[warn] fetch failed: ${e.message}`);
  }

  if (html) {
    // JSON-LD 優先
    try {
      const doc = new JSDOM(html).window.document;
      const jl = extractFromJsonLd(doc);
      if (jl) {
        title = jl.title || title;
        articleText = ensureLf(jl.articleBody || "").trim();
      }
    } catch (e) {
      console.warn(`[warn] JSON-LD parse failed: ${e.message}`);
    }

    // Readability 併用（不足時のみ）
    if (!articleText || articleText.length < SHORT_BODY_THRESHOLD) {
      const r = extractWithReadability(html);
      if (r) {
        if (!title) title = r.title || title;
        if (!articleText || articleText.length < SHORT_BODY_THRESHOLD) {
          articleText = r.articleBody || "";
        }
        readableHtml = r.readableHtml || "";
      }
    }
  }

  // 出力先dir: summary/<RUN_ID>-<host>/
  const outDir = path.join(outRootDir, `${runId}-${host}`);
  await fs.mkdir(outDir, { recursive: true });

  // 抽出できないときはスタブ保存
  if (!articleText || articleText.trim().length < SHORT_BODY_THRESHOLD) {
    const fileSlug = slugify(u.pathname.split("/").filter(Boolean).slice(-1)[0] || title);
    const newsName = `${yyyy}-${mm}-${dd}--${host}--${fileSlug}.md`;
    const fm = buildFrontmatter({
      title,
      url: targetUrl,
      model: FORCED_MODEL,
      host,
      dateY: yyyy,
      dateM: mm,
      dateD: dd,
    });
    const stub =
      fm +
      "> 本文抽出に失敗。後で別ソースURLで再実行するか、Webクリッパーで `clips/` に保存して手動整形してください。\n\n" +
      "---\n" +
      `Source URL: ${targetUrl}\n`;
    await fs.writeFile(path.join(outDir, "summary.md"), ensureLf(stub), "utf8");
    await fs.writeFile(path.join(outDir, newsName), ensureLf(stub), "utf8"); // 規約名でも保存

    // html も保存（取得できていたら）
    if (html) {
      await fs.writeFile(path.join(outDir, `${host}.html`), ensureLf(html), "utf8");
    }
    console.log(`[info] saved stub -> ${path.join(outDir, "summary.md")}`);
    return;
  }

  // LLM 要約
  const apiKey = pickApiKey();
  if (!apiKey) {
    const fm = buildFrontmatter({
      title,
      url: targetUrl,
      model: FORCED_MODEL,
      host,
      dateY: yyyy,
      dateM: mm,
      dateD: dd,
    });
    const body =
      fm +
      "> 要約失敗: GEMINI_API_KEY / GOOGLE_API_KEY が見つかりません。\n\n" +
      "---\n" +
      `Source URL: ${targetUrl}\n`;
    await fs.writeFile(path.join(outDir, "summary.md"), ensureLf(body), "utf8");
    await fs.writeFile(
      path.join(outDir, `${yyyy}-${mm}-${dd}--${host}--${slugify(title || "untitled")}.md`),
      ensureLf(body),
      "utf8"
    );
    if (html) await fs.writeFile(path.join(outDir, `${host}.html`), ensureLf(html), "utf8");
    console.log("[warn] API key missing. Wrote stub.");
    return;
  }

  // モデル強制固定
  const model = FORCED_MODEL;

  const prompt = buildPromptJa({
    title,
    url: targetUrl,
    articleText: trimLen(ensureLf(articleText), MAX_ARTICLE_CHARS),
  });

  let summaryMd = "";
  try {
    summaryMd = await callGemini({ apiKey, model, prompt });
  } catch (e) {
    console.warn(`[warn] Gemini error: ${e.message}`);
    summaryMd = ""; // 失敗時は後でスタブ化
  }

  const fileSlug = slugify(title || u.pathname.split("/").filter(Boolean).slice(-1)[0]);
  const newsName = `${yyyy}-${mm}-${dd}--${host}--${fileSlug}.md`;

  const fm = buildFrontmatter({
    title,
    url: targetUrl,
    model,
    host,
    dateY: yyyy,
    dateM: mm,
    dateD: dd,
  });

    let finalMd;
  if (!summaryMd || summaryMd.trim().length < 30) {
    finalMd =
      fm +
      "> 要約生成に失敗しました。後で再実行してください。\n\n" +
      "---\n" +
      `Source URL: ${targetUrl}\n`;
  } else {
    const body = ensureLf(summaryMd).trim();
    const withSrc =
      body.endsWith(targetUrl)
        ? body
        : body + "\n\n---\n## Source URL（必須）\n" + targetUrl + "\n";
    finalMd = fm + withSrc + "\n";
  }

    // 保存（artifact と 規約名の両方）
  await fs.writeFile(path.join(outDir, "summary.md"), finalMd, "utf8");
  await fs.writeFile(path.join(outDir, newsName), finalMd, "utf8"); // ← finaMd/newName 禁止。finalMd/newsNameで統一

  // 参考HTMLも保存（readability抽出HTMLがあればそれ、なければ元HTML）
  if (readableHtml) {
    await fs.writeFile(path.join(outDir, `${host}.html`), ensureLf(readableHtml), "utf8");
  } else if (html) {
    await fs.writeFile(path.join(outDir, `${host}.html`), ensureLf(html), "utf8");
  }

  console.log(`[ok] ${targetUrl} -> ${path.join(outDir, newsName)} (artifact: summary.md)`);
} // ← ここで processOneUrl を閉じる（必ずこのカッコを入れる）
