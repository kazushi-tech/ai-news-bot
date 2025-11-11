// scripts/append_inbox.mjs
import fs from 'node:fs';
import path from 'node:path';

const payload = JSON.parse(process.argv[2] || '{}');
const urls = Array.isArray(payload.urls) ? payload.urls : [];
if (!urls.length) { console.log('No urls in payload'); process.exit(0); }

const ROOT = process.cwd();
const FILE = path.join(ROOT, 'sources', 'url_inbox.md');
fs.mkdirSync(path.dirname(FILE), { recursive: true });

const old = fs.existsSync(FILE) ? fs.readFileSync(FILE, 'utf8') : '';
const existing = new Set();
for (const line of old.split('\n')) {
  const m = line.match(/^- \[.\] (https?:\/\/\S+)/);
  if (m) existing.add(normalizeUrl(m[1]));
}

const add = [];
for (const u of urls.map(normalizeUrl)) {
  if (!existing.has(u)) add.push(`- [ ] ${u}`);
}
if (!add.length) { console.log('No new URL to append'); process.exit(0); }

// 先頭に追加（新しい順）
const out = `${add.join('\n')}\n${old}`;
fs.writeFileSync(FILE, out, 'utf8');
console.log(`Appended ${add.length} url(s).`);

function normalizeUrl(u) {
  try {
    const url = new URL(u);
    url.hash = '';
    const bad = ['utm_', 'gclid', 'fbclid', 'igshid', 'mc_', 'ref', 'ref_src', 'spm'];
    for (const k of [...url.searchParams.keys()]) if (bad.some(b => k.startsWith(b))) url.searchParams.delete(k);
    url.pathname = url.pathname.replace(/\/+$/,'');
    return url.toString();
  } catch { return u.trim(); }
}
