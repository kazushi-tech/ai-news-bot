// scripts/lib/slug.mjs
// Slug生成ユーティリティ - Vault File Spec準拠

import crypto from 'node:crypto';

/**
 * 日本語を含むテキストからslugを生成
 * ルール:
 * - 英数小文字 + ハイフンのみ
 * - 最大80文字
 * - 衝突回避のためハッシュ8文字を末尾に付与可能
 * 
 * @param {string} text - 元テキスト（タイトル等）
 * @param {object} options
 * @param {number} options.maxLen - 最大長（デフォルト80）
 * @param {boolean} options.appendHash - ハッシュを付与するか（デフォルトfalse）
 * @param {string} options.hashSource - ハッシュ生成元（URL等）
 * @returns {string}
 */
export function generateSlug(text, options = {}) {
  const { maxLen = 80, appendHash = false, hashSource = null } = options;
  
  if (!text || typeof text !== 'string') {
    return 'untitled';
  }
  
  let slug = text
    // 全角英数を半角に
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, char => 
      String.fromCharCode(char.charCodeAt(0) - 0xFEE0))
    // 小文字化
    .toLowerCase()
    // スペースや区切りをハイフンに
    .replace(/[\s_]+/g, '-')
    // 許可文字以外を除去（英数字、ハイフン以外）
    .replace(/[^a-z0-9\-]/g, '')
    // 連続ハイフンを1つに
    .replace(/-+/g, '-')
    // 先頭末尾のハイフンを除去
    .replace(/^-+|-+$/g, '');
  
  // 空になった場合はハッシュ
  if (!slug) {
    const hash = crypto
      .createHash('sha256')
      .update(text)
      .digest('hex')
      .slice(0, 12);
    return hash;
  }
  
  // ハッシュ付与
  if (appendHash && hashSource) {
    const hash = crypto
      .createHash('sha256')
      .update(hashSource)
      .digest('hex')
      .slice(0, 8);
    const base = slug.slice(0, maxLen - 9); // ハッシュ8文字 + ハイフン1文字
    return `${base}-${hash}`;
  }
  
  // 長さ制限
  return slug.slice(0, maxLen);
}

/**
 * URLからslugを生成
 * @param {string} url
 * @returns {string}
 */
export function slugFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathPart = urlObj.pathname
      .split('/')
      .filter(Boolean)
      .join('-');
    
    if (pathPart) {
      return generateSlug(pathPart, { maxLen: 80 });
    }
    
    // パスがなければホスト名をベースに
    return generateSlug(urlObj.hostname, { 
      maxLen: 60, 
      appendHash: true, 
      hashSource: url 
    });
  } catch {
    return generateSlug(url, { maxLen: 80 });
  }
}

/**
 * 日本語タイトルからslugを生成（ハッシュ併用）
 * @param {string} title - 日本語タイトル
 * @param {string} url - 元URL（ハッシュ生成用）
 * @returns {string}
 */
export function slugFromTitle(title, url) {
  const baseSlug = generateSlug(title, { maxLen: 60 });
  
  // 日本語タイトルで空になった場合
  if (!baseSlug || baseSlug === 'untitled') {
    return generateSlug('', { appendHash: true, hashSource: url || title });
  }
  
  // 短すぎる場合はハッシュ付与
  if (baseSlug.length < 10) {
    return generateSlug(title, { 
      maxLen: 60, 
      appendHash: true, 
      hashSource: url || title 
    });
  }
  
  return baseSlug;
}
