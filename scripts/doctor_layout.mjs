import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const ROOT = path.resolve(process.env.NEWS_ROOT ?? ".");
const TARGETS = [
  path.join(ROOT, "articles"),
  path.join(ROOT, "ai-news", "articles"),
].filter(Boolean);

function ensureSections(body) {
  // H1直後に cite コールアウトが無ければ入れる
  if (!/> \[!cite]/.test(body)) {
    body = body.replace(/^\s*# .*\n+/, (m) => m + `> [!cite] 引用元\n\n`);
  }
  // 概要が無ければ先頭段落から仮置き
  if (!/^##\s*概要/m.test(body)) {
    const firstPara = (body.replace(/^#.*$/m, "").match(/\n\n([^#\n].*?)\n\n/s)?.[1] || "").trim();
    const summary = firstPara ? firstPara : "（要約作成中）";
    body = body.replace(/> \[!cite].*?\n\n/s, (m) => `${m}## 概要\n\n${summary}\n\n`);
  }
  // 詳細レポートが無ければ見出しだけ用意
  if (!/^##\s*詳細レポート/m.test(body)) {
    body += `\n\n## 詳細レポート\n\n`;
  }
  return body;
}

async function runOne(fp){
  const raw = await fs.readFile(fp,"utf8");
  const g = matter(raw);
  const title = g.data.title || (raw.match(/^#\s*(.+)$/m)?.[1] ?? "無題");
  // 先頭にH1が無ければ付ける
  let body = g.content;
  if (!/^#\s/m.test(body)) body = `# ${title}\n\n` + body;
  // 英語見出し→日本語へ
  body = body
    .replace(/^\#\#\s*(TL;?\s*DR|Summary)\s*$/gmi,"## 概要")
    .replace(/^\#\#\s*(Key\s*Points?|Details?)\s*$/gmi,"## 詳細レポート")
    .replace(/^\#\#\s*(Post|Tweet|Original)\s*$/gmi,"## 投稿内容")
    .replace(/^Title:\s*X.*\n/gmi,"");
  body = ensureSections(body);
  await fs.writeFile(fp, matter.stringify(body, g.data), "utf8");
}

for (const dir of TARGETS){
  try{
    const files = (await fs.readdir(dir)).filter(f=>f.endsWith(".md"));
    for (const f of files) await runOne(path.join(dir,f));
  }catch{}
}
console.log("[doctor] layout normalized.");
