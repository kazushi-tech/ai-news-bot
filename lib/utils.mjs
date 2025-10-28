// lib/utils.mjs
import normalizeUrl from 'normalize-url';
import jaconv from 'jaconv';
import stringSimilarity from 'string-similarity';
import fs from 'node:fs/promises';
import path from 'node:path';

const CACHE_DIR = '.cache';
const SEEN_PATH = path.join(CACHE_DIR, 'seen.json');

export async function loadSeen() {
  try {
    const raw = await fs.readFile(SEEN_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
export async function saveSeen(arr) {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(SEEN_PATH, JSON.stringify(arr, null, 2));
}

export function canonUrl(u) {
  try {
    return normalizeUrl(u, {
      stripWWW: true,
      removeQueryParameters: [
        'utm_source','utm_medium','utm_campaign','utm_term','utm_content',
        'utm_id','gclid','fbclid','spm','igshid','ref','ref_src'
      ],
      removeTrailingSlash: true,
      removeDirectoryIndex: true,
      sortQueryParameters: true
    });
  } catch { return u; }
}

export function titleKey(t) {
  if (!t) return '';
  // NFKC標準化→全角→半角→ひらがな→カタカナ→空白/記号の削り
  let s = t.normalize('NFKC');
  s = jaconv.toHan(s);
  s = jaconv.toKatakana(s);
  s = s.toLowerCase();
  s = s.replace(/[“”"'\u3000\s]+/g, ' ').trim();
  s = s.replace(/[()[\]{}|/\\!?@#$%^&*_=+~:;.,<>-]/g, ''); // 記号ざっくり除去
  return s;
}

export function similarTitle(a, b, threshold = 0.88) {
  if (!a || !b) return false;
  const ka = titleKey(a), kb = titleKey(b);
  const score = stringSimilarity.compareTwoStrings(ka, kb);
  return score >= threshold;
}

export function dedupItems(items, seen) {
  const existing = new Map();
  for (const r of seen) {
    if (r.canonical) existing.set(r.canonical, r.title_key || '');
  }

  const out = [];
  for (const item of items) {
    const canonical = canonUrl(item.url);
    const tkey = titleKey(item.title || '');
    // 1) URLかぶり
    if (existing.has(canonical)) continue;
    // 2) タイトル類似（既知分と新規バッチ内の相互）
    let dup = false;
    for (const k of existing.values()) {
      if (similarTitle(k, tkey)) { dup = true; break; }
    }

    if (!dup) {
      for (const x of out) {
        if (similarTitle(x.__tkey, tkey)) { dup = true; break; }
      }
    }
    if (dup) continue;

    out.push({ ...item, __canonical: canonical, __tkey: tkey });
    existing.set(canonical, tkey);
  }
  return out;
}

export function appendSeen(seen, batch) {
  const now = new Date().toISOString();
  for (const b of batch) {
    seen.push({
      url: b.url,
      canonical: b.__canonical || canonUrl(b.url),
      title: b.title,
      title_key: b.__tkey || titleKey(b.title || ''),
      addedAt: now
    });
  }
  return seen;
}
