// scripts/pick_ai_week.mjs
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
const WEEKLY_DIR = 'weekly';

function weekRangeJST(d = dayjs().tz(TZ)) {
  const dow = (d.day() + 6) % 7; // Mon=0 ... Sun=6
  const start = d.subtract(dow, 'day').startOf('day');
  const end = start.add(6, 'day').endOf('day');
  return { start, end };
}

function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?/);
  const body = md.replace(/^---[\s\S]*?---\n?/, '');
  return { body, fm: m ? m[1] : '' };
}

async function collectNewsFiles() {
  try {
    const files = await fs.readdir(NEWS_DIR);
    return files.filter(f => f.endsWith('.md')).map(f => path.join(NEWS_DIR, f));
  } catch {
    return [];
  }
}

function extractRowsFromDaily(body) {
  const lines = body.split('\n');
  const headerIdx = lines.findIndex(l =>
    /\|\s*日付\s*\|\s*タイトル\s*\|\s*ソース\s*\|\s*要約\s*\|\s*URL\s*\|/i.test(l)
  );
  if (headerIdx === -1) return [];
  const dataLines = [];
  for (let i = headerIdx + 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith('|')) break;
    dataLines.push(line);
  }
  return dataLines.map(line => {
    const cols = line.split('|').slice(1, -1).map(c => c.trim());
    return {
      date: cols[0] || '',
      title: cols[1] || '',
      source: cols[2] || '',
      summary: cols[3] || '',
      url: cols[4] || ''
    };
  });
}

function markdownWeekly({ start, end }, rows) {
  const title = `AI News Weekly (${start.format('YYYY-MM-DD')} — ${end.format('YYYY-MM-DD')})`;
  const header = ['日付', 'タイトル', 'ソース', '要約', 'URL'];
  const table = markdownTable(
    [header, ...rows.map(r => [r.date, r.title, r.source, r.summary, r.url])],
    { align: ['c', 'l', 'c', 'l', 'l'] }
  );
  return `---\ncssclass: ai-weekly\n---\n# ${title}\n\n> 期間: ${start.format('YYYY-MM-DD')}〜${end.format('YYYY-MM-DD')}（JST）\n\n${table}\n`;
}

async function main() {
  const { start, end } = weekRangeJST();
  const files = await collectNewsFiles();
  const rows = [];
  for (const f of files) {
    const md = await fs.readFile(f, 'utf8');
    const { body } = parseFrontmatter(md);
    const rs = extractRowsFromDaily(body);
    for (const r of rs) {
      const d = dayjs.tz(r.date, TZ);
      if (!d.isValid()) continue;
      if (d.isSame(start) || (d.isAfter(start) && d.isBefore(end.add(1, 'day')))) rows.push(r);
    }
  }
  await fs.mkdir(WEEKLY_DIR, { recursive: true });
  const out = path.join(WEEKLY_DIR, `${start.format('YYYY-[W]ww')}.md`);
  await fs.writeFile(out, markdownWeekly({ start, end }, rows), 'utf8');
  console.log(\`Weekly written: \${out} (\${rows.length} items)\`);
}
await main();
