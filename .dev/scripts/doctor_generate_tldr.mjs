import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { fetch as undiciFetch } from 'undici';

const ROOT = process.env.NEWS_ROOT || './ai-news';
const ART  = path.join(ROOT, 'articles');

const API_KEY = process.env.GOOGLE_API_KEY || '';
const MODEL   = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

async function geminiSummarize(text){
  if(!API_KEY) throw new Error('NO_GOOGLE_API_KEY');

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  const prompt = [
    '以下の本文を、日本語で3行以内の箇条書きTL;DRにしてください。',
    '・事実ベースで簡潔に',
    '・主語を補い、省略語は避ける',
    '・推測や宣伝は入れない'
  ].join('\n');

  const input = (text || '').slice(0, 9000); // ざっくり制限
  const res = await undiciFetch(endpoint, {
    method: 'POST',
    headers: { 'content-type':'application/json' },
    body: JSON.stringify({
      contents: [{ role:'user', parts:[{text: `${prompt}\n\n---\n${input}`}]}]
    })
  });

  if(!res.ok) throw new Error(`GEMINI_HTTP_${res.status}`);
  const data = await res.json();
  const cand = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return cand.trim();
}

function fallbackTLDR(text){
  const clean = (text||'').replace(/\s+/g,' ').trim();
  if(!clean) return '本文が取得できませんでした。見出しと冒頭を確認してください。';
  // 先頭の文を3つ程度
  const sentences = clean.split(/(?<=。|！|!|？|\?)\s*/).slice(0, 3);
  return sentences.map(s=>`・${s.trim()}`).join('\n');
}

async function runOne(fp){
  const raw = await fs.readFile(fp, 'utf8');
  const parsed = matter(raw);
  if(parsed.data.tldr && String(parsed.data.tldr).trim()) return false;

  const body = parsed.content.replace(/> \[\!summary\][\s\S]*?\n(?=##|$)/i,''); // 既存TL;DR除去
  const text = body
    .replace(/```[\s\S]*?```/g,'')
    .replace(/#+\s.+/g,'')
    .replace(/>\s.+/g,'')
    .slice(0, 16000);

  let tldr = '';
  try {
    tldr = (await geminiSummarize(text)).trim();
  } catch (e){
    tldr = fallbackTLDR(text);
  }

  parsed.data.tldr = tldr;
  const out = matter.stringify(parsed.content, parsed.data);
  if(out !== raw){
    await fs.writeFile(fp, out, 'utf8');
    return true;
  }
  return false;
}

async function main(){
  const files = (await fs.readdir(ART).catch(()=>[])).filter(f=>f.endsWith('.md'));
  let changed = 0;
  for(const f of files){
    const fp = path.join(ART, f);
    const ok = await runOne(fp).catch(()=>false);
    if(ok) changed++;
  }
  console.log(`[doctor:tldr] changed ${changed}`);
}
main().catch(e=>{ console.error(e); process.exit(1); });
