// scripts/pick_ai_week.mjs
import fs from "fs/promises";
import path from "path";
import Parser from "rss-parser";
import dayjs from "dayjs";

const ROOT = process.cwd();
const URL_INBOX = path.join(ROOT, "sources", "url_inbox.md");
const SEEN_PATH = path.join(ROOT, ".cache", "seen.json");

const parser = new Parser();

const FEEDS = [
  "https://openai.com/blog/rss/",
  "https://huggingface.co/blog/feed.xml",
  "https://research.google/feeds/pub/",
  "https://ai.googleblog.com/feeds/posts/default",
  "https://stability.ai/blog/rss.xml",
  "https://www.deepmind.com/blog/rss.xml",
  "https://arxiv.org/rss/cs.AI",
  "https://www.anthropic.com/index.xml"
];

function scoreItem(it) {
  let s = 0;
  const title = (it.title || "").toLowerCase();
  const now = dayjs();
  const d = it.isoDate ? dayjs(it.isoDate) : (it.pubDate ? dayjs(it.pubDate) : null);
  if (d) {
    const days = Math.max(0, now.diff(d, "day"));
    s += Math.max(0, 30 - days);
  }
  if (/\b(llm|gpt|open-source|release|model|dataset|benchmark|embedding|inference)\b/.test(title)) s += 20;
  if (/open|release|ga|beta|paper|arxiv|model/.test(title)) s += 10;
  if (/guide|tutorial|opinion/.test(title)) s += 3;
  if (/weekly|roundup/.test(title)) s += 1;
  if (/job|hiring/.test(title)) s -= 5;
  if (/podcast/.test(title)) s -= 3;
  return s;
}

async function main() {
  const inboxRaw = await fs.readFile(URL_INBOX, "utf-8").catch(()=>"# URL Inbox\n\n");
  const lines = inboxRaw.split("\n");
  const current = new Set(lines.map(l => {
    const m = l.match(/^- \[ \] (https?:\/\/\S+)/);
    return m ? m[1] : null;
  }).filter(Boolean));

  let seen = {};
  try { seen = JSON.parse(await fs.readFile(SEEN_PATH, "utf-8")); } catch {}
  if (!seen || typeof seen !== "object") seen = {};

  const candidates = [];
  for (const feed of FEEDS) {
    try {
      const out = await parser.parseURL(feed);
      for (const it of out.items || []) {
        const link = it.link || "";
        if (!link || current.has(link) || seen[link]) continue;
        candidates.push({ link, title: it.title || "", score: scoreItem(it) });
      }
    } catch (e) {
      console.error("RSS error:", feed, e.message);
    }
  }

  candidates.sort((a,b) => b.score - a.score);
  const pick = candidates.slice(0, 50);
  const toAppend = pick.map(x => `- [ ] ${x.link}`).join("\n");

  const newMd = inboxRaw.replace(/\s+$/, "") + "\n" + toAppend + (toAppend ? "\n" : "");
  await fs.writeFile(URL_INBOX, newMd, "utf-8");

  for (const x of pick) seen[x.link] = { added_at: dayjs().toISOString() };
  await fs.writeFile(SEEN_PATH, JSON.stringify(seen, null, 2), "utf-8");

  console.log(`Appended ${pick.length} URL(s) to inbox.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});