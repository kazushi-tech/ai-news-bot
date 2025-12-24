// scripts/summarize_article.mjs

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// AI_NEWS_DIR の解決：環境変数があればそれ優先、なければ ../ai-news を使う
const ROOT_DIR = path.resolve(__dirname, "..", "..");
const AI_NEWS_DIR =
  process.env.AI_NEWS_DIR || path.resolve(ROOT_DIR, "ai-news");

// -----------------------------------------------------------------------------
// CLI パーサ
// -----------------------------------------------------------------------------

function parseArgs(argv) {
  let url = null;
  let created = null;
  let outdir = "articles";
  let sourceOverride = null;
  let domainOverride = null;

  for (const arg of argv) {
    if (!arg.startsWith("--") && !url) {
      url = arg;
      continue;
    }

    if (arg.startsWith("--date=")) {
      created = arg.slice("--date=".length);
    } else if (arg.startsWith("--outdir=")) {
      outdir = arg.slice("--outdir=".length);
    } else if (arg.startsWith("--source=")) {
      sourceOverride = arg.slice("--source=".length);
    } else if (arg.startsWith("--domain=")) {
      domainOverride = arg.slice("--domain=".length);
    }
  }

  return { url, created, outdir, sourceOverride, domainOverride };
}

// -----------------------------------------------------------------------------
// ユーティリティ
// -----------------------------------------------------------------------------

function todayYYYYMMDD() {
  // JST を厳密にやるならタイムゾーン計算が必要だが、
  // ここでは UTC の YYYY-MM-DD で割り切る
  return new Date().toISOString().slice(0, 10);
}

function escapeYaml(value) {
  if (value == null) return "";
  const s = String(value);
  // 改行やコロンがある場合は JSON.stringify でダブルクオートする
  if (/[:\n'"{}[\],]/.test(s)) {
    return JSON.stringify(s);
  }
  return s;
}

function toSourceLabelFromDomain(domain) {
  const map = {
    "gigazine.net": "GIGAZINE",
    "arstechnica.com": "Ars Technica",
    "theguardian.com": "The Guardian",
    "theverge.com": "The Verge",
    "wired.com": "WIRED",
    "bloomberg.co.jp": "Bloomberg Japan",
    "bloomberg.com": "Bloomberg",
    "theinformation.com": "The Information"
    // 必要になったらここに足していく
  };
  return map[domain] || domain;
}

function buildSlugFromUrlOrTitle(urlObj, title) {
  // URL の path からそれっぽい slug を作る（従来の 20251203-ai-model-build-fps っぽい形）
  const pathPart = urlObj.pathname
    .split("/")
    .filter(Boolean)
    .join("-")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (pathPart) return pathPart.slice(-100);

  // path が短すぎる場合はタイトルから生成
  if (title) {
    return title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100);
  }

  // 最終手段
  return String(Date.now());
}

async function fetchArticleHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  if (!res.ok) {
    throw new Error(`failed to fetch article: ${res.status} ${res.statusText}`);
  }
  
  // ArrayBufferで取得
  const arrayBuffer = await res.arrayBuffer();
  const contentType = res.headers.get('content-type') || '';
  
  // Step 1: Content-Typeからcharsetを抽出
  let charset = null;
  const charsetMatch = contentType.match(/charset=([^;]+)/i);
  if (charsetMatch) {
    charset = charsetMatch[1].trim().toLowerCase();
  }
  
  // Step 2: charsetがない場合、HTMLメタタグから検出
  if (!charset) {
    // まずASCII互換のLatin1でHTMLを部分的に読む
    const latin1Decoder = new TextDecoder('latin1');
    const partialHtml = latin1Decoder.decode(arrayBuffer.slice(0, 2048));
    
    // <meta charset="xxx"> パターン
    const metaCharsetMatch = partialHtml.match(/<meta[^>]+charset=["']?([^"'\s>]+)/i);
    if (metaCharsetMatch) {
      charset = metaCharsetMatch[1].toLowerCase();
    }
    
    // <meta http-equiv="Content-Type" content="text/html; charset=xxx"> パターン
    if (!charset) {
      const metaContentTypeMatch = partialHtml.match(/<meta[^>]+content=["'][^"']*charset=([^"'\s;]+)/i);
      if (metaContentTypeMatch) {
        charset = metaContentTypeMatch[1].toLowerCase();
      }
    }
  }
  
  // デフォルトはUTF-8
  charset = charset || 'utf-8';
  
  // Shift_JIS のエイリアス対応
  if (charset === 'shift_jis' || charset === 'sjis' || charset === 'x-sjis') {
    charset = 'shift-jis';
  }
  
  console.log(`[summarize] detected charset: ${charset}`);
  
  // TextDecoderでデコード
  const decoder = new TextDecoder(charset);
  return decoder.decode(arrayBuffer);
}

async function extractArticle(url) {
  const html = await fetchArticleHtml(url);
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  const title =
    (article && article.title && article.title.trim()) ||
    dom.window.document.title ||
    url;

  const textContent =
    (article && article.textContent && article.textContent.trim()) || "";

  return { title: title.trim(), textContent };
}

// -----------------------------------------------------------------------------
// Gemini 要約
// -----------------------------------------------------------------------------

async function summarizeWithGemini(articleText, title, url) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not set");
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: [
      "あなたは AI・テック系ニュースを日本語で要約するアシスタントです。",
      "入力は主に英語のニュース記事本文です。",
      "出力はすべて日本語で、見出しを使わずにコンパクトな要約を返してください。",
      "",
      "絶対に守るルール：",
      "- Markdown の見出し記号（#, ##, ### など）は一切使わないこと。",
      "- Callout記法（> [!info], > [!note] など）は一切使わないこと。",
      "- 記事タイトルや元URLを出力に含めないこと。",
      "- 「要約」「Summary」「Key Points」「TLDR」「概要」などのラベルや見出しは付けないこと。",
      "- コードブロック（```）は使わないこと。",
      "- 必ず JSON オブジェクトだけを返すこと。JSON以外の前置きや説明は不要。",
      "",
      "JSON の形式：",
      '{\"tldr\": \"記事全体を1文でまとめた日本語文\", \"body\": \"日本語での要約本文（箇条書き or 短い段落）\"}'
    ].join("\n")
  });

  const limitedText =
    articleText.length > 12000 ? articleText.slice(0, 12000) : articleText;

  const prompt = [
    "以下のニュース記事本文を、日本語で詳細にレポートしてください。",
    "",
    "想定読者: AI・テック業界のニュースを追っている日本人の知識労働者。",
    "あなたはDラボAIチャンネルのライターです。読者が記事を読まなくても内容を把握できるよう、詳細で構造化されたレポートを作成してください。",
    "",
    "JSON 形式でのみ回答してください。説明文や前置き、コードブロックは不要です。",
    "",
    "JSON の仕様:",
    '- フィールド "tldr": 記事全体をひとことで要約した日本語1文（60〜100文字程度）。',
    '- フィールド "overview": 記事の概要を2〜3文で説明（段落形式）。',
    '- フィールド "sections": 詳細レポートのセクション配列。各セクションは以下の形式:',
    '  - "heading": サブ見出し（例: "提携の目的：〇〇が△△に"、"背景にある課題"、"技術と安全性"、"期待される未来"）',
    '  - "content": セクションの内容（段落または箇条書き）',
    '  - 3〜6セクション程度を作成',
    "",
    "内容のガイドライン:",
    "- 固有名詞（企業名、製品名、人名）は正確に記載",
    "- 数値やデータがあれば必ず含める",
    "- 技術的な内容は分かりやすく説明",
    "- 箇条書きを使う場合は「- 」から始める",
    "- 表形式で整理できる内容があれば Markdown テーブルで表現",
    "",
    `記事タイトル: ${title}`,
    `URL: ${url}`,
    "",
    "===== 記事本文 =====",
    limitedText
  ].join("\n");

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const raw = response.text().trim();

  let jsonText = raw.trim();
  // モデルがうっかり ```json ... ``` で返してきた場合に備えて剥がす
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "");
    jsonText = jsonText.trim();
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(
      `failed to parse Gemini JSON response: ${err.message}\nraw:\n${raw}`
    );
  }

  // 新形式: tldr + sections / 旧形式: tldr + body
  if (!parsed.tldr) {
    throw new Error(
      `Gemini response missing tldr field.\nraw:\n${raw}`
    );
  }
  if (!parsed.sections && !parsed.body) {
    throw new Error(
      `Gemini response missing sections or body fields.\nraw:\n${raw}`
    );
  }

  // 軽く整形
  const tldr = String(parsed.tldr).trim();

  // 新形式: overview + sections / 旧形式: body
  let body;
  if (parsed.sections && Array.isArray(parsed.sections)) {
    // 新形式: 構造化レポート
    const overview = parsed.overview ? String(parsed.overview).trim() : '';
    const sectionsMarkdown = parsed.sections.map(sec => {
      const heading = sec.heading ? `## ${sec.heading}` : '';
      const content = sec.content ? String(sec.content).trim() : '';
      return heading ? `${heading}\n\n${content}` : content;
    }).join('\n\n');
    body = overview ? `${overview}\n\n${sectionsMarkdown}` : sectionsMarkdown;
  } else {
    // 旧形式: bodyそのまま
    body = String(parsed.body).trim();
  }

  return { tldr, body };
}

// -----------------------------------------------------------------------------
// オフライン要約（AI_NEWS_OFFLINE=1 用）
// -----------------------------------------------------------------------------

function offlineSummary(articleText, title, url) {
  const base = (articleText && articleText.trim()) || title || url || "";

  if (!base) {
    return {
      tldr: "記事本文を取得できませんでしたが、後で要約を差し替えてください。",
      body: "- 記事本文の取得に失敗しました。\n- 後でオンライン時に要約を生成し直してください。"
    };
  }

  const normalized = base.replace(/\s+/g, " ").trim();
  const sentences = normalized
    .split(/(?<=[。．.!?？])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const firstSentence = sentences[0] || normalized;
  const tldr = firstSentence.length > 80 ? firstSentence.slice(0, 80) : firstSentence;

  const bulletSentences = sentences.slice(0, 6);
  const body =
    bulletSentences.length > 0
      ? bulletSentences.map((s) => `- ${s}`).join("\n")
      : `- ${tldr}`;

  return { tldr, body };
}

// -----------------------------------------------------------------------------
// Markdown 出力
// -----------------------------------------------------------------------------

function renderMarkdown({ title, url, source, domain, created, tldr, body }) {
  const lines = [];

  lines.push("---");
  lines.push(`title: ${escapeYaml(title)}`);
  lines.push(`url: ${escapeYaml(url)}`);
  lines.push(`source_url: ${escapeYaml(url)}`);  // daily 生成で必須
  lines.push(`source: ${escapeYaml(source)}`);
  lines.push(`domain: ${escapeYaml(domain)}`);
  lines.push(`tldr: ${escapeYaml(tldr)}`);
  lines.push(`created: ${created}`);
  lines.push("cssclass: ai-news-article");
  lines.push("---");

  lines.push("");
  lines.push(`# ${title}`);
  lines.push("");

  // 引用元をCallout形式で表示（Dラボ形式）
  if (url) {
    lines.push("> [!info] 引用元");
    lines.push(`> ${url}`);
    lines.push("");
  }

  // bodyから重複するタイトルや引用元を除去（Geminiが生成したフォーマットをクリーンアップ）
  let cleanBody = body || '';
  
  // # タイトル 形式の見出しを全て除去（タイトルと完全一致でなくても除去）
  cleanBody = cleanBody.replace(/^#\s+[^\n]+\n*/gm, '');
  
  // > [!info] 元記事 または > [!info] 引用元 のCallout全体を除去
  cleanBody = cleanBody.replace(/^>\s*\[!info\]\s*(元記事|引用元)[^\n]*\n(>\s*[^\n]*\n?)*/gm, '');
  
  // ## 概要 見出しを除去（次の見出しまでの内容も含めて除去しない、見出しだけ）
  cleanBody = cleanBody.replace(/^##\s*概要\s*\n*/gm, '');
  
  // URL単体行を除去（引用元として既に表示されているため）
  const urlPattern = new RegExp(`^${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\n?`, 'gm');
  cleanBody = cleanBody.replace(urlPattern, '');
  cleanBody = cleanBody.replace(new RegExp(`^"${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*\n?`, 'gm'), '');
  
  // 連続する空行を1つに
  cleanBody = cleanBody.replace(/\n{3,}/g, '\n\n');
  // 先頭の空行を除去
  cleanBody = cleanBody.replace(/^\s*\n+/, '').trim();

  // 概要セクション（bodyの最初の段落または全体）
  if (cleanBody && cleanBody.trim()) {
    // bodyに ##見出し が含まれているかチェック
    const hasHeadings = cleanBody.includes('## ');
    
    if (hasHeadings) {
      // 新形式: 概要と詳細レポートを分離
      const parts = cleanBody.split(/(?=^## )/m);
      let overviewPart = parts[0].trim();
      const detailParts = parts.slice(1);
      
      // overviewPartからもタイトルとURLを除去
      overviewPart = overviewPart.replace(/^#\s+[^\n]+\n*/gm, '');
      overviewPart = overviewPart.replace(new RegExp(`^${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\n?`, 'gm'), '');
      overviewPart = overviewPart.replace(/^>\s*\[![^\]]+\][^\n]*\n(>\s*[^\n]*\n?)*/gm, '');
      overviewPart = overviewPart.replace(/^\s*\n+/, '').trim();
      
      // タイトルと同じまたは非常に似た内容で始まる場合は除去
      // タイトル正規化: 括弧やダッシュなどを除去して比較
      const normalizedTitle = title.replace(/[\s\-–—:：・「」『』（）()[\]【】]/g, '').toLowerCase();
      const firstLine = overviewPart.split('\n')[0] || '';
      const normalizedFirstLine = firstLine.replace(/[\s\-–—:：・「」『』（）()[\]【】]/g, '').toLowerCase();
      
      // 最初の行がタイトルと80%以上一致する場合は削除
      if (normalizedTitle && normalizedFirstLine) {
        const shorter = normalizedTitle.length < normalizedFirstLine.length ? normalizedTitle : normalizedFirstLine;
        const longer = normalizedTitle.length >= normalizedFirstLine.length ? normalizedTitle : normalizedFirstLine;
        let matchCount = 0;
        for (let i = 0; i < shorter.length; i++) {
          if (longer.includes(shorter[i])) matchCount++;
        }
        const matchRatio = matchCount / shorter.length;
        
        if (matchRatio > 0.8 || normalizedFirstLine.includes(normalizedTitle) || normalizedTitle.includes(normalizedFirstLine)) {
          // 最初の行を除去
          const overviewLines = overviewPart.split('\n');
          overviewLines.shift();
          overviewPart = overviewLines.join('\n').trim();
        }
      }
      
      // 概要をコールアウトで表示
      if (overviewPart) {
        lines.push("> [!abstract] 概要");
        // 概要を複数行Calloutに整形
        const overviewLines = overviewPart.split('\n').map(line => `> ${line}`);
        lines.push(...overviewLines);
        lines.push("");
      }
      
      // 詳細レポート
      if (detailParts.length > 0) {
        lines.push("## 詳細レポート");
        lines.push("");
        
        // 各サブセクションをCallout形式で処理
        const calloutTypes = ['note', 'tip', 'important', 'example', 'quote'];
        let calloutIndex = 0;
        
        for (const section of detailParts) {
          const trimmed = section.trim();
          if (!trimmed) continue;
          
          // 見出しと本文を分離
          const [headingLine, ...contentLines] = trimmed.split('\n');
          const heading = headingLine.replace(/^## /, '').trim();
          const content = contentLines.join('\n').trim();
          
          // サブセクションをCallout形式で出力
          const calloutType = calloutTypes[calloutIndex % calloutTypes.length];
          lines.push(`> [!${calloutType}] ${heading}`);
          
          if (content) {
            // コンテンツを複数行Calloutに整形
            const contentCleaned = content.split('\n').map(line => `> ${line}`).join('\n');
            lines.push(contentCleaned);
          }
          lines.push("");
          
          calloutIndex++;
        }
      }
    } else {
      // 旧形式: そのまま出力
      lines.push(cleanBody.trim());
      lines.push("");
    }
  }

  return lines.join("\n");
}

// -----------------------------------------------------------------------------
// メイン
// -----------------------------------------------------------------------------

async function main() {
  const { url, created, outdir, sourceOverride, domainOverride } = parseArgs(
    process.argv.slice(2)
  );

  if (!url) {
    console.error(
      "Usage: node scripts/summarize_article.mjs <URL> [--date=YYYY-MM-DD] [--outdir=articles] [--source=LABEL] [--domain=HOST]"
    );
    process.exit(1);
  }

  const createdDate = created || todayYYYYMMDD();
  const urlObj = new URL(url);
  const domain = domainOverride || urlObj.hostname;

  // X/Twitter URLは記事抽出が難しいためフラグを立てる
  const isTwitterUrl = (domain === 'x.com' || domain === 'twitter.com');

  const source = sourceOverride || toSourceLabelFromDomain(domain);

  const articlesDir = path.resolve(AI_NEWS_DIR, outdir);
  await fs.mkdir(articlesDir, { recursive: true });

  console.log("[summarize] AI_NEWS_DIR =", AI_NEWS_DIR);
  console.log("[summarize] ARTICLES_DIR =", articlesDir);
  console.log("[summarize] URL          =", url);
  console.log("[summarize] created      =", createdDate);
  console.log("[summarize] domain       =", domain);
  console.log("[summarize] source       =", source);

  let title, textContent;
  
  if (isTwitterUrl) {
    // X/Twitter URLはoEmbed APIでツイート内容を取得
    console.log("[summarize] X/Twitter URL detected - fetching via oEmbed API");
    const tweetIdMatch = url.match(/status\/(\d+)/);
    const tweetId = tweetIdMatch ? tweetIdMatch[1] : 'unknown';
    const authorMatch = url.match(/(?:x\.com|twitter\.com)\/([^\/]+)\/status/);
    const author = authorMatch ? authorMatch[1] : 'unknown';
    
    try {
      // oEmbed APIでツイートHTMLを取得
      const oEmbedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`;
      const oEmbedRes = await fetch(oEmbedUrl);
      if (oEmbedRes.ok) {
        const oEmbedData = await oEmbedRes.json();
        // HTMLからテキストを抽出
        const tweetHtml = oEmbedData.html || '';
        const authorName = oEmbedData.author_name || author;
        // HTMLタグを除去してテキストを取得
        const tweetText = tweetHtml
          .replace(/<[^>]+>/g, ' ')
          .replace(/&mdash;/g, '—')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, ' ')
          .trim();
        
        title = `${authorName}のX投稿`;
        textContent = `X投稿 by ${authorName}:\n\n${tweetText}\n\nURL: ${url}`;
        console.log(`[summarize] oEmbed success: ${authorName}`);
      } else {
        throw new Error('oEmbed API failed');
      }
    } catch (err) {
      console.log(`[summarize] oEmbed failed, using fallback: ${err.message}`);
      title = `X Post (@${author})`;
      textContent = `X投稿 by @${author}\n\nURL: ${url}\n\n（oEmbed APIで取得できなかったため、リンク先を確認してください）`;
    }
  } else {
    // 通常の記事抽出
    const result = await extractArticle(url);
    title = result.title;
    textContent = result.textContent;
  }

  let summary;
  if (isTwitterUrl && process.env.AI_NEWS_OFFLINE !== "1") {
    // X記事もGeminiで要約を試みる
    try {
      summary = await summarizeWithGemini(textContent, title, url);
    } catch (err) {
      console.warn("[summarize] X記事のGemini要約失敗、フォールバック:", err.message);
      summary = {
        tldr: `X投稿です。内容はリンク先を確認してください。`,
        body: `> [!note] X投稿\n> この記事はX/Twitterの投稿です。\n\n${textContent}`
      };
    }
  } else if (isTwitterUrl) {
    // オフライン時のX記事処理
    summary = {
      tldr: `X/Twitterの投稿です。リンク先で内容を確認してください。`,
      body: `> [!warning] X/Twitter投稿\n> この記事はX/Twitterの投稿です。内容を確認するには引用元リンクをクリックしてください。\n\n元のURLから手動で内容を確認し、必要に応じてこのノートを編集してください。`
    };
  } else if (process.env.AI_NEWS_OFFLINE === "1") {
    console.log("[summarize] AI_NEWS_OFFLINE=1 → offlineSummary を使用");
    summary = offlineSummary(textContent, title, url);
  } else {
    try {
      summary = await summarizeWithGemini(textContent, title, url);
    } catch (err) {
      console.warn(
        "[summarize] Gemini 要約に失敗したため offlineSummary にフォールバックします:",
        err.message
      );
      summary = offlineSummary(textContent, title, url);
    }
  }

  const slug = buildSlugFromUrlOrTitle(urlObj, title);
  const filename = `${createdDate}--${domain}--${slug}.md`;
  const filepath = path.join(articlesDir, filename);

  const md = renderMarkdown({
    title,
    url,
    source,
    domain,
    created: createdDate,
    tldr: summary.tldr,
    body: summary.body
  });

  await fs.writeFile(filepath, md, "utf8");

  console.log(
    `[summarize] wrote ${path.relative(AI_NEWS_DIR, filepath)} (title="${title}")`
  );
}

main().catch((err) => {
  console.error("[summarize] fatal error:", err);
  process.exit(1);
});
