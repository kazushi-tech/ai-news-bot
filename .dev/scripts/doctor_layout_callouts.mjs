// file: .dev/scripts/doctor_layout_callouts.mjs
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.env.NEWS_ROOT || './ai-news';
const ART  = path.join(ROOT, 'articles');

const SECTIONS = [
  '概要','詳細レポート','抽出テキスト',
  '具体的なポイント','重要な示唆','リスク・未確定要素','引用・ソース'
];

function splitByH2(md){
  const lines = md.replace(/\r\n/g,'\n').split('\n');
  const out = { head: [], sections: [] };
  let cur = null;
  for(const ln of lines){
    const m = ln.match(/^##\s+(.+?)\s*$/);
    if(m){ if(cur) out.sections.push(cur); cur = { title:m[1].trim(), body:[] }; continue; }
    (cur ? cur.body : out.head).push(ln);
  }
  if(cur) out.sections.push(cur);
  return out;
}

function normalize(md, tldr, sourceUrl){
  // 1) H1は保持・それ以降の#は##へ
  const lines = md.replace(/\r\n/g,'\n').split('\n');
  const out = [];
  if(/^#\s+/.test(lines[0])) out.push(lines[0]);
  for(let i=(/^#\s+/.test(lines[0])?1:0); i<lines.length; i++){
    out.push(/^#\s+/.test(lines[i]) ? lines[i].replace(/^#\s+/,'## ') : lines[i]);
  }
  let body = out.join('\n');

  // 2) コールアウト/引用の残骸を除去
  body = body
    .replace(/^\s*>\s*\[\!\s*(summary|info|note|tip).*$/gmi,'')
    .replace(/^(>\s.*\n?)+/gmi,'')
    .replace(/\u00A0/g,' ') // ノーブレークスペース対策
    ;

  // 3) TL;DRは見出しで単一化
  const t = (tldr||'').toString().trim() || '（要約準備中）';
  const tldrBlock = `\n## TL;DR\n\n${t}\n`;

  // 4) 既存セクションを吸い上げ（定義済み見出しだけ採用）
  const { head, sections } = splitByH2(body);
  const map = new Map();
  for(const s of sections){
    const key = SECTIONS.find(k => s.title.startsWith(k));
    if(!key) continue;
    const text = (s.body.join('\n')||'').trim();
    if(!map.has(key) && text) map.set(key, text);
  }

  // 5) 引用・ソースの冪等化：既存の「- 元記事:」等を除去 → 1本だけ入れる
  const srcLines = (map.get('引用・ソース') || '').split('\n')
    .filter(l => l.trim() && !/^-\s*(元記事|source|Source)\s*:/i.test(l.trim()));
  if(sourceUrl) srcLines.unshift(`- 元記事: ${sourceUrl}`);
  map.set('引用・ソース', srcLines.join('\n').trim());

  // 6) 組み立て（空ブロックは見出しだけ残してOK）
  const rebuilt = [
    head.join('\n').trim(),
    tldrBlock.trim(),
    ...SECTIONS.map(k => {
      const body = (map.get(k)||'').trim();
      return `\n## ${k}\n\n${body}`;
    })
  ].join('\n').replace(/\n{3,}/g,'\n\n').trim() + '\n';

  return rebuilt;
}

async function fixFile(fp){
  const raw = await fs.readFile(fp, 'utf8');
  const fm  = matter(raw);
  const nextBody = normalize(fm.content, String(fm.data.tldr||''), String(fm.data.source_url||''));
  const next = matter.stringify(nextBody, fm.data);
  if(next !== raw){ await fs.writeFile(fp, next, 'utf8'); return true; }
  return false;
}

(async()=>{
  const files = (await fs.readdir(ART).catch(()=>[])).filter(f=>f.endsWith('.md'));
  let changed=0;
  for(const f of files){ if(await fixFile(path.join(ART, f)).catch(()=>false)) changed++; }
  console.log(`[doctor:layout] changed ${changed} file(s).`);
})().catch(e=>{ console.error(e); process.exit(1); });
