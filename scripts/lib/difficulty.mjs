// scripts/lib/difficulty.mjs

/**
 * 分類結果オブジェクト
 * @typedef {Object} DifficultyResult
 * @property {boolean} hard - 難物かどうか
 * @property {string[]} reasons - 判定理由のリスト
 * @property {string} host - ドメイン名
 * @property {number} len - 本文の長さ
 * @property {number} tableCount - テーブルの数
 */

/**
 * 記事の難易度を判定する
 * @param {Object} params
 * @param {string} params.url - 記事URL
 * @param {string} params.html - 生のHTML（省略可）
 * @param {string} params.text - 抽出された本文テキスト
 * @returns {DifficultyResult}
 */
export function classifyDifficulty({ url, html, text }) {
  const reasons = [];
  let u;
  try {
    u = new URL(url);
  } catch (e) {
    // URLが無効な場合はとりあえずホスト無しで進める
    u = { hostname: "" };
  }
  
  const host = u.hostname.replace(/^www\./, "");

  // 1. 既知の難物ホスト
  const HARD_HOSTS = new Set([
    "x.com", 
    "twitter.com", 
    "linkedin.com", 
    "instagram.com", 
    "tiktok.com",
    "facebook.com"
  ]);

  if (HARD_HOSTS.has(host)) {
    reasons.push(`hard_host:${host}`);
  }

  const cleaned = (text || "").trim();
  const len = cleaned.length;

  // 2. 本文が短すぎる（抽出失敗の可能性大）
  // Xなどはそもそも短いので、hard_hostで引っかかればOKだが
  // 通常サイトで短い場合もHard扱いして高度な推論（あるいは画像認識など将来的に）に頼る
  if (len < 1200) {
    reasons.push(`thin_text:${len}chars`);
  }

  // 3. ボイラープレート/ブロック検出パターン
  const patterns = [
    /enable javascript/i,
    /javascript.*(有効|オン)/i,
    /(sign in|log in)/i,
    /(ログイン|サインイン)/,
    /(subscribe|subscription|購読)/i,
    /cookie/i,
    /(access denied|blocked|captcha)/i,
    /please turn on javascript/i,
  ];

  // HTMLが生である場合と、Textだけの場合両方チェック
  // HTMLが大きいと重いので、先頭10KBぐらいでチェックする手もあるが
  // ここではシンプルに渡されたものをチェック
  if (patterns.some((re) => re.test(html || "") || re.test(cleaned))) {
    reasons.push("boilerplate_or_blocked");
  }

  // 4. 構造的複雑性
  if (cleaned.includes("```")) {
    reasons.push("has_code_blocks");
  }

  const tableCount = ((html || "").match(/<table\b/gi) || []).length;
  if (tableCount >= 2) {
    reasons.push(`many_tables:${tableCount}`);
  }

  const hard = reasons.length > 0;
  
  return { hard, reasons, host, len, tableCount };
}
