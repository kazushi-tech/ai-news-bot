// Node 20+ (ESM)
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const idx = args.findIndex(a => a === '--url' || a === '-u');
const url = idx >= 0 ? args[idx + 1] : args[0];

if (!url) {
  console.error('Usage: node scripts/summarize.mjs --url <URL>  (or positional URL)');
  process.exit(1);
}
try { new URL(url); } catch { console.error(`Invalid URL: ${url}`); process.exit(1); }

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  console.log(`Fetching: ${url}`);
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  const html = await res.text();
  const text = stripHtml(html);

  // 超簡易の抜粋（本番は要約ロジックに差し替え）
  const excerpt = text.slice(0, 2000);
  const summary = `# Summary\n\nURL: ${url}\n\n## Extracted (truncated)\n\n${excerpt}\n`;

  // 必ず summary/ に出力（teeでMDは書かれるが、念のためHTMLも残す）
  const outDir = 'summary';
  fs.mkdirSync(outDir, { recursive: true });
  const base = (new URL(url).host || 'result').replace(/[^a-z0-9]+/gi, '-');
  fs.writeFileSync(path.join(outDir, `${base}.html`),
    `<!doctype html><meta charset="utf-8"><title>Summary</title><pre>${
      summary.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))
    }</pre>`);

  // 標準出力にも出す（workflowの tee が summary/summary.md に保存）
  console.log(summary);
}

main().catch(err => { console.error(err); process.exit(1); });
