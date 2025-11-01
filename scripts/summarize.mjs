// scripts/summarize.mjs (v2)
// - URL取得（単発 or seed-file）→ HTML取得（リトライ/タイムアウト）
// - JSON-LD(Article)優先 + Readability で本文抽出
// - Gemini 要約（Google AI Studio / generateContent）
// - Obsidian向け frontmatter 付きMarkdown + HTMLを artifact 出力
// - 出力: summary/<RUN_ID>-<host>/summary.md, <host>.html

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------- CLI args ----------
const argv = process.argv.slice(2);
const getFlag = (name, short) => {
  const i = argv.findIndex((a) => a === `--${name}` || (short && a === `-${short}`));
  return i >= 0 ? argv[i + 1] : null;
};

const urlArg = getFlag("url", "u") ?? argv.find((a) => /^https?:\/\//.test(a));
const seedFile = getFlag("seed-file") || null;
if (!urlArg && !seedFile) {
  console.error("Usage: node scripts/summarize.mjs --url <URL> | --seed-file <path> [--outdir <dir>] [--style s] [--lang ja|en] [--max-bullets n] [--timeout ms] [--retries n] [--temperature t]");
  process.exit(1);
}

const outDir = getFlag("outdir", "o") || "summary";
const timeoutMs = Number(getFlag("timeout")) || 20000;
const maxRetries = Number(getFlag("retries")) || 2;
const style = (getFlag("style") || "general").toLowerCase();
const lang = (getFlag("lang") || "ja").toLowerCase();
const maxBullets = Math.max(1, Number(getFlag("max-bullets") || 5));
const temperature = Number(getFlag("temperature")) || 0.2;

const SUPPORTED_STYLES = new Set(["general", "tech", "research", "policy"]);
if (!SUPPORTED_STYLES.has(style)) {
  console.warn(`[warn] unknown style: ${style}; fallback to 'general'`);
}

// ---------- helpers ----------
const escHtml = (s) => s.replace(/[&<>\"']/g, (m) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}[m]));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(u, opt = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(u, {
        ...opt,
        redirect: "follow",
        signal: ctrl.signal,
        headers: {
          "user-agent": "ai-news-bot/1.1 (+github actions)",
          "accept-language": lang === "ja" ? "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7" : "en-US,en;q=0.9,ja;q=0.7",
          ...(opt.headers || {}),
        },
      });
      clearTimeout(id);
      if (res.status >= 500) throw new Error(`Server error ${res.status}`);
      return res;
    } catch (e) {
      clearTimeout(id);
      lastErr = e;
      if (attempt < maxRetries) await sleep(500 * (attempt + 1));
    }
  }
  throw lastErr;
}

