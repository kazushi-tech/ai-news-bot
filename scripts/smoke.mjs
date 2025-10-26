// scripts/smoke.mjs
import fs from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const URL_INBOX = path.join(ROOT, "sources", "url_inbox.md");

async function main() {
  await fs.appendFile(URL_INBOX, "- [ ] https://www.dwarkesh.com/p/andrej-karpathy\n", "utf-8");
  const { spawn } = await import("node:child_process");
  await new Promise((resolve, reject) => {
    const p = spawn(process.execPath, ["scripts/build_ai_news.mjs", "--max", "1", "--jp-columns", "--save-fulltext"], { stdio: "inherit" });
    p.on("exit", (code) => code === 0 ? resolve() : reject(new Error("build_ai_news failed with code " + code)));
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});