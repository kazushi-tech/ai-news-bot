// scripts/ingest_rss.mjs
import fs from "node:fs/promises";
import path from "node:path";
import Parser from "rss-parser";
import YAML from "yaml";
import pLimit from "p-limit";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONFIG = path.join(ROOT, "feeds", "ai-news.yml");

const yamlText = await fs.readFile(CONFIG, "utf8");
const conf = YAML.parse(yamlText ?? "{}");

// ---- 既存のYAML設定（既定値） ----
const sinceDays     = Number(conf.since_days ?? 2);
const maxPer        = Number(conf.max_per_source ?? 5);
const maxPerDomain  = Number(conf.max_per_domain ?? 2);
const totalCap      = Number(conf.max_total ?? 50);
const cutoff        = Date.now() - sinceDays * 24 * 60 * 60 * 1000;

// ---- 追記: 環境変数で上書きできる除外＆上限 ----
// 例) RSS_EXCLUDE_DOMAINS="huggingface.co,theverge.com"
// 例) RSS_PER_DOMAIN_CAP="1"
const denyHosts = new Set(
  (process.env.RSS_EXCLUDE_DOMAINS || "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
);
// env未設定ならYAMLの max_per_domain を採用
const perDomainCap = Number(process.env.RSS_PER_DOMAIN_CAP ?? maxPerDomain);

const parser = new Parser();
const limit  = pLimit(2);
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

// --- GNewsの本文から元記事URLを抽出
function extractOriginalFromContent(htmlOrText = "") {
  const m1 = htmlOrText.match(/href="(https?:\/\/[^"]+)"/i);
  if (m1 && !/news\.google\.com|google\./.test(m1[1])) return m1[1];
  const m2 = htmlOrText.match(/https?:\/\/[^\s"<)]+/i);
  if (m2 && !/news\.google\.com|google\./.test(m2[0])) return m2[0];
  return null;
}

// GNewsリンク→元記事へ置換（url=, content, リダイレクト 3段構え）
async function resolveToOriginal(link, it) {
  if (!/news\.google\.com/.test(link)) return link;

  // 1) URLパラメータ url= or q=
  try {
    const u = new URL(link);
    const p1 = u.searchParams.get("url") || u.searchParams.get("q");
    if (p1 && /^https?:\/\//.test(p1)) return p1;
  } catch {}

  // 2) RSS中の content/summary から抽出
  const alt = extractOriginalFromContent(
    it?.["content:encoded"] || it?.content || it?.contentSnippet || it?.summary || ""
  );
  if (alt) return alt;

  // 3) 実リダイレクト追跡（manual → Location / follow → 最終URL）
  try {
    // (a) manual で Location ヘッダだけ拾う
    const res1 = await fetch(link, {
      redirect: "manual",
      headers: { "user-agent": UA },
    });
    const loc = res1.headers.get("location");
    if (loc && /^https?:\/\//.test(loc) && !/news\.google\.com|google\./.test(loc)) {
      return loc;
    }
    // (b) follow で最終URLを採用
    const res2 = await fetch(link, {
      redirect: "follow",
      headers: { "user-agent": UA },
    });
    if (res2.ok && res2.url && !/news\.google\.com|google\./.test(res2.url)) {
      return res2.url;
    }
  } catch {}
  // 取れなければ元のまま
  return link;
}

function canonicalLink(it) {
  const link = it.link || it.guid || "";
  return link || null;
}

// hostname（www.除去・小文字化）
function hostOf(u) {
  try { return new URL(u).hostname.replace(/^www\./, "").toLowerCase(); }
  catch { return "invalid"; }
}

const pickSet = new Set();

for (const s of (conf.sources ?? [])) {
  if (!s?.rss) continue;
  const feed = await parser.parseURL(s.rss).catch(() => null);
  if (!feed?.items?.length) {
    console.warn("[warn] RSS取得失敗:", s.rss);
    continue;
  }

  const rawItems = feed.items
    .filter(it => {
      const ts = it.isoDate ? Date.parse(it.isoDate)
               : it.pubDate ? Date.parse(it.pubDate)
               : Date.now();
      return Number.isFinite(ts) ? ts >= cutoff : true;
    })
    .slice(0, maxPer);

  const canonLinks = await Promise.all(rawItems.map(async (it) => {
    let link = canonicalLink(it);
    if (!link) return null;
    link = await resolveToOriginal(link, it);
    return link;
  }));

  let add = 0;
  for (const u of canonLinks.filter(Boolean)) {
    if (!pickSet.has(u)) { pickSet.add(u); add++; }
  }
  console.log("[info]", s.rss, "-> 取得:" + rawItems.length, "/ 追加:" + add, "/ 合計:" + pickSet.size);
}

// ---- 追記: 除外ドメインをここで弾く ----
let candidates = Array.from(pickSet);
const beforeExclude = candidates.length;
if (denyHosts.size) {
  candidates = candidates.filter(u => !denyHosts.has(hostOf(u)));
}
const excludedCount = beforeExclude - candidates.length;
console.log(
  "[filter] denyDomains:",
  denyHosts.size ? Array.from(denyHosts).join(",") : "(none)",
  "/ excluded:", excludedCount
);

// ドメイン偏りを抑制（env優先の perDomainCap を使用）
const byHost = {};
for (const u of candidates) (byHost[hostOf(u)] ||= []).push(u);

const balanced = [];
for (const h of Object.keys(byHost)) balanced.push(...byHost[h].slice(0, perDomainCap));

const finalList = balanced.slice(0, totalCap);
console.log(
  "[done] 候補 合計:" + pickSet.size +
  " / deny後:" + candidates.length +
  " / ドメイン調整後:" + balanced.length +
  " / 送出:" + finalList.length
);

const runSummarize = (url) => new Promise((resolve) => {
  const p = spawn("node", ["scripts/summarize_from_clip.mjs", "--url", url], { cwd: ROOT });
  p.on("close", (code) => resolve({ url, code }));
});

// 実行
let ok = 0;
for (const u of finalList) {
  const { code } = await runSummarize(u);
  // ログは“元記事URL”で出る
  console.log(code === 0 ? "[ok] articles" : "[ng] articles", u);
  if (code === 0) ok++;
}
console.log(`[rss] done: ${ok}/${finalList.length}`);
