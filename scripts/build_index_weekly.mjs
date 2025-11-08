// file: scripts/build_index_weekly.mjs
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
const WEEKLY_DIR = path.join(ROOT, 'news', 'weekly');

async function ensureDir() {
  await fs.mkdir(WEEKLY_DIR, { recursive: true });
}

function getIsoYearWeek(d, tz) {
  const s = formatInTimeZone(d, tz, "yyyy-'W'II"); // e.g. 2025-W45
  return s;
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

function mdRow({ title, relPath, source, url }) {
  const link = `[[${relPath.replace(/\.md$/, '')}|記事ページへ]]`;
  const src = url ? `[${source || 'source'}](${url})` : (source || '');
  return `| ${title || ''} | ${link} | ${src} |`;
}

async function main() {
  const argv = process.argv.slice(2);
  const yi = argv.indexOf('--year');
  const wi = argv.indexOf('--week');

  const now = new Date();
  const iso = getIsoYearWeek(now, TIMEZONE); // "YYYY-Www"
  const defYear = Number(iso.slice(0, 4));
  const defWeek = Number(iso.slice(6));

  const year = yi !== -1 && argv[yi + 1] ? Number(argv[yi + 1]) : defYear;
  const week = wi !== -1 && argv[wi + 1] ? Number(argv[wi + 1]) : defWeek;

  await ensureDir();
  const files = await walk(ARTICLES_DIR);
  const rows = [];

  for (const fp of files) {
    const raw = await fs.readFile(fp, 'utf8');
    const { data } = matter(raw);
    const created = (data?.created || '').slice(0, 10);
    if (!created) continue;
    const isoYW = getIsoYearWeek(new Date(`${created}T00:00:00Z`), TIMEZONE);
    const y = Number(isoYW.slice(0, 4));
    const w = Number(isoYW.slice(6));
    if (y !== year || w !== week) continue;

    const rel = path.relative(ROOT, fp).replaceAll('\\', '/');
    rows.push({
      title: data?.title || path.basename(fp, '.md'),
      relPath: rel,
      source: data?.source || data?.domain || '',
      url: data?.url || ''
    });
  }

  rows.sort((a, b) => a.title.localeCompare(b.title, 'ja'));

  const label = `${year}-W${String(week).padStart(2, '0')}`;
  const out = [
    `# AI News — Weekly ${label}`,
    '',
    '| タイトル | 記事ページへ | 引用元 |',
    '|---|---|---|',
    ...rows.map(mdRow),
    ''
  ].join('\n');

  const outPath = path.join(WEEKLY_DIR, `${label}.md`);
  await fs.writeFile(outPath, out, 'utf8');
  console.log(`[ok] ${path.relative(ROOT, outPath)}`);
}

main().catch(err => {
  console.error('[error]', err);
  process.exit(1);
});
