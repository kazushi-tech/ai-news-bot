import fs from 'node:fs/promises';
import fssync from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import TurndownService from 'turndown';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { franc } from 'franc-min';
import langs from 'langs';

const td = new TurndownService();

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const ensureDir = async (p) => fs.mkdir(p, { recursive: true });

export const readJson = async (p, def = []) => {
  try { return JSON.parse(await fs.readFile(p, 'utf8')); } catch { return def; }
};
export const writeJson = (p, data) => fs.writeFile(p, JSON.stringify(data, null, 2));

export const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex');

export function stripUtm(url) {
  try {
    const u = new URL(url);
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','utm_id','gclid','fbclid','igshid'].forEach(k => u.searchParams.delete(k));
    return u.toString();
  } catch { return url; }
}

export function toSlug(s = '') {
  return s.toLowerCase().replace(/[^\p{Script=Han}\p{Letter}\p{Number}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 100);
}

export function jstDateStr(d = new Date()) {
  const fmt = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' });
  const parts = Object.fromEntries(fmt.formatToParts(d).map(p => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export async function fetchHTML(url, timeoutMs = 20000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': 'ai-news-bot/0.1 (+github.com/kazushi-tech/ai-news-bot)' },
    signal: ctrl.signal
  }).catch(e => { throw new Error(`fetch fail: ${e}`); });
  clearTimeout(t);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

export function extractArticle(html, baseUrl) {
  const dom = new JSDOM(html, { url: baseUrl });
  const reader = new Readability(dom.window.document);
  const art = reader.parse();
  if (!art) return null;
  const md = td.turndown(art.content || '');
  return {
    title: (art.title || '').trim(),
    byline: (art.byline || '').trim(),
    siteName: (dom.window.document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') || '').trim(),
    excerpt: (art.excerpt || '').trim(),
    textContent: art.textContent || '',
    markdown: md
  };
}

export function detectLang(text) {
  const code3 = franc(text || '', { minLength: 20 });
  try {
    const info = langs.where('3', code3);
    return info ? { code: info['1'], name: info.name } : { code: 'und', name: 'Unknown' };
  } catch {
    return { code: 'und', name: 'Unknown' };
  }
}

export function domainFromUrl(u) {
  try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; }
}

export function tagsFromDomain(u) {
  const d = domainFromUrl(u);
  const map = {
    'openai.com': ['OpenAI','LLM'],
    'anthropic.com': ['Anthropic','LLM'],
    'huggingface.co': ['HuggingFace','OSS'],
    'googleblog.com': ['Google','Research'],
    'deepmind.google': ['Google','Research'],
    'arxiv.org': ['Paper'],
  };
  return map[d] || [];
}

export async function copyToVaultDir(vaultDir) {
  if (!vaultDir) return;
  const src = path.resolve('news');
  const dst = path.resolve(vaultDir, 'news');
  if (!fssync.existsSync(src)) return;
  await ensureDir(dst);
  await fs.cp(src, dst, { recursive: true });
}

export function tableHeader({ jp = false } = {}) {
  return jp
    ? `| 時刻(JST) | タイトル | 出典 | 言語 | タグ |\n|---|---|---|---|---|\n`
    : `| Time(JST) | Title | Source | Lang | Tags |\n|---|---|---|---|---|\n`;
}
