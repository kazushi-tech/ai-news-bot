// scripts/build_home.mjs
import { readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.NEWS_ROOT
  ? path.resolve(process.env.NEWS_ROOT)
  : path.resolve(__dirname, "..");

function sortDesc(a, b) { return b.localeCompare(a); }

async function main() {
  await mkdir(ROOT, { recursive: true });

  const weeklyDir = path.join(ROOT, "weekly");
  const dailyDir  = path.join(ROOT, "daily");

  const wfiles = (await readdir(weeklyDir)).filter(f => f.endsWith(".md")).sort(sortDesc);
  const latestWeekly = wfiles[0] || null;

  const dfiles = (await readdir(dailyDir)).filter(f => f.endsWith(".md")).sort(sortDesc).slice(0, 7);

  const lines = [];
  lines.push("# AIニュース — ダッシュボード");
  lines.push("");
  if (latestWeekly) {
    lines.push(`> **最新のWeekly** → [[weekly/${latestWeekly}|${latestWeekly.replace(".md","")}]]`);
  }
  if (dfiles.length) {
    lines.push("");
    lines.push("## 最近のDaily");
    for (const f of dfiles) lines.push(`- [[daily/${f}|${f.replace(".md","")}]]`);
  }
  lines.push("");
  lines.push("> 生成: scripts/build_home.mjs");

  await writeFile(path.join(ROOT, "index.md"), lines.join("\n"), "utf-8");
  console.log(path.join(ROOT, "index.md"));
}
main().catch(e => { console.error(e); process.exit(1); });
