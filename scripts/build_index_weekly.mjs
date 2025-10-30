import fs from 'node:fs';
import path from 'node:path';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc); dayjs.extend(timezone);

const TZ = 'Asia/Tokyo';
const ROOT = process.cwd();
const NEWS = path.join(ROOT, 'news');
const OUT = path.join(NEWS, 'index-weekly.md');

const now = dayjs().tz(TZ);
const dow = (now.day() + 6) % 7; // Mon=0
const start = now.subtract(dow, 'day').startOf('day');
const days = Array.from({ length: 7 }, (_, i) => start.add(i, 'day'));

let md = `# 週間インデックス\n\n生成日: ${now.format('YYYY-MM-DD')}\n\n`;
for (const d of days) {
  const stem = `${d.format('YYYY-MM-DD')}--AI-news`;
  const file = path.join(NEWS, `${stem}.md`);
  if (fs.existsSync(file)) {
    md += `## ${d.format('YYYY-MM-DD')}\n\n![[${stem}]]\n\n`;
  }
}
fs.writeFileSync(OUT, md, 'utf8');
console.log('index written:', OUT);