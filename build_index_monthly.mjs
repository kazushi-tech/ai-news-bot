import fs from 'node:fs';
import path from 'node:path';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc); dayjs.extend(timezone);

const TZ = 'Asia/Tokyo';
const ROOT = process.cwd();
const NEWS = path.join(ROOT, 'news');
const OUT = path.join(NEWS, 'index-monthly.md');

const now = dayjs().tz(TZ);
const monthStem = now.format('YYYY-MM');
const files = fs.readdirSync(NEWS).filter(f => f.endsWith('--AI-news.md') && f.startsWith(monthStem));

let md = `# 月間インデックス\n\n生成日: ${now.format('YYYY-MM-DD')}\n\n`;
for (const f of files.sort()) {
  const date = f.slice(0, 10);
  md += `## ${date}\n\n![[${f.replace(/\.md$/, '')}]]\n\n`;
}

fs.writeFileSync(OUT, md, 'utf8');
console.log('index-monthly written:', OUT, `(dates: ${files.length})`);
