import "dotenv/config";
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { hideBin } from "yargs/helpers";
import yargs from "yargs";
import { ROOT, ensureDirs, hostOf, slugify, jstToday, toFrontmatter } from "./lib/index-utils.mjs";

// Node v18+ は globalThis.fetch が標準搭載
const fetch = globalThis.fetch;

const argv = yargs(hideBin(process.argv))
  .option("url", { type: "string", demandOption: true })
  .help().argv;

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GEMINI_MODEL  = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const OFFLINE = String(process.env.AI_NEWS_OFFLINE || "0") === "1";

async function fetchArticle(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const html = await res.text();
  const dom  = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const art  = reader.parse();
  const title = art?.title?.trim() || dom.window.document.title?.trim() || url;
  const text  = (art?.textContent || "").trim();
  return { title, text };
}

async function summarizeWithGemini(text) {
  if (OFFLINE) {
    const tldr = text.slice(0, 160).replace(/\s+/g, " ") + (text.length > 160 ? "..." : "");
    return { title: "", tldr, key_points: [], body_md: "## 概要\n本文取得のみ（オフライン）\n\n## 詳細レポート\n- オフライン簡易モードです。\n" };
  }
  if (!GOOGLE_API_KEY) throw new Error("API_KEY_INVALID");

  const prompt = [
    "あなたは日本語のニュース要約者です。",
    "以下の長文から、**厳密なJSON**だけを返してください（コードフェンス不要）。形式は：",
    "{",
    '  "title": "短い見出し（30字前後）",',
    '  "tldr": "1〜3文の要約（日本語）",',
    '  "key_points": ["3〜6個の箇条書き（短く）"],',
    '  "body_md": "Markdown本文。次の見出しを必ず含む：\\n\\n## 概要\\n（150〜250語程度で、TL;DRの焼き直しにしない。要点を段落で）\\n\\n## 詳細レポート\\n### 背景\\n...\\n### 問題/原因\\n...\\n### 解決策/示唆\\n...\\n### なぜ機能するのか\\n...\\n" ',
    "}",
    "",
    "制約：",
    "- 日本語で書く。事実誤認を避ける。見出し語はそのまま出力する。",
    "- `body_md`はMarkdownのみ（箇条書き・小見出しOK、表や画像は不要）。",
    "",
    "【入力本文】\n",
    text.slice(0, 12000)
  ].join("\n");

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.25, maxOutputTokens: 900 }
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status} ${await res.text()}`);

  const data = await res.json();
  const out  = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const json = tryExtractJson(out);

  try {
    const obj = JSON.parse(json);
    return {
      title: (obj.title || "").toString(),
      tldr: (obj.tldr || "").toString(),
      key_points: Array.isArray(obj.key_points) ? obj.key_points.map(String) : [],
      body_md: (obj.body_md || "").toString()
    };
  } catch {
    return { title: "", tldr: out.trim().slice(0, 300), key_points: [], body_md: "## 概要\n要約整形に失敗しました。\n" };
  }
}

function tryExtractJson(s) {
  const f = s.match(/```json\s*([\s\S]*?)```/i);
  if (f) return f[1].trim();
  const m = s.match(/\{[\s\S]*\}/);
  return m ? m[0] : "{}";
}

async function main() {
  await ensureDirs();
  const source_url = argv.url;
  const date = jstToday();
  const host = hostOf(source_url);

  const { title: rawTitle, text } = await fetchArticle(source_url);
  const sum = await summarizeWithGemini(text);
  const title = sum.title || rawTitle;

  const fileSlug = slugify(new URL(source_url).pathname.replace(/\//g, "-") || rawTitle);
  const filename = `${date}--${host}--${fileSlug}.md`;
  const rel = path.join("articles", filename);
  const abs = path.join(ROOT, rel);

  const fm = {
    title,
    date,
    model: GEMINI_MODEL,
    source_url,
    host,
    tldr: sum.tldr,
    key_points: sum.key_points
  };

  const parts = [];
  parts.push(toFrontmatter(fm));
  // 1) 引用元（上）
  parts.push("## 引用元\n\n");
  parts.push(`[${host}](${source_url})\n\n`);
  // 2) 詳細Markdown（概要→詳細）
  if (sum.body_md?.trim()) {
    parts.push(sum.body_md.trim());
    parts.push("\n\n");
  }
  // 3) 必要ならTL;DRとKey Points（任意表示）
  if (fm.tldr) parts.push(`## TL;DR\n\n${fm.tldr}\n\n`);
  if (fm.key_points?.length) parts.push(`## Key Points\n\n${fm.key_points.map(p => `- ${p}`).join("\n")}\n\n`);

  await writeFile(abs, parts.join(""), "utf8");
  console.log(`Wrote: ${rel}`);
}

main().catch(e => { console.error(e?.message || e); process.exit(1); });
