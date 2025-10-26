// scripts/build_ai_news.mjs
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { JSDOM } from "jsdom";
import TurndownService from "turndown";
import iconv from "iconv-lite";
import jschardet from "jschardet";
import { Readability } from "@mozilla/readability";
import dayjs from "dayjs";
import sanitize from "sanitize-filename";

let _fetch = globalThis.fetch;
if (!_fetch) {
  const { default: f } = await import("node-fetch");
  _fetch = f;
}

const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith("--") && !/^\-\-\w+=/.test(a)));
const getArg = (name, def = null) => {
  const idx = args.indexOf(name);
  if (idx >= 0 && idx + 1 < args.length) return args[idx + 1];
  return def;
};

const MAX = parseInt(getArg("--max", "1"), 10);
const JP_COLS = flags.has("--jp-columns");
const SAVE_FULL = flags.has("--save-fulltext");

const ROOT = process.cwd();
const NEWS_DIR = process.env.VAULT_DIR
  ? path.join(process.env.VAULT_DIR, "news")
  : path.join(ROOT, "news");

const URL_INBOX = path.join(ROOT, "sources", "url_inbox.md");

await fs.mkdir(NEWS_DIR, { recursive: true });
await fs.mkdir(path.join(ROOT, ".cache"), { recursive: true });

function detectAndDecode(buffer) {
  try {
    const guess = jschardet.detect(buffer);
    let encoding = "utf-8";
    if (guess && guess.encoding && guess.confidence > 0.6) {
      const enc = guess.encoding.toLowerCase();
      if (enc.includes("shift") || enc.includes("932")) encoding = "shift_jis";
      else if (enc.includes("euc")) encoding = "euc-jp";
      else if (enc.includes("gb")) encoding = "gb18030";
      else encoding = enc;
    }
    let text;
    try {
      text = iconv.decode(Buffer.from(buffer), encoding);
      return { text, encoding_used: encoding };
    } catch {
      return { text: Buffer.from(buffer).toString("utf-8"), encoding_used: "utf-8" };
    }
  } catch {
    return { text: Buffer.from(buffer).toString("utf-8"), encoding_used: "utf-8" };
  }
}

async function fetchHTML(url) {
  const res = await _fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (ai-news-bot)",
      "accept": "text/html,application/xhtml+xml"
    }
  });
  const ab = await res.arrayBuffer();
  const { text, encoding_used } = detectAndDecode(Buffer.from(ab));
  return { html: text, encoding_used, status: res.status };
}

function siteDomain(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch { return ""; }
}

function extractMeta(doc) {
  const get = (sel, attr="content") => {
    const el = doc.querySelector(sel);
    return el ? (el.getAttribute(attr) || "").trim() : "";
  };
  const title = get('meta[property="og:title"]') || get('meta[name="twitter:title"]') || doc.title || "";
  const site_name = get('meta[property="og:site_name"]') || "";
  const published = get('meta[property="article:published_time"]') || get('meta[name="date"]') || "";
  const description = get('meta[name="description"]') || get('meta[property="og:description"]') || "";
  return { title, site_name, published_at: published, description };
}

function summarize(text) {
  const clean = text
    .replace(/\s+/g, " ")
    .replace(/。/g, "。 ")
    .replace(/\.([A-Za-z])/g, ". $1");

  const sentences = clean.split(/[。\.!?！？]+[\s]*/).map(s => s.trim()).filter(Boolean);

  const tldr = sentences.slice(0, 3).join("。") + (sentences.length ? "。" : "");

  const KEYWORDS = [
    "発表","公開","リリース","オープンソース","モデル","LLM","性能","パラメータ","トークン","推論","学習","精度","コスト",
    "価格","資金調達","買収","提携","統合","サポート","対応","アップデート","ベータ","一般提供","GA","API","推定","context","token",
    "context window","throughput","latency","extension","dataset","benchmark","SOTA","SOTa","論文","arXiv","embedding","蒸留"
  ];

  const scored = sentences.map((s, i) => {
    let score = 0;
    if (/\d/.test(s)) score += 1.5;
    if (s.length > 80) score += 0.5;
    if (i < 6) score += 0.5;
    const hit = KEYWORDS.some(k => s.toLowerCase().includes(k.toLowerCase()));
    if (hit) score += 1.2;
    return { s, score };
  }).sort((a,b) => b.score - a.score);

  const points = scored.slice(0, 6).map(x => x.s).filter(Boolean);

  return { tldr, points };
}

function mdEscape(s="") {
  return s.replace(/\|/g, "\\|");
}

