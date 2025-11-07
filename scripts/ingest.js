import "dotenv/config";
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { hideBin } from "yargs/helpers";
import yargs from "yargs";
import { ROOT, ensureDirs, hostOf, slugify, jstToday, toFrontmatter } from "./lib/index-utils.mjs";
import { fetch } from "undici";

const argv = yargs(hideBin(process.argv))
  .option("url", { type: "string", demandOption: true })
  .help().argv;

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const OFFLINE = String(process.env.AI_NEWS_OFFLINE || "0") === "1";

async function fetchArticle(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const html = await res.text();
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const art = reader.parse();
  const title = art?.title?.trim() || dom.window.document.title?.trim() || url;
  const text = (art?.textContent || "").trim();
  return { title, text };
}

async function summarizeWithGemini(text, url) {
  if (OFFLINE) {
    const tldr = text.slice(0, 160).replace(/\s+/g, " ") + (text.length > 160 ? "..." : "");
    return {
      title: "",
      tldr,
      key_points: []
    };
  }
  if (!GOOGLE_API_KEY) throw new Error("API_KEY_INVALID");

  const prompt = [
    "You are a Japanese news summarizer.",
    "Return strict JSON with fields: title, tldr, key_points (array of 3-6 short bullets).",
    "Write in Japanese. Keep tldr within 1-3 sentences.",
    "Input text follows:\n\n",
    text.slice(0, 12000)
  ].join("\n");

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 512 }
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${errText}`);
  }
  const data = await res.json();
  const textOut = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const jsonStr = extractJson(textOut);
  try {
    const obj = JSON.parse(jsonStr);
    return {
      title: (obj.title || "").toString(),
      tldr: (obj.tldr || "").toString(),
      key_points: Array.isArray(obj.key_points) ? obj.key_points.map(String) : []
    };
  } catch (e) {
    // Fallback: treat whole output as TL;DR
    return { title: "", tldr: textOut.trim().slice(0, 300), key_points: [] };
  }
}

function extractJson(s) {
  // try code fence
  const fence = s.match(/```json\s*([\s\S]*?)```/i);
  if (fence) return fence[1].trim();
  // try first {...}
  const obj = s.match(/\{[\s\S]*\}/);
  if (obj) return obj[0];
  return "{}";
}

async function main() {
  await ensureDirs();
  const source_url = argv.url;
  const date = jstToday();
  const host = hostOf(source_url);
  const { title: rawTitle, text } = await fetchArticle(source_url);
  const sum = await summarizeWithGemini(text, source_url);
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

  const body = [
    toFrontmatter(fm),
    fm.tldr ? `## TL;DR\n\n${fm.tldr}\n\n` : "",
    fm.key_points?.length ? `## Key Points\n\n${fm.key_points.map(p => `- ${p}`).join("\n")}\n\n` : "",
    "## 引用元\n\n",
    `[${host}](${source_url})\n`
  ].join("");

  await writeFile(abs, body);
  console.log(`Wrote: ${rel}`);
}

main().catch(e => {
  console.error(e.message || e);
  process.exit(1);
});
