// scripts/lib/url_normalizer.mjs
// URL正規化とhash化（重複検出用）

import crypto from 'node:crypto';

/**
 * 除去するトラッキングパラメータ
 */
const TRACKING_PARAMS = new Set([
  // Google Analytics / Ads
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'gclid', 'gclsrc', 'dclid',
  // Facebook
  'fbclid', 'fb_action_ids', 'fb_action_types', 'fb_source',
  // Twitter
  'twclid',
  // Microsoft
  'msclkid',
  // その他
  'ref', 'ref_src', 'ref_url', 's', 'share', 'source',
  '_ga', '_gl', 'mc_cid', 'mc_eid',
  'oly_anon_id', 'oly_enc_id', 'vero_id',
  'hsCtaTracking', 'hsa_acc', 'hsa_cam', 'hsa_grp', 'hsa_ad', 'hsa_src', 'hsa_tgt', 'hsa_kw', 'hsa_mt', 'hsa_net', 'hsa_ver'
]);

/**
 * URLを正規化する
 * @param {string} urlString - 正規化するURL
 * @returns {string} 正規化されたURL
 */
export function normalizeUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    return '';
  }

  try {
    const url = new URL(urlString.trim());

    // 1. プロトコルを小文字に
    url.protocol = url.protocol.toLowerCase();

    // 2. ホストを小文字に & www. を除去
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, '');

    // 3. デフォルトポートを除去
    if ((url.protocol === 'http:' && url.port === '80') ||
        (url.protocol === 'https:' && url.port === '443')) {
      url.port = '';
    }

    // 4. トラッキングパラメータを除去
    const params = new URLSearchParams(url.search);
    for (const key of [...params.keys()]) {
      if (TRACKING_PARAMS.has(key.toLowerCase())) {
        params.delete(key);
      }
    }
    url.search = params.toString();

    // 5. フラグメント（#以降）を除去
    url.hash = '';

    // 6. 末尾スラッシュを統一（パスが / のみでなければ除去）
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }

    // 7. パスをデコード→再エンコード（正規化）
    try {
      url.pathname = encodeURI(decodeURI(url.pathname));
    } catch {
      // デコードエラーは無視
    }

    return url.toString();
  } catch {
    // URL解析失敗時は元の文字列をトリムして返す
    return urlString.trim();
  }
}

/**
 * 正規化URLのSHA-256ハッシュ（短縮版）を生成
 * @param {string} urlString - 元のURL
 * @returns {string} 16文字のhex hash
 */
export function hashUrl(urlString) {
  const normalized = normalizeUrl(urlString);
  if (!normalized) return '';
  
  const hash = crypto
    .createHash('sha256')
    .update(normalized)
    .digest('hex');
  
  // 先頭16文字で十分な一意性
  return hash.slice(0, 16);
}

/**
 * 正規化とハッシュを同時に取得
 * @param {string} urlString
 * @returns {{ normalized: string, hash: string }}
 */
export function normalizeAndHash(urlString) {
  const normalized = normalizeUrl(urlString);
  const hash = normalized
    ? crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 16)
    : '';
  return { normalized, hash };
}
