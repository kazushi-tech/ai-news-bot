// tests/extract.test.mjs
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

// 本番ロジックの簡易版
function parseJsonSafe(txt) { try { return JSON.parse(txt); } catch { return null; } }
const firstOf = (v) => Array.isArray(v) ? v[0] : v;
function extractFromJsonLd(doc) {
  const scripts = [...doc.querySelectorAll('script[type="application/ld+json"]')];
  for (const s of scripts) {
    const raw = s.textContent?.trim() ?? '';
    const json = parseJsonSafe(raw);
    if (!json) continue;
    const candidates = Array.isArray(json) ? json : [json];
    for (const c of candidates) {
      const type = (firstOf(c['@type']) ?? '').toString().toLowerCase();
      if (['article','newsarticle','blogposting'].includes(type)) {
        const body = c.articleBody || c.text || '';
        if (typeof body === 'string' && body.trim().length > 0) {
          return { title: c.headline || '', articleBody: body };
        }
      }
    }
  }
  return null;
}

describe('JSON-LD extraction', () => {
  it('handles array ld+json', () => {
    const html = `<!doctype html><script type="application/ld+json">[
      {"@type":"NewsArticle","headline":"T","articleBody":"abc def"}
    ]</script>`;
    const doc = new JSDOM(html).window.document;
    const r = extractFromJsonLd(doc);
    expect(r).not.toBeNull();
    expect(r.articleBody).toContain('abc');
  });

  it('ignores invalid JSON', () => {
    const html = `<!doctype html><script type="application/ld+json">{bad json}</script>`;
    const doc = new JSDOM(html).window.document;
    const r = extractFromJsonLd(doc);
    expect(r).toBeNull();
  });
});