function toFrontmatter(obj) {
  const lines = Object.entries(obj).map(([k,v]) => {
    if (Array.isArray(v)) return `${k}: [${v.map(x => `"${String(x).replace(/"/g,'\\"')}"`).join(", ")}]`;
    if (typeof v === "boolean") return `${k}: ${v ? "true" : "false"}`;
    return `${k}: "${String(v).replace(/"/g, '\\"')}"`;
  });
  return `---\n${lines.join("\n")}\n---\n`;
}

async function main() {
  const inboxRaw = await fs.readFile(URL_INBOX, "utf-8");
  const lines = inboxRaw.split("\n");
  const urls = [];
  let processedLines = [...lines];
  for (let i=0; i<lines.length; i++) {
    const m = lines[i].match(/^- \[ \] (https?:\/\/\S+)/);
    if (m) urls.push({ url: m[1], lineIndex: i });
  }

  const limit = Math.min(MAX, urls.length || 0);
  const today = dayjs().format("YYYY-MM-DD");
  const listPath = path.join(NEWS_DIR, `${today}--AI-news.md`);
  const listRows = [];

  let okCount = 0;

  for (let n=0; n<limit; n++) {
    const { url, lineIndex } = urls[n];
    try {
      const { html, encoding_used } = await fetchHTML(url);
      const dom = new JSDOM(html, { url });
      const doc = dom.window.document;
      const meta = extractMeta(doc);
      const reader = new Readability(doc);
      const article = reader.parse();

      const title = (article?.title || meta.title || doc.title || url).trim();
      const textContent = (article?.textContent || "").trim();
      const articleHTML = article?.content || "";
      const turndown = new TurndownService();
      const contentMD = turndown.turndown(articleHTML || "");

      const domain = siteDomain(url);
      const { tldr, points } = summarize(textContent || contentMD);
      const wc = (textContent || contentMD).split(/\s+/).filter(Boolean).length;
      const readingMin = Math.max(1, Math.round(wc / 500));

      const slugRaw = sanitize(title.toLowerCase().replace(/\s+/g, "-"));
      const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0,8);
      const detailFile = `${today}-${slugRaw}-${hash}.md`;
      const detailPath = path.join(NEWS_DIR, detailFile);

      const front = toFrontmatter({
        publish: true,
        title,
        date: today,
        source_url: url,
        domain,
        tags: ["ai","news"],
        word_count: wc,
        reading_min: readingMin,
        fetched_at: dayjs().toISOString(),
        published_at: meta.published_at || "",
        site_name: meta.site_name || "",
        encoding_used
      });

      let detailMD = [
        front,
        `# ${title}`,
        "",
        `**Source:** [${domain}](${url})  \u00A0  **Fetched:** ${dayjs().format("YYYY-MM-DD HH:mm")}`,
        "",
        "## TL;DR",
        tldr ? tldr : "_No summary available._",
        "",
        "## Key Points",
        ...(points.length ? points.slice(0,6).map(p => `- ${p}`) : ["- _No key points detected._"]),
        ""
      ].join("\n");

      if (SAVE_FULL) {
        detailMD += "\n## Full Text\n" + (contentMD || "_(no content)_") + "\n";
      }

      await fs.writeFile(detailPath, detailMD, "utf-8");

      listRows.push({ date: today, title, url, domain, tldr });

      processedLines[lineIndex] = lines[lineIndex].replace("- [ ]", "- [x]");

      console.log(`OK: ${title}`);
      okCount++;
    } catch (e) {
      console.error(`ERROR processing ${url}:`, e.message);
    }
  }

  if (listRows.length) {
    const header = JP_COLS
      ? ["日付","タイトル","ドメイン/媒体","要点"]
      : ["Date","Title","Domain","TL;DR"];
    const fm = toFrontmatter({
      publish: true,
      title: `AI News — ${today}`,
      date: today,
      entries: listRows.length
    });
    const tableLines = [
      `# AI News (${today})`,
      "",
      `| ${header.join(" | ")} |`,
      `| ${header.map(()=>":-").join(" | ")} |`,
      ...listRows.map(r => {
        const titleLink = `[${mdEscape(r.title)}](${r.url})`;
        const cols = JP_COLS
          ? [r.date, titleLink, mdEscape(r.domain), mdEscape(r.tldr)]
          : [r.date, titleLink, mdEscape(r.domain), mdEscape(r.tldr)];
        return `| ${cols.join(" | ")} |`;
      })
    ].join("\n") + "\n";

    await fs.writeFile(listPath, fm + tableLines, "utf-8");
  }

  await fs.writeFile(URL_INBOX, processedLines.join("\n"), "utf-8");

  console.log(`Processed ${okCount} item(s).`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});