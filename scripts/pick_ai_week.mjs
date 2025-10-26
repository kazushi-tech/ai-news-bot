// scripts/pick_ai_week.mjs
// 最近7日分のAI関連RSSを走査し、スコア上位を sources/url_inbox.md に追記します。
// 依存: rss-parser, minimist, dayjs

import fs from 'fs';
import Parser from 'rss-parser';
import minimist from 'minimist';
import dayjs from 'dayjs';

const args = minimist(process.argv.slice(2), {
  alias: { max: 'm' },
  default: { max: 20 }
});

const parser = new Parser();
const FEEDS = [
  // English
  'https://openai.com/index.xml',
  'https://ai.googleblog.com/atom.xml',
  'https://huggingface.co/blog/feed.xml',
  'https://feeds.feedburner.com/TechCrunch/artificial-intelligence',
  'https://www.theverge.com/rss/index.xml',
  'https://www.anthropic.com/rss.xml',
  // Japanese (a few tech/AI related; adjust as you like)
  'https://news.yahoo.co.jp/rss/topics/it.xml',
  'https://japan.zdnet.com/feed/',
  'https://techcrunch.com/wp-json/wp/v2/feed?lang=ja'
];

function scoreItem(item) {
  const now = dayjs();
  const pub = item.isoDate ? dayjs(item.isoDate) : (item.pubDate ? dayjs(item.pubDate) : null);
  const ageDays = pub && pub.isValid() ? Math.max(0, now.diff(pub, 'day')) : 30;

  const title = String(item.title || '');
  const lower = title.toLowerCase();
  let s = 0;
  if (ageDays <= 7) s += (7 - ageDays); // fresher is better
  const kws = ['ai','llm','gpt','anthropic','openai','google','meta','microsoft','nvidia','生成','モデル','論文','研究','発表','公開'];
  for (const k of kws) if (lower.includes(k)) s += 2;
  if (/paper|arxiv|benchmark|ベンチマーク/i.test(title)) s += 1;
  return s;
}

async function main() {
  const entries = [];
  for (const url of FEEDS) {
    try {
      const feed = await parser.parseURL(url);
      for (const item of feed.items || []) {
        if (!item.link) continue;
        const s = scoreItem(item);
        entries.push({ link: item.link, title: item.title || '', score: s });
      }
    } catch (e) {
      console.log('Feed NG:', url, e.message);
    }
  }

  entries.sort((a,b)=> b.score - a.score);
  const top = entries.slice(0, Number(args.max) || 20);

  const lines = top.map(e => `- [ ] ${e.link}`).join('\n');
  fs.mkdirSync('sources', { recursive: true });
  fs.appendFileSync('sources/url_inbox.md', '\n' + lines + '\n', 'utf8');
  console.log(`Appended ${top.length} URL(s) to sources/url_inbox.md`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});