import "dotenv/config";
import path from "node:path";
import { readdir, writeFile, stat } from "node:fs/promises";
import { ROOT, header } from "./lib/index-utils.mjs";

async function latestByDir(dir) {
  try {
    const files = (await readdir(path.join(ROOT, dir))).filter(f => f.endsWith(".md"));
    files.sort((a, b) => b.localeCompare(a)); // 降順
    return files[0] || null;
  } catch { return null; }
}

async function recentDaily(n = 7) {
  try {
    const files = (await readdir(path.join(ROOT, "daily"))).filter(f => f.endsWith(".md"));
    files.sort((a, b) => b.localeCompare(a));
    return files.slice(0, n);
  } catch { return []; }
}

async function main() {
  const latestWeekly = await latestByDir("weekly");
  const recents = await recentDaily(7);

  const lines = [];
  lines.push(header("AIニュース（ローカル）"));
  if (latestWeekly) {
    lines.push(`- 最新Weekly: [[weekly/${latestWeekly}|${latestWeekly.replace(".md","")}]]\n`);
  }
  if (recents.length) {
    lines.push("## 最近のDaily\n");
    for (const f of recents) {
      lines.push(`- [[daily/${f}|${f.replace(".md","")}]]`);
    }
    lines.push("");
  }
  const out = path.join(ROOT, "index.md");
  await writeFile(out, lines.join("\n"), "utf8");
  console.log(`Wrote index: index.md`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(e => { console.error(e); process.exit(1); });
}
