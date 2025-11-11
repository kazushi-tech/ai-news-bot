#!/usr/bin/env node
/**
 * backfill_titles_ja.mjs
 * articles/*.md を走査し、title_ja が無ければ Gemini で日本語見出しを付与
 */
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { fetch } from "undici";

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), "..");
const ARTICLES = path.join(ROOT, "articles");
const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const MODEL = "gemini-2.5-flash";

async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(API_KEY)}`;
  const body = { contents: [{ role: "user", parts: [{ text: prompt }]}], generationConfig: { temperature: 0.2 }};
  const r = await fetch(url, { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(body) });
  const j = await r.json();
  return j?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("")?.trim() || "";
}

function toPrompt(enTitle){
  return [
    "次の英語タイトルを日本語の新聞見出しに翻訳・要約してください。",
    "全角48文字以内・句点なし・固有名詞は維持。1行のみ。",
    "",
    enTitle
  ].join("\n");
}

(async () => {
  if (!API_KEY) { console.log("API key missing. Skip."); process.exit(0); }
  await fs.mkdir(ARTICLES, { recursive: true });
  const names = (await fs.readdir(ARTICLES)).filter(n => n.endsWith(".md")).sort();
  let updated = 0, skipped = 0;

  for (const name of names) {
    const full = path.join(ARTICLES, name);
    const md = await fs.readFile(full, "utf8");
    const fm = matter(md);
    if (fm.data.title_ja && String(fm.data.title_ja).trim()) { skipped++; continue; }
    const baseTitle = String(fm.data.title || "").trim();
    if (!baseTitle) { skipped++; continue; }
    const ja = (await callGemini(toPrompt(baseTitle))).split(/\r?\n/)[0].replace(/^["'#\s]+|["'\s]+$/g,"");
    fm.data.title_ja = ja || baseTitle; // 失敗時は英題をそのまま
    const out = matter.stringify(fm.content, fm.data);
    await fs.writeFile(full, out, "utf8");
    console.log("updated title_ja ->", name);
    updated++;
  }
  console.log(`✅ title_ja backfilled: ${updated} updated, ${skipped} skipped`);
})().catch(e => { console.error(e); process.exit(1); });
