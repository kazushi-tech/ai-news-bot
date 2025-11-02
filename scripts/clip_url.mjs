#!/usr/bin/env node
/**
 * clip_url.mjs
 * Node 20+ (ESM)
 * 使い方:
 *   npm run clip -- "https://example.com/..."
 *   もしくは:
 *   node scripts/clip_url.mjs --url="https://example.com/..."
 *   node scripts/clip_url.mjs "https://example.com/..."
 *
 * 出力:
 *   src/clips/YYYY-MM-DD--<title-slug>.md
 *   frontmatter: { title, date, model, source_url, host }
 * 方針:
 *   1) JSON-LD(Article/NewsArticle/BlogPosting).articleBody があれば採用
 *   2) なければ Readability の抽出HTMLを Turndown で Markdown 化
 */

import fs from "node:fs/promises";
import path from "node:path";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";
import { fetch } from "undici";

/* ---------------- args: --url / --url= / 位置引数 どれでもOK ---------------- */
function getUrlArg(argv) {
  const args = argv.slice(2);
  const eq = args.find(a => a.startsWith("--url="));
  if (eq) return eq.split("=").slice(1).join("=").replace(/^["']|["']$/g, "");
  const i = args.indexOf("--url");
  if (i !== -1 && args[i + 1]) return args[i + 1].replace(/^["']|["']$/g, "");
  if (args[0] && !args[0].startsWith("-")) return args[0];
  return null;
}
const inputUrl = getUrlArg(process.argv);
if (!inputUrl) {
  console.error('Usage: node scripts/clip_url.mjs --url "<URL>"  or  node scripts/clip_url.mjs "<URL>"');
  process.exit(1);
}
let pageUrl;
try {
  pageUrl = new URL(inputUrl);
} catch {
  console.error("Invalid URL:", inputUrl);
  process.exit(1);
}
const host = pageUrl.host.replace(/^www\./, "");

/* ---------------- helpers ---------------- */
const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

function slugify(s, fallback = "article") {
  if (!s) return fallback;
  const ascii = s
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "") // 非ASCIIを落とす（日本語タイトルはURL末尾にフォールバック）
    .toLowerCase();
  let out = ascii
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (!out || out === "-") {
    const leaf = pageUrl.pathname.split("/").filter(Boolean).pop() || fallback;
    out = leaf.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }
  return out.slice(0, 80);
}
function parseJsonSafe(txt) { try { return JSON.parse(txt); } catch { return null; } }
function firstOf(val) { return Array.isArray(val) ? val[0] : val; }

function extractFromJsonLd(doc) {
  const scripts = [...doc.querySelectorAll('script[type="application/ld+json"]')];
  for (const s of scripts) {
    const json = parseJsonSafe(s.textContent.trim());
    if (!json) continue;
    const candidates = Array.isArray(json) ? json : [json];
    for (const c of candidates) {
      const type = (firstOf(c["@type"]) || "").toString().toLowerCase();
      if (["article", "newsarticle", "blogposting"].includes(type)) {
        const body = c.articleBody || "";
        const title = (c.headline || "").toString().trim();
        if (typeof body === "string" && body.trim().length > 80) {
          return { title, articleBody: body.trim() };
        }
      }
    }
  }
  return null;
}

/* ---------------- fetch ---------------- */
const res = await fetch(pageUrl.toString(), {
  headers: {
    // 軽いブロック回避
    "User-Agent": "Mozilla/5.0",
    "Accept-Language": "ja,en-US;q=0.8,en;q=0.6",
  },
});
if (!res.ok) {
  console.error("Fetch failed:", res.status, await res.text().catch(() => ""));
  process.exit(1);
}
const html = await res.text();

/* ---------------- parse ---------------- */
const dom = new JSDOM(html, { url: pageUrl.toString() });
const doc = dom.window.document;

let title =
  (extractFromJsonLd(doc)?.title ||
    doc.title ||
    "")?.toString().trim() || "Untitled";

let bodyMarkdown = "";
const ld = extractFromJsonLd(doc);
if (ld?.articleBody) {
  // JSON-LDが取れたらそのまま本文に
  bodyMarkdown = ld.articleBody + "\n";
} else {
  // Readability → Turndown
  const reader = new Readability(doc);
  const article = reader.parse();
  const htmlContent = article?.content || doc.body?.innerHTML || "";
  bodyMarkdown = turndown.turndown(htmlContent);
}

/* ---------------- frontmatter + write ---------------- */
const date = new Date().toISOString().slice(0, 10);
const titleSlug = slugify(title);
const clipsDir = path.join("src", "clips");
await fs.mkdir(clipsDir, { recursive: true });

// 重複回避（同名があれば -2, -3...）
let base = `${date}--${titleSlug}`;
let outPath = path.join(clipsDir, `${base}.md`);
for (let i = 2; i < 1000; i++) {
  try {
    await fs.access(outPath);
    outPath = path.join(clipsDir, `${base}-${i}.md`);
  } catch {
    break;
  }
}

const frontmatter =
  `---\n` +
  `title: "${title.replace(/"/g, '\\"')}"\n` +
  `date: "${date}"\n` +
  `model: "gemini-2.5-flash"\n` +
  `source_url: "${pageUrl.toString()}"\n` +
  `host: "${host}"\n` +
  `---\n\n`;

await fs.writeFile(outPath, frontmatter + bodyMarkdown + "\n", "utf8");
console.log("✔ clipped →", outPath);