function chunkBySentence(s, maxChars = 12000) {
  const chunks = [];
  let buf = "";
  for (const part of s.split(/(?<=[。．.!?]\s)/)) {
    if ((buf + part).length > maxChars) {
      if (buf) chunks.push(buf);
      buf = part;
    } else {
      buf += part;
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}

function stripHtml(s) {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function safeParseJson(txt) {
  try {
    return JSON.parse(txt);
  } catch {
    try {
      const fixed = txt.replace(/,(\s*[\]\}])/g, "$1");
      return JSON.parse(fixed);
    } catch {
      return null;
    }
  }
}

function pick(doc, sel, attr) {
  const el = doc.querySelector(sel);
  return el ? (attr ? el.getAttribute(attr) : el.textContent) : "";
}

function meta(doc, name) {
  return pick(doc, `meta[name="${name}"]`, "content") || pick(doc, `meta[property="${name}"]`, "content");
}

function extractJsonLdArticle(doc) {
  const nodes = [...doc.querySelectorAll('script[type="application/ld+json"]')];
  const blobs = [];
  for (const n of nodes) {
    const t = n.textContent?.trim();
    if (!t) continue;
    const j = safeParseJson(t);
    if (!j) continue;
    if (Array.isArray(j)) blobs.push(...j);
    else blobs.push(j);
  }
  const flat = [];
  const flatten = (o) => {
    if (!o || typeof o !== "object") return;
    if (Array.isArray(o)) { for (const x of o) flatten(x); return; }
    flat.push(o);
    for (const k of Object.keys(o)) flatten(o[k]);
  };
  for (const b of blobs) flatten(b);

  const isArticle = (x) => {
    const t = (x["@type"] || x.type || "");
    if (Array.isArray(t)) return t.some((v) => /Article|NewsArticle|BlogPosting/i.test(String(v)));
    return /Article|NewsArticle|BlogPosting/i.test(String(t));
  };

  const cand = flat.filter(isArticle);
  if (!cand.length) return null;
  cand.sort((a, b) => Number(Boolean(b.articleBody || b.text)) - Number(Boolean(a.articleBody || a.text)));
  const top = cand[0];
  const body = String(top.articleBody || top.text || "").trim();
  return {
    headline: String(top.headline || "").trim(),
    articleBody: body,
    datePublished: String(top.datePublished || top.dateCreated || "").trim(),
    author: (() => {
      const a = top.author;
      if (typeof a === "string") return a;
      if (Array.isArray(a)) return a.map((x) => x?.name || x).filter(Boolean).join(", ");
      return a?.name || "";
    })(),
  };
}

async function summarizeGemini(text, ctx) {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const styleHint = {
    general: "ニュース編集者として、事実を簡潔に。固有名詞/日付/数値は正確に。誇張や推測はしない。",
    tech: "技術要素・アーキテクチャ・実装・ライセンス・制約・公開リポジトリの有無を優先。数値・バージョンを明記。",
    research: "研究目的・手法・データセット・結果・限界・再現性・今後の課題を優先。統計値/有意性があれば保持。",
    policy: "制度・規制の対象/適用範囲・発効日・所管・罰則・影響領域・関係国/地域を優先。",
  }[SUPPORTED_STYLES.has(ctx.style) ? ctx.style : "general"];

  const instructions = (ctx.lang === "ja")
    ? `出力言語: 日本語\n\n- 一行見出し（最大70文字）を先頭に書き、その後に最大${ctx.maxBullets}点の箇条書き。\n- 箇条書きは短く、数値・日付・人/組織名は残す。\n- 引用・出典羅列は不要。`
    : `Output language: English\n\n- Start with a one-line headline (max 110 chars), then up to ${ctx.maxBullets} bullets.\n- Be concise; keep key numbers/dates/names. No quotes or source lists.`;

  const promptHeader = `${styleHint}\n\n${instructions}\n\n---\n`;

  const genOnce = async (t) => {
    const payload = {
      contents: [{ role: "user", parts: [{ text: `${promptHeader}${t}` }] }],
      generationConfig: { temperature: ctx.temperature ?? 0.2 },
    };
    const r = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error(`Gemini API ${r.status} ${await r.text()}`);
    const j = await r.json();
    return (j.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("").trim();
  };

  const chunks = chunkBySentence(text);
  const partials = [];
  for (const c of chunks) partials.push(await genOnce(c));
  const merged = `これらの要約を統合し、重複を除いて最重要点のみを残して再要約（${ctx.maxBullets}点以内）：\n${partials.join("\n")}`;
  return await genOnce(merged);
}

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function toOutBase(forUrl, baseOutDir) {
  const host = (new URL(forUrl).host || "result").replace(/[^a-z0-9]+/gi, "-");
  const runPrefix = process.env.GITHUB_RUN_ID || `${Date.now()}`;
  return path.join(baseOutDir, `${runPrefix}-${host}`);
}

function detectLang(doc) {
  return (doc.documentElement.getAttribute("lang") || meta(doc, "og:locale") || "").toLowerCase() || "";
}

async function processOne(url) {
  let canonicalUrl = url;
  try { new URL(url); } catch { throw new Error(`Invalid URL: ${url}`); }

  const outBase = toOutBase(url, outDir);
  ensureDir(outBase);
  const mdPath = path.join(outBase, "summary.md");
  const htmlPath = path.join(outBase, `${(new URL(url).host).replace(/[^a-z0-9]+/gi, "-")}.html`);

  try {
    const res = await fetchWithRetry(url);
    const ctype = res.headers.get("content-type") || "";
    if (!ctype.includes("text/html")) {
      const msg = `Skip: content-type ${ctype}`;
      fs.writeFileSync(mdPath, `---\nurl: ${url}\nskip_reason: "${msg}"\n---\n`);
      fs.writeFileSync(htmlPath, `<!doctype html><meta charset="utf-8"><pre>${escHtml(msg)}</pre>`);
      console.log(msg);
      return;
    }

    const html = await res.text();
    const dom = new JSDOM(html, { url });
    const doc = dom.window.document;

    canonicalUrl = meta(doc, "og:url") || pick(doc, 'link[rel="canonical"]', 'href') || url;

    const ld = extractJsonLdArticle(doc);
    const reader = new Readability(doc);
    const article = reader.parse();

    const title = ld?.headline || meta(doc, "og:title") || pick(doc, "title") || "";
    const siteName = meta(doc, "og:site_name") || new URL(url).host;
    const published = ld?.datePublished || meta(doc, "article:published_time") || meta(doc, "og:updated_time") || meta(doc, "date") || pick(doc, 'time[datetime]', 'datetime') || "";
    const byline = article?.byline || "";
    const author = ld?.author || byline || "";

    const readabilityText = (article?.textContent || "").replace(/\s+\n/g, "\n").trim();
    const rawText = (ld?.articleBody?.trim()) || readabilityText || stripHtml(html);

    const fetchedAt = new Date().toISOString();
    const wordCount = rawText.split(/\s+/).filter(Boolean).length; // rough for CJK but OK

    let summary;
    try {
      summary = await summarizeGemini(rawText, { style, lang, maxBullets, temperature });
    } catch (e) {
      console.warn(`[warn] Gemini failed: ${e?.message || e}`);
      summary = null;
    }
    if (!summary) {
      const excerpt = rawText.slice(0, 2000);
      summary = `※APIキー未設定のためフォールバック（抜粋）\n\n${excerpt}`;
    }

    const pageLang = detectLang(doc);

    const fm = [
      "---",
      `title: ${JSON.stringify(title || siteName)}`,
      `url: ${JSON.stringify(url)}`,
      `canonical_url: ${JSON.stringify(canonicalUrl)}`,
      `site_name: ${JSON.stringify(siteName)}`,
      `published_at: ${JSON.stringify(published)}`,
      `fetched_at: ${JSON.stringify(fetchedAt)}`,
      `word_count: ${wordCount}`,
      `model: ${JSON.stringify(process.env.GEMINI_MODEL || "gemini-1.5-flash")}`,
      `author: ${JSON.stringify(author)}`,
      `byline: ${JSON.stringify(byline)}`,
      `lang: ${JSON.stringify(pageLang || lang)}`,
      `summary_style: ${JSON.stringify(style)}`,
      `tags: [ai-news-bot, web-summary]`,
      "---",
    ].join("\n");

    const md = `${fm}

# 要約

${summary}

## メタ
- タイトル: ${title || "(不明)"}  
- サイト: ${siteName}  
- 公開日: ${published || "(不明)"}  
- 取得時刻: ${fetchedAt}
- canonical: ${canonicalUrl}

## 原文テキスト（先頭）
${rawText.slice(0, 3000)}
`;

    fs.writeFileSync(mdPath, md, "utf8");
    fs.writeFileSync(htmlPath, `<!doctype html><meta charset="utf-8"><pre>${escHtml(md)}</pre>`, "utf8");
    console.log(`# Summary\n\nURL: ${url}\n\nOutput: ${path.relative(process.cwd(), mdPath)}`);
  } catch (e) {
    const msg = `Error: ${e?.message || e}`;
    fs.writeFileSync(mdPath, `---\nurl: ${url}\nerror: ${JSON.stringify(msg)}\n---\n`);
    fs.writeFileSync(htmlPath, `<!doctype html><meta charset="utf-8"><pre>${escHtml(msg)}</pre>`);
    console.error(msg);
  }
}

function readSeedList(p) {
  const abs = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
  if (!fs.existsSync(abs)) throw new Error(`seed file not found: ${abs}`);
  const lines = fs.readFileSync(abs, "utf8").split(/\r?\n/).map((l) => l.trim()).filter(Boolean).filter((l) => !l.startsWith("#"));
  return lines;
}

async function main() {
  const targets = [];
  if (seedFile) targets.push(...readSeedList(seedFile));
  if (urlArg) targets.push(urlArg);

  const uniq = [...new Set(targets)];
  if (!uniq.length) {
    console.error("no targets");
    process.exit(1);
  }

  for (const u of uniq) {
    await processOne(u);
  }
}

await main();
