import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.env.NEWS_ROOT ? path.resolve(process.env.NEWS_ROOT) : path.resolve('ai-news');
const ARTICLES = path.join(ROOT, 'articles');

function reformat(body, tldr, sourceUrl){
  const lines = body.replace(/\r\n/g,'\n').split('\n');
  // 上部の旧TL;DR表記や区切りをざっくり除去
  let i = 0;
  while (i < Math.min(20, lines.length)) {
    const L = lines[i].trim();
    if (/^>?\s*\*\*TL;DR:\*\*/i.test(L) || /^TL;DR:/i.test(L) || /^-{3,}$/.test(L)) { lines.splice(i,1); continue; }
    if (/^\*\*元記事\*\*:/.test(L)) { lines.splice(i,1); continue; }
    if (/^##\s*抽出テキスト/.test(L)) break;
    i++;
  }
  const rest = lines.join('\n').trim();

  // 元記事リンク
  const src = sourceUrl ? `**元記事**: ${sourceUrl}\n` : '';

  // 本文で先頭の箇条書き（最大5点）を抽出
  const bullets = rest.split('\n').filter(l=>/^\s*-\s+/.test(l)).slice(0,5);
  const bulletsBlock = bullets.length ? bullets.join('\n') + '\n' : '';

  // callout体裁
  const out = [
    `> [!summary] TL;DR`,
    `> ${tldr || '（要約未生成）'}`,
    '',
    bulletsBlock ? `> [!note] 要点\n${bulletsBlock}` : '',
    src,
    '---',
    rest.includes('## 抽出テキスト') ? rest : `## 抽出テキスト\n\n${rest}`
  ].filter(Boolean).join('\n');

  return out.trim() + '\n';
}

async function main(){
  await fs.mkdir(ARTICLES, { recursive: true });
  const files = (await fs.readdir(ARTICLES).catch(()=>[])).filter(f=>f.endsWith('.md'));
  let changed = 0;
  for (const f of files) {
    const fp = path.join(ARTICLES, f);
    const raw = await fs.readFile(fp, 'utf8');
    const gm = matter(raw);
    const tldr = (gm.data?.tldr || '').toString().trim();
    const src  = (gm.data?.source_url || '').toString().trim();
    const content = gm.content || '';
    const nextBody = reformat(content, tldr, src);
    const out = matter.stringify(nextBody, gm.data || {});
    if (out !== raw) { await fs.writeFile(fp, out, 'utf8'); changed++; }
  }
  console.log(`[doctor:layout] changed ${changed} file(s).`);
}
main().catch(e=>{ console.error(e); process.exit(1); });
