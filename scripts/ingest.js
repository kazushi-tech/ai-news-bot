// Node >=18 / ESM
// 使い方:
//   node scripts/summarize_article.mjs https://example.com/article
//   node scripts/summarize_article.mjs https://example.com/article --date=2025-11-07 --outdir=articles

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const ENV = {
  API_KEY: process.env.GOOGLE_API_KEY || "",
  OFFLINE: process.env.AI_NEWS_OFFLINE === "1",
};

function toYMD(d = new Date()) {
  const z = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function escapeYAML(s) {
  const v = String(s ?? "");
  return /[:#\-?{}[\],&*!|>'"%@`]/.test(v) ? JSON.stringify(v) : v;
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function fetchHTML(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  return await res.text();
}

function extractArticle(html, url) {
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const art = reader.parse(); // {title, content, textContent, byline, siteName}
  if (!art) throw new Error("Readability failed to parse article.");
  return {
    title: art.title || dom.window.document.title || "",
    text: art.textContent || "",
    siteName: art.siteName || "",
  };
}

async function summarizeWithGemini(text, url, modelName = "gemini-2.5-flash") {
  const genAI = new GoogleGenerativeAI(ENV.API_KEY);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = [
    "You are a sharp tech news summarizer.",
    "Summarize the provided article text for a Japanese audience.",
    "",
    "Output in this simple markdown form:",
    "",
    "TLDR: <1-2 sentences, concise, in Japanese>",
    "",
    "- <bullet 1>",
    "- <bullet 2>",
    "- <bullet 3>",
    "",
    `Source: ${url}`,
  ].join("\n");

  // 長すぎる本文は控えめにトリム（~16k文字）
  const body = text.length > 16000 ? text.slice(0, 16000) : text;

  const res = await model.generateContent([
    {
      role: "user",
      parts: [{ text: prompt }, { text: "\n\n---\nARTICLE:\n" + body }],
    },
  ]);
  const out = res.response.text();
  return out;
}

function pickTLDR(markdown) {
  const m = markdown.match(/^\s*TLDR:\s*(.+)$/im);
  if (m) return m[1].trim();
  // 保険: 最初の行を要約扱い
  const firstLine = markdown.trim().split(/\r?\n/).find(Boolean) || "";
  return firstLine.replace(/^#+\s*/, "").slice(0, 200);
}

async function main() {
  const args = process.argv.slice(2);
  if (!args[0] || args[0].startsWith("-")) {
    console.error(
      "Usage: node scripts/summarize_article.mjs <url> [--date=YYYY-MM-DD] [--outdir=articles]",
    );
    process.exit(2);
  }

  const url = args[0];
  const dateArg = args.find((a) => a.startsWith("--date="))?.split("=")[1];
  const outdirArg = args.find((a) => a.startsWith("--outdir="))?.split("=")[1];
  const created = dateArg || toYMD();
  const OUT_DIR = path.join(ROOT, outdirArg || "articles");

  const u = new URL(url);
  const domain = u.hostname;
  const html = await fetchHTML(url);
  const { title, text, siteName } = extractArticle(html, url);
  const source = siteName || domain;

  let summaryMD = "";
  if (!ENV.OFFLINE && ENV.API_KEY) {
    try {
      summaryMD = await summarizeWithGemini(text, url);
    } catch (err) {
      console.warn(
        `[warn] Gemini failed (${err.message}). Falling back to offline summary.`,
      );
      summaryMD = offlineSummary(text, url);
    }
  } else {
    summaryMD = offlineSummary(text, url);
  }

  const tldr = pickTLDR(summaryMD);
  const slug = slugify(title || domain);
  const file = `${created}--${domain}--${slug}.md`;
  await ensureDir(OUT_DIR);

  const frontmatter = [
    "---",
    `title: ${escapeYAML(title || "(untitled)")}`,
    `url: ${escapeYAML(url)}`,
    `source: ${escapeYAML(source)}`,
    `domain: ${escapeYAML(domain)}`,
    `tldr: ${escapeYAML(tldr)}`,
    `created: ${created}`,
    "---",
    "",
  ].join("\n");

  // ★★★ ここが一番重要：本文は「タイトル + 元記事リンク」だけ ★★★
  const body = [
    `# ${title || "(untitled)"}`,
    "",
    `[元記事](${url})`,
    "",
    // 要約・概要・詳細レポート・スクレイピング本文などは一切入れない
  ].join("\n");

  const outPath = path.join(OUT_DIR, file);
  await fs.writeFile(outPath, frontmatter + body, "utf8");
  console.log(`✔ Wrote: ${path.relative(ROOT, outPath)}`);
}

function offlineSummary(text, url) {
  const s = text.replace(/\s+/g, " ").slice(0, 800);
  const tldr = s.slice(0, 160) + (s.length > 160 ? "…" : "");
  const bullets = chunkWords(s, 40)
    .slice(0, 5)
    .map((b) => `- ${b}`);
  return [
    `TLDR: ${tldr}`,
    "",
    bullets.join("\n"),
    "",
    `Source: ${url}`,
  ].join("\n");
}

function chunkWords(str, n) {
  const words = str.split(/\s+/).filter(Boolean);
  const out = [];
  for (let i = 0; i < words.length; i += n) {
    out.push(words.slice(i, i + n).join(" "));
  }
  return out;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
