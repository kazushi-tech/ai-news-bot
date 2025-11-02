import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { fetch } from "undici";

const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error("GOOGLE_API_KEY を env に設定してください");
  process.exit(1);
}

const argFile =
  process.argv.includes("--file")
    ? process.argv[process.argv.indexOf("--file") + 1]
    : process.argv[2];

if (!argFile) {
  console.error("使い方: node scripts/summarize_clip.mjs <clipped.md> もしくは --file <path>");
  process.exit(1);
}

const abs = path.resolve(argFile);
const raw = await fs.readFile(abs, "utf8");
const gm = matter(raw);

const title =
  gm.data.title ||
  (gm.content.match(/^#\s+(.+)$/m)?.[1] ?? "Untitled");
const source_url = gm.data.source_url || gm.data.url || "";
let host = gm.data.host || "";
try { if (!host && source_url) host = new URL(source_url).host; } catch {}
const date = gm.data.date || new Date().toISOString().slice(0,10);

// モデルに食わせる本文（長すぎると弾かれるので上限を切る）
const contentForModel = gm.content.slice(0, 120_000);

// 出力仕様：Markdownだけを返してもらう
const prompt = [
  "あなたはテックニュースの編集者です。",
  "以下のMarkdown本文を読み、日本語で要約してください。",
  "出力は Markdown のみ。次のセクションをこの順番で含めること：",
  "## TL;DR（1~3行）",
  "## Key Points（箇条書き5個以内）",
  "## Source（そのままURLを1行）",
  "",
  "制約：事実のみ。誇張や推測は禁止。",
].join("\n");

const body = {
  contents: [
    {
      role: "user",
      parts: [
        { text: prompt },
        // contextURL を明示（Google AI Studio はURL自体も手がかりにできる）
        { text: `Source URL: ${source_url}` },
        { text: contentForModel },
      ],
    },
  ],
};

const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + API_KEY;

const res = await fetch(endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
if (!res.ok) {
  console.error("Gemini API error:", res.status, await res.text());
  process.exit(1);
}
const json = await res.json();
const text = json?.candidates?.[0]?.content?.parts?.map(p=>p.text).join("") ?? "";
if (!text) {
  console.error("Empty response:", JSON.stringify(json, null, 2));
  process.exit(1);
}

// ファイル名を決める
const slug = (s) =>
  s.toLowerCase()
   .replace(/[^a-z0-9一-龯ぁ-んァ-ンー]+/g, "-")
   .replace(/-+/g, "-")
   .replace(/^-|-$/g, "")
   .slice(0, 80);

const outDir = path.resolve("summary");
await fs.mkdir(outDir, { recursive: true });
const fname = `${date}--${(host||"unknown").replace(/\//g,"-")}--${slug(title)}.md`;
const outPath = path.join(outDir, fname);

// frontmatter を付けて保存
const out = `---\n` +
`title: ${title}\n` +
`date: ${date}\n` +
`model: "gemini-2.5-flash"\n` +
`source_url: ${JSON.stringify(source_url)}\n` +
`host: ${host}\n` +
`---\n\n` +
`${text}\n`;

await fs.writeFile(outPath, out, "utf8");
console.log("✅ Wrote", outPath);
