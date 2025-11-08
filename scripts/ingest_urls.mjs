// scripts/ingest_urls.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const listFile = process.argv[2] || path.join(ROOT, "urls.txt");

const txt = await fs.readFile(listFile, "utf8").catch(() => "");
const urls = [...new Set(txt.split(/\r?\n/).map(s => s.trim()).filter(Boolean))];

if (urls.length === 0) {
  console.error("[err] urls.txt が空です。1行1URLで入れてください。");
  process.exit(1);
}

const run = (url) => new Promise((resolve) => {
  const p = spawn("node", ["scripts/summarize_from_clip.mjs", "--url", url], { cwd: ROOT });
  p.on("close", (code) => resolve({ code, url }));
});

for (const raw of urls) {
  const url = raw.trim();
  if (!/^https?:\/\//.test(url) || url.includes("####")) { // ← ダミー行は弾く
    console.log("[skip]", url);
    continue;
  }
  console.log("[ingest]", url);
  const r = await run(url);
  console.log(r.code === 0 ? "[ok]" : "[ng]", url);
}
