#!/usr/bin/env node
/**
 * scripts/summarize_article.mjs
 * 目的:
 *   - articles/*.md（frontmatterに source.url がある想定）の本文をGemini 2.5-flashで日本語Markdown要約で埋める
 *   - 既に本文がある場合はデフォルトでスキップ（--force で上書き）
 *   - JSON-LD(articleBody) → Readability の順で本文抽出。失敗時は Jina Reader でフォールバック
 *
 * 使い方:
 *   node scripts/summarize_article.mjs --file=articles/2025-11-03--host--slug.md
 *   node scripts/summarize_article.mjs --date=2025-11-03
 *   node scripts/summarize_article.mjs --force --file=...
 */

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

/* ---------------- paths & args ---------------- */
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), "..");
const ARTICLES = path.join(ROOT, "articles");

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...v] = a.replace(/^--/, "").split("=");
    return [k, v.join("=") || true];
  })
);

const FORCE = !!args.force;
const DATE = args.date || "";
const FILE = args.file || "";

/* ---------------- utils ---------------- */
async function walk(dir) {
  const out = [];
  for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

function extractJsonLd(html) {
  try {
    const dom = new JSDOM(html);
    const arr = [
      ...dom.window.document.querySelectorAll(
        'script[type="application/ld+json"]'
      ),
    ];
    for (const s of arr) {
      try {
        const data = JSON.parse(s.textContent || "null");
        const list = Array.isArray(data) ? data : [data];
        for (const obj of list) {
          const t = obj?.articleBody || obj?.text || obj?.description;
          if (t && String(t).trim().length > 120) return String(t);
        }
      } catch {}
    }
  } catch {}
  return "";
}

async function extractReadable(html, url) {
  try {
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const art = reader.parse();
    return (art?.textContent || "").trim();
  } catch {
    return "";
  }
}

async function fetchTextDirect(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`fetch ${res.status}`);
  return await res.text();
}

/** Paywall等のフォールバック: Jina Reader 経由 */
async function fetchTextSmart(url) {
  try {
    return await fetchTextDirect(url);
  } catch {}
  const proxy = "https://r.jina.ai/http/" + url.replace(/^https?:\/\//, "");
  const r = await fetch(proxy, { redirect: "follow" });
  if (!r.ok) throw new Error(`jina ${r.status}`);
  return await r.text();
}

/* ---------------- summarizer ---------------- */
async function summarizeJaMD(title, url, body) {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error("GOOGLE_API_KEY is required");

  // モデルは固定（ユーザー意図）
  const endpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
    encodeURIComponent(key);

  const prompt = [
    "あなたは熟練のニュース要約者です。以下の本文を日本語のMarkdownで要約してください。",
    "",
    "必ず次の構成で出力してください：",
    "## TL;DR",
    "- 箇条書きで3〜5点",
    "## 重要ポイント",
    "- 箇条書きで5点前後",
    "## 概要",
    "3〜6行で本文要約",
    "",
    `タイトル: ${title}`,
    `ソース: ${url}`,
    "",
    "=== 本文 ===",
    body.slice(0, 18000),
  ].join("\n");

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }]}],
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`gemini ${res.status} ${res.statusText}`);
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text.trim()) throw new Error("empty summary");
  return text.trim();
}

function ensureMd(s) {
  return s.endsWith("\n") ? s : s + "\n";
}

/* ---------------- main worker ---------------- */
async function processFile(file) {
  const raw = await fs.readFile(file, "utf8");
  const fm = matter(raw);

  const url =
    fm.data?.source?.url ||
    fm.data?.url ||
    fm.data?.source_url ||
    fm.data?.sourceUrl ||
    "";

  const title =
    fm.data?.title ||
    fm.data?.headline ||
    path.basename(file).replace(/\.md$/, "");

  if (!url) {
    console.log(`[skip] no source.url: ${path.relative(ROOT, file)}`);
    return;
  }

  // 既存本文があればスキップ（--force で上書き）
  if (!FORCE && fm.content.trim().length > 0) {
    console.log(`[skip] already has content: ${path.relative(ROOT, file)}`);
    return;
  }

  // 本文抽出（JSON-LD優先、なければReadability、失敗時はJina）
  const html = await fetchTextSmart(url);
  const bodyJsonLd = extractJsonLd(html);
  const bodyReadable = await extractReadable(html, url);
  const body =
    (bodyJsonLd && bodyJsonLd.length > 300 ? bodyJsonLd : bodyReadable).slice(
      0,
      40000
    );

  if (body.length < 200) {
    console.log(`[warn] short body (fallback used): ${url}`);
  }

  // 要約（Gemini 2.5-flash固定）
  const summary = await summarizeJaMD(title, url, body);

  const newContent = [`# ${title}`, "", summary].map(ensureMd).join("");

  const out = matter.stringify(newContent, {
    ...fm.data,
    title,
    source: { ...(fm.data?.source || {}), url },
    model: "gemini-2.5-flash",
    summarized_at: new Date().toISOString(),
  });

  await fs.writeFile(file, out, "utf8");
  console.log(`[ok] summarized: ${path.relative(ROOT, file)}`);
}

/* ---------------- entrypoint ---------------- */
(async () => {
  await fs.mkdir(ARTICLES, { recursive: true });

  const targets = [];
  if (FILE) {
    targets.push(path.resolve(FILE));
  } else {
    const all = await walk(ARTICLES);
    targets.push(
      ...all
        .filter((f) => f.endsWith(".md"))
        .filter((f) =>
          DATE ? path.basename(f).startsWith(`${DATE}--`) : true
        )
    );
  }

  if (targets.length === 0) {
    console.log("[info] no targets.");
    return;
  }

  for (const f of targets) {
    try {
      await processFile(f);
    } catch (e) {
      console.error(`[fail] ${path.relative(ROOT, f)}: ${e.message}`);
    }
    // 軽いスロットリング
    await new Promise((r) => setTimeout(r, 500));
  }
})();
