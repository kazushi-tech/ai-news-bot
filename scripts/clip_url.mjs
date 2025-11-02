import fs from "node:fs/promises";
import path from "node:path";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";

const arg = process.argv.find(a=>a.startsWith("--url="))?.slice(6) || process.argv[2];
if (!arg) { console.error("使い方: node scripts/clip_url.mjs --url=https://..."); process.exit(1); }

const url = arg;
const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }});
if (!res.ok) { console.error("Fetch failed:", res.status, await res.text().catch(()=>'')); process.exit(1); }
const html = await res.text();

const dom = new JSDOM(html, { url });
const reader = new Readability(dom.window.document);
const article = reader.parse();

const title = (article?.title || dom.window.document.title || "Untitled").trim();
const turndown = new TurndownService({ headingStyle: "atx" });
const mdBody = turndown.turndown(article?.content || dom.window.document.body.innerHTML);

const date = new Date().toISOString().slice(0,10);
const slug = s => s.toLowerCase()
  .replace(/[^a-z0-9一-龯ぁ-んァ-ンー]+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"").slice(0,80);

await fs.mkdir("src/clips", { recursive: true });
const outPath = path.join("src/clips", `${date}--${slug(title)}.md`);

const out = `---\n`+
`title: ${title}\n`+
`date: ${date}\n`+
`source_url: ${JSON.stringify(url)}\n`+
`model: "gemini-2.5-flash"\n`+
`status: "clipped"\n`+
`---\n\n# ${title}\n\n${mdBody}\n`;

await fs.writeFile(outPath, out, "utf8");
console.log("✅ clipped ->", outPath);
