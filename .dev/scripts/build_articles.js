// scripts/build_articles.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import slugify from "@sindresorhus/slugify";
import { loadItems, saveItems, ensureFileDir } from "./utils/store.js";
import { summarizeUrlJP } from "./utils/dify.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR   = path.resolve(__dirname, "../content/data");
const ITEMS_PATH = path.join(DATA_DIR, "items.json");
const QUEUE_PATH = path.join(DATA_DIR, "queue.jsonl");
const NEWS_DIR   = path.resolve(__dirname, "../content/news");
const ARTI_DIR   = path.resolve(__dirname, "../content/articles");

ensureFileDir(ITEMS_PATH);
ensureFileDir(QUEUE_PATH);
ensureFileDir(NEWS_DIR);
ensureFileDir(ARTI_DIR);

function todayStr() {
  const d = new Date();
  const pad = (n)=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

function uniqueSlug(base, existing) {
  let s = base, n = 2;
  while (existing.has(s)) s = `${base}-${n++}`;
  return s;
}

async function run() {
  if (!fs.existsSync(QUEUE_PATH) || fs.statSync(QUEUE_PATH).size === 0) {
    console.log("Queue empty; nothing to do.");
    process.exit(0); // 成功終了
  }

  const lines = fs.readFileSync(QUEUE_PATH, "utf8")
                  .split("\n").map(s=>s.trim()).filter(Boolean);

  const items = loadItems(ITEMS_PATH);
  const byHash = new Map(items.map(i => [i.url_hash, i]));
  const existingSlugs = new Set(
    fs.readdirSync(ARTI_DIR).filter(f=>f.endsWith(".md")).map(f=>f.replace(/\.md$/,""))
  );

  let wrote = 0;
  for (const url of lines) {
    try {
      const res = await summarizeUrlJP(url); // { title_ja, summary_ja, key_points?, lang }
      if (!res?.title_ja || !res?.summary_ja) {
        console.warn("Skip: empty summarize result for", url);
        continue;
      }
      if (res.lang && res.lang !== "ja") {
        console.warn("Non-JP detected; keep needs_rebuild=true", url);
      }

      const base = slugify(res.title_ja).toLowerCase();
      const slug = uniqueSlug(base, existingSlugs);
      existingSlugs.add(slug);

      // 記事ファイル
      const md = `# ${res.title_ja}

${res.summary_ja}

${res.key_points?.length ? "\n## キーポイント\n" + res.key_points.map(p=>"- "+p).join("\n") : ""}

_Source_: ${url}
`;
      fs.writeFileSync(path.join(ARTI_DIR, `${slug}.md`), md);

      // 日次インデックス
      const indexPath = path.join(NEWS_DIR, `${todayStr()}--AI-news.md`);
      const row = `| ${res.title_ja} | [記事](../articles/${slug}.md) | ${url} |`;
      const header = `# ${todayStr()} – AI News\n\n| タイトル | 記事 | 元URL |\n|---|---|---|\n`;
      if (!fs.existsSync(indexPath)) fs.writeFileSync(indexPath, header + row + "\n");
      else fs.appendFileSync(indexPath, row + "\n");

      // items.json 更新（url_hashキーの更新は ingest 済み前提）
      const it = items.find(i => i.url_norm === url) || {};
      it.title_ja = res.title_ja;
      it.summary_ja = res.summary_ja;
      it.key_points = res.key_points || [];
      it.lang = "ja";
      it.slug = slug;
      it.needs_rebuild = false;
      it.last_seen = new Date().toISOString();
      if (!it.url_norm) it.url_norm = url;
      if (!it.url_hash) it.url_hash = ""; // なくても動く
      saveItems(ITEMS_PATH, items);

      wrote++;
    } catch (e) {
      console.error("Build failed for", url, e?.message || e);
    }
  }

  // キューを消す（今回分は処理済み）
  fs.writeFileSync(QUEUE_PATH, "");
  console.log(`Done. wrote=${wrote}`);
}

run().catch(e => {
  console.error("Fatal:", e?.stack || e);
  process.exit(1);
});
