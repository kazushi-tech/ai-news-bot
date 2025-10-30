import fs from 'node:fs/promises';
import path from 'node:path';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { markdownTable } from 'markdown-table';

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = 'Asia/Tokyo';
const NEWS_DIR = 'news';
const WEEKLY_DIR = path.join('news', 'weekly');

function weekRangeJST(d = dayjs().tz(TZ)) {
  const dow = (d.day() + 6) % 7; // Mon=0
  const start = d.subtract(dow, 'day').startOf('day');
  const end = start.add(6, 'day').endOf('day');
  return { start, end };
}

function extractRowsFromDaily(md) {
  const lines = md.split('\n');
  const headerIdx = lines.findIndex(l =>
    /\|\s*タイトル\s*\|\s*記事\s*\|\s*引用元\s*\|\s*要約\s*\|/i.test(l)
  );
  if (headerIdx === -1) return [];
  const rows = [];
  for (let i = headerIdx + 2; i < lines.length; i++) {
    const ln = lines[i];
    if (!ln.startsWith('|')) break;
    const cols = ln.split('|').slice(1, -1).map(c => c.trim());
    rows.push(cols);
  }
  return rows;
}

async function main() {
  const { start, end } = weekRangeJST();
  await fs.mkdir(WEEKLY_DIR, { recursive: true });

  const files = (await fs.readdir(NEWS_DIR))
    .filter(f => f.endsWith('--AI-news.md'))
    .map(f => path.join(NEWS_DIR, f));

  const all = [];
  for (const f of files) {
    try {
      const md = await fs.readFile(f, 'utf8');
      all.push(...extractRowsFromDaily(md));
    } catch {}
  }

  const key = r => `${r[0]}@@${r[2]}`; // タイトル+引用元
  const map = new Map(all.map(r => [key(r), r]));
  const rows = [...map.values()];

  const table = markdownTable([['タイトル','記事','引用元','要約'], ...rows], { align: ['l','c','c','l'] });
  const out = path.join(WEEKLY_DIR, `${start.format('YYYY-[W]ww')}.md`);
  const head = `# AI News Weekly (${start.format('YYYY-MM-DD')} - ${end.format('YYYY-MM-DD')})`;
  await fs.writeFile(out, `${head}\n\n${table}\n`, 'utf8');
  console.log(`Weekly written: ${out} (${rows.length} items)`);
}

await main();