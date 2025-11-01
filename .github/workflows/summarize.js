// summarize.js（抜粋）
import fs from 'node:fs';

async function fetchWithFallback(rawUrl) {
  const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36';
  const headers = { 'user-agent': ua, 'accept-language': 'ja,en;q=0.9' };
  const clean = rawUrl.trim();

  const candidates = [
    clean,
    // AMP 試行（Bloomberg系）
    clean.includes('bloomberg') ? (clean + (clean.includes('?') ? '&' : '?') + 'output=amp') : null,
    // テキストプロキシ
    `https://r.jina.ai/http://${clean.replace(/^https?:\/\//, '')}`
  ].filter(Boolean);

  for (const url of candidates) {
    try {
      const res = await fetch(url, { headers, redirect: 'follow' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (text && text.length > 500) {
        return { url, body: text };
      }
    } catch (e) {
      console.error('[fetch fail]', url, String(e));
    }
  }
  throw new Error('All fetch fallbacks failed');
}

async function main() {
  const url = process.argv[2];
  if (!url) throw new Error('URL is required');
  const { url: fetchedFrom, body } = await fetchWithFallback(url);

  // ↓ ここで body を要約器に渡す
  console.log('[fetched]', fetchedFrom, 'len=', body.length);
  // summarize(body) 的な処理へ…
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
