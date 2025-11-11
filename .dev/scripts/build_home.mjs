import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.env.NEWS_ROOT || './ai-news';
const OUT  = path.join(ROOT, 'index.md');

const HOME_LIMIT   = Number(process.env.HOME_LIMIT || 12);
const FRESH_DAYS   = Number(process.env.FRESH_DAYS || 10);
const IGNORE_REGEX = (process.env.IGNORE_PATTERNS || '').trim();
const IGNORE = IGNORE_REGEX ? new RegExp(IGNORE_REGEX, 'i') : null;

const clampStyle = [
  'max-width:540px',
  'display:-webkit-box',
  '-webkit-box-orient:vertical',
  '-webkit-line-clamp:2',
  'overflow:hidden',
  'line-height:1.35',
  'font-weight:600'
].join(';');

const tdStyle = 'vertical-align:top;padding:8px;border-bottom:1px solid #ddd;';
const linkStyle = 'text-decoration:none;';

function isFresh(fileBase){
  // YYYY-MM-DD--host--slug.md
  const m = fileBase.match(/^(\d{4}-\d{2}-\d{2})--/);
  if(!m) return true;
  const d = new Date(m[1] + 'T00:00:00+09:00');
  const age = (Date.now() - d.getTime()) / (1000*60*60*24);
  return age <= FRESH_DAYS;
}

function escHtml(s=''){
  return s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

async function main(){
  const artDir = path.join(ROOT, 'articles');
  const files = (await fs.readdir(artDir).catch(()=>[]))
    .filter(f=>f.endsWith('.md') && (!IGNORE || !IGNORE.test(f)))
    .sort().reverse();

  const rows = [];
  for(const f of files){
    if(rows.length >= HOME_LIMIT) break;
    if(!isFresh(f)) continue;

    const fp = path.join(artDir, f);
    const raw = await fs.readFile(fp,'utf8');
    const { data } = matter(raw);
    const title = (data.title || f).trim();
    const src   = (data.source_url || '').trim();
    const host  = (data.host || '').trim();

    const titleCell = `<div style="${clampStyle}">${escHtml(title)}</div>`;
    const articleHref = `articles/${f}`;
    const articleLink = `<a href="${articleHref}" style="${linkStyle}">記事ページへ</a>`;
    const sourceLink  = src ? `<a href="${escHtml(src)}" style="${linkStyle}">${escHtml(host || '引用元')}</a>` : '';

    rows.push(`<tr>
<td style="${tdStyle}">${titleCell}</td>
<td style="${tdStyle};width:180px">${articleLink}</td>
<td style="${tdStyle};width:220px">${sourceLink}</td>
</tr>`);
  }

  const table = `<table style="width:100%;border-collapse:collapse;">
<thead>
<tr>
<th style="${tdStyle}">タイトル</th>
<th style="${tdStyle}">記事ページへ</th>
<th style="${tdStyle}">引用元</th>
</tr>
</thead>
<tbody>
${rows.join('\n')}
</tbody>
</table>`;

  const head = `# AI News Index

> ※ インラインstyleのみ。セル内2行クランプ。HOME_LIMIT=${HOME_LIMIT}, FRESH_DAYS=${FRESH_DAYS}

`;

  await fs.writeFile(OUT, head + table + '\n', 'utf8');
  console.log(`Wrote index: ${path.relative('.', OUT)} | rows: ${rows.length}`);
}

main().catch(e=>{ console.error(e); process.exit(1); });
