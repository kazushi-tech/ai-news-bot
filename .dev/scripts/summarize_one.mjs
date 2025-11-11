import { spawn } from "node:child_process";

const sh = (cmd, args=[]) => new Promise((res, rej) => {
  const p = spawn(cmd, args, { stdio: "inherit" });
  p.on("close", code => code === 0 ? res() : rej(new Error(`${cmd} ${args.join(' ')} -> ${code}`)));
});

await sh("node", ["scripts/ingest_rss.mjs"]);        // 5件取得（feedsの上限に従う）
await sh("node", ["scripts/doctor_jp_style.mjs"]);   // 見出しや用語を日本語化
await sh("node", ["scripts/build_home.mjs"]);        // index.md 再生成
