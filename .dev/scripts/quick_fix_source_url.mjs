// scripts/quick_fix_source_url.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { parse as parseYAML, stringify as stringifyYAML } from "yaml";

const file = process.argv.find(a => a.startsWith("--file="))?.split("=")[1];
const url  = process.argv.find(a => a.startsWith("--url="))?.split("=")[1];

if (!file || !url) {
  console.error("Usage: node scripts/quick_fix_source_url.mjs --file=<path/to/article.md> --url=<https://...>");
  process.exit(1);
}

const abs = path.resolve(file);
const raw = await fs.readFile(abs, "utf8");
const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
if (!m) { console.error("frontmatter not found"); process.exit(1); }

const data = parseYAML(m[1] || "") || {};
data.source_url = url;
try { data.host = new URL(url).host; } catch { /* ignore */ }

const fm = `---\n${stringifyYAML(data, { lineWidth: 0 })}---\n`;
const out = fm + raw.slice(m[0].length);
await fs.writeFile(abs, out, "utf8");
console.log("fixed:", file, "->", url);
