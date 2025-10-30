import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { spawn } from 'node:child_process';

dayjs.extend(utc); dayjs.extend(timezone);

const TZ = process.env.TZ || 'Asia/Tokyo';

export function toJST(date) { return dayjs(date).tz(TZ); }
export function formatYMD(date) { return toJST(date).format('YYYY-MM-DD'); }

export async function fetchFulltext(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'ai-news-bot (github actions)' } });
  const html = await res.text();
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decodeHtml(titleMatch[1]) : url;
  let content = (html.match(/<article[\s\S]*?<\/article>/i) || [])[0] || html;
  content = content.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<noscript[\s\S]*?<\/noscript>/gi,'');
  return { title, content };
}
function decodeHtml(s){ return s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'"); }

export function htmlToMd(html){
  const strip = (x)=>x.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
  let md = html;
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi,(_,t)=>`# ${strip(t)}\n\n`);
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi,(_,t)=>`## ${strip(t)}\n\n`);
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi,(_,t)=>`### ${strip(t)}\n\n`);
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi,(_,t)=>`${strip(t)}\n\n`);
  md = md.replace(/<br\s*\/?>/gi,`\n`);
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi,(_,t)=>`- ${strip(t)}\n`);
  md = md.replace(/<\/?(ul|ol)[^>]*>/gi,`\n`);
  md = md.replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,(_,href,text)=>`[${strip(text)}](${href})`);
  md = md.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]+)"[^>]*>/gi,(_,alt,src)=>`![${alt or ''}](${src})`);
  md = md.replace(/<[^>]+>/g,'');
  md = md.replace(/\n{3,}/g,'\n\n');
  return md.trim();
}

export async function translateJa(text){
  const s=(text||'').trim();
  if(!s) return '';
  if(/[一-龠ぁ-んァ-ヶ]/.test(s)) return s;
  const p = spawn('python',['scripts/translate_argos.py'],{stdio:['pipe','pipe','inherit']});
  p.stdin.end(s,'utf8');
  const chunks=[]; for await (const c of p.stdout) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8').trim();
}
