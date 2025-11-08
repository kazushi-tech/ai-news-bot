// file: scripts/build_index_daily.mjs
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { fileURLToPath } from 'node:url';
import { formatInTimeZone } from 'date-fns-tz';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {
  NEWS_ROOT = path.resolve(__dirname, '..', '..'),
  TIMEZONE = 'Asia/Tokyo'
} = process.env;

const ROOT = path.resolve(NEWS_ROOT);
const ARTICLES_DIR = path.join(ROOT, 'articles');
const DAILY_DIR = path.join(ROOT, 'news', 'daily');

function todayStr() {
  return formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd');
}

async function walk(dir) {
  const out = [];
  const ents = await fs.readdir(dir, { withFileTypes: true });
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p));
    else if (e.isFile() && e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

async function ensureDir() {
  await fs.mkdir(DAILY_DIR, { recursive: true });
}

function mdRow({ title, relPath, source, url }) {
  const link = `[[${relPath.replace(/\.md$/, '')}|記事ページへ]]`;
  const src = url ? `[${source || 'source'}](${url})` : (source || '');
  return `| ${title || ''} | ${link} | ${src} |`;
}

async function main() {
  const argv = process.argv.slice(2);
  const di = argv.indexOf('--date');
  const date = di !== -1 && argv[di + 1] ? argv[di + 1] : todayStr();

  await ensureDir();
  const files = await walk(ARTICLES_DIR);
  const rows = [];

  for (const fp of files) {
    const rel = path.relative(ROOT, fp).replaceAll('\\', '/'); // obsidian path
    const raw = await fs.readFile(fp, 'utf8');
    const { data } = matter(raw);
    if ((data?.created || '').slice(0, 10) !== date) continue;
    rows.push({
      title: data?.title || path.basename(fp, '.md'),
      relPath: rel,
      source: data?.source || data?.domain || '',
      url: data?.url || ''
    });
  }

  rows.sort((a, b) => a.title.localeCompare(b.title, 'ja'));

  const out = [
    `# AI News — ${date}`,
    '',
    '| タイトル | 記事ページへ | 引用元 |',
    '|---|---|---|',
    ...rows.map(mdRow),
    ''
  ].join('\n');

  const outPath = path.join(DAILY_DIR, `${date}.md`);
  await fs.writeFile(outPath, out, 'utf8');
  console.log(`[ok] ${path.relative(ROOT, outPath)}`);
}

main().catch(err => {
  console.error('[error]', err);
  process.exit(1);
});
