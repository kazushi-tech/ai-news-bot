// scripts/summarize_article.mjs

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { GoogleGenerativeAI } from "@google/generative-ai";
import YAML from "yaml";
import { GeminiUsageManager } from "./lib/GeminiUsageManager.mjs";
import { classifyDifficulty } from "./lib/difficulty.mjs";
import { REPO_ROOT, NEWS_ROOT, STATE_DIR } from "./lib/paths.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// AI_NEWS_DIR: 統一されたパス定義を使用
const ROOT_DIR = REPO_ROOT;
const AI_NEWS_DIR = NEWS_ROOT;

// -----------------------------------------------------------------------------
// CLI パーサ
// -----------------------------------------------------------------------------

function parseArgs(argv) {
  let url = null;
  let created = null;
  let outdir = "articles";
  let sourceOverride = null;
  let domainOverride = null;
  let titleOverride = null;
  let descriptionOverride = null;

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
    } else if (arg.startsWith("--title=")) {
      titleOverride = arg.slice("--title=".length);
    } else if (arg.startsWith("--description=")) {
      descriptionOverride = arg.slice("--description=".length);
    }
  }

  return { url, created, outdir, sourceOverride, domainOverride, titleOverride, descriptionOverride };
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

async function summarizeWithGemini(articleText, title, url, useHardModel = false) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not set");
  }

  const modelEasy = process.env.GEMINI_MODEL_EASY || process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const modelHard = process.env.GEMINI_MODEL_HARD || "gemini-2.5-flash"; // ユーザー要求により統一
  
  const modelName = useHardModel ? modelHard : modelEasy;
  console.log(`[summarize] Using Gemini Model: ${modelName} (HardMode=${useHardModel})`);

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
    "以下のニュース記事本文を、日本語で要約してください。",
    "",
    "想定読者: AI・テック業界のニュースを追っている日本人の知識労働者。",
    "あなたはDラボAIチャンネルのライターです。",
    "",
    "【重要】出力形式: JSON のみ",
    "Markdownや説明文は一切含めず、以下のJSON形式を守ってください。",
    "",
    "JSONスキーマ:",
    "{",
    "  \"title_ja\": \"記事タイトルの日本語訳\",",
    "  \"one_line_summary\": \"40〜60字の1行要約。テーブル表示用。\",",
    "  \"bullets\": [",
    "    \"箇条書き要点1（最大3〜5個）\",",
    "    \"箇条書き要点2\",",
    "    \"箇条書き要点3\"",
    "  ],",
    "  \"why_it_matters\": \"なぜこのニュースが重要か（1〜2文）\",",
    "  \"tags\": [\"tag1\", \"tag2\", \"tag3\"],  // 3〜8個の関連タグ",
    "  \"importance\": 3,  // 1〜5の重要度スコア (1=低, 5=極めて重要)",
    "  \"importance_reason\": \"重要度の理由を1行で\",",
    "  \"reliability\": \"high|mid|low\",",
    "  \"reliability_reason\": \"信頼度の理由\"",
    "}",
    "",
    "ガイドライン:",
    "- `one_line_summary` は40〜60字で簡潔に。テーブル1行に収まるように。",
    "- `bullets` は3〜5個。誇張せず事実ベースで。",
    "- `why_it_matters` は読者がこのニュースを気にすべき理由を簡潔に。",
    "- `tags`: 3〜8個。具体的な技術名・企業名・トピック。例: LLM, OpenAI, GPT-4, Reasoning, Benchmark, Regulation",
    "  - 推奨タグ: LLM, Agents, OpenAI, Anthropic, Google, DeepMind, Microsoft, Meta, GPT, Claude, Gemini, o1, o3, Reasoning, RAG, Fine-tuning, RLHF, Multimodal, Benchmark, Research, Paper, Regulation, Copyright, Privacy, Ethics, Safety, API, Enterprise, Startup, Funding, M&A",
    "  - 避けるタグ: ai-news, news, tech, update (一般的すぎる)",
    "- `importance`: 1〜5のスコア",
    "  - 5: 業界を変える重大発表（新モデルリリース、大型M&A、重要な法規制）",
    "  - 4: 主要プレイヤーの重要発表（新機能、提携、研究成果）",
    "  - 3: 興味深い技術トピック（標準）",
    "  - 2: ニッチな話題",
    "  - 1: 補足情報",
    "- `importance_reason`: なぜそのスコアなのかを1行で説明",
    "- `reliability`: high=公式発表/主要メディア, mid=信頼できる二次情報, low=噂/未確認",
    "- 推測しない。不明な情報は「不明」と記載。",
    "- 引用は最小限（必要なら短いフレーズ程度）。",
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

  // 新形式: one_line_summary + bullets / 旧形式: tldr + sections|body
  const oneLineSummary = parsed.one_line_summary 
    ? String(parsed.one_line_summary).trim() 
    : (parsed.tldr ? String(parsed.tldr).trim().slice(0, 60) : null);
  
  if (!oneLineSummary && !parsed.tldr) {
    throw new Error(
      `Gemini response missing one_line_summary or tldr field.\nraw:\n${raw}`
    );
  }

  // 軽く整形
  const tldr = oneLineSummary || String(parsed.tldr || '').trim();
  const titleJa = parsed.title_ja ? String(parsed.title_ja).trim() : null;
  const whyItMatters = parsed.why_it_matters ? String(parsed.why_it_matters).trim() : null;
  
  // Importance (1-5, default 3)
  let importance = parsed.importance ? parseInt(parsed.importance, 10) : 3;
  if (isNaN(importance) || importance < 1 || importance > 5) {
    importance = 3; // Normalize to default
  }
  const importanceReason = parsed.importance_reason ? String(parsed.importance_reason).trim() : null;
  
  const reliability = parsed.reliability ? String(parsed.reliability).trim().toLowerCase() : null;
  const reliabilityReason = parsed.reliability_reason ? String(parsed.reliability_reason).trim() : null;
  
  // 新形式: bullets / 旧形式: tags from frontmatter
  const bullets = Array.isArray(parsed.bullets) 
    ? parsed.bullets.map(b => String(b).trim()).filter(Boolean)
    : [];
  const tags = Array.isArray(parsed.tags) 
    ? parsed.tags.map(t => String(t).trim()).filter(Boolean)
    : ['ai-news'];

  // body生成: 新形式（bullets）または旧形式（sections/body）
  let body;
  if (bullets.length > 0) {
    // 新形式: bullets -> 箇条書き
    const lines = bullets.map(b => `- ${b}`);
    body = lines.join('\n');
  } else if (parsed.sections && Array.isArray(parsed.sections)) {
    // 旧形式: 構造化レポート -> Callout形式に変換
    const lines = [];

    // Overview -> Abstract Callout
    if (parsed.overview) {
      lines.push("> [!abstract] 概要");
      const overviewLines = String(parsed.overview).trim().split('\n');
      overviewLines.forEach(line => lines.push(`> ${line}`));
      lines.push("");
    }

    // Sections -> Specific Callouts
    const defaultTypes = ['note', 'tip', 'important', 'example', 'quote'];
    
    parsed.sections.forEach((sec, idx) => {
      const type = sec.type || defaultTypes[idx % defaultTypes.length];
      const heading = sec.heading || `Section ${idx + 1}`;
      
      lines.push(`> [!${type}] ${heading}`);
      
      if (sec.content) {
        const contentLines = String(sec.content).trim().split('\n');
        contentLines.forEach(line => lines.push(`> ${line}`));
      }
      lines.push("");
    });

    body = lines.join('\n').trim();
  } else if (parsed.body) {
    // 最旧形式: bodyそのまま
    body = String(parsed.body).trim();
  } else {
    body = '';
  }

  return { tldr, body, titleJa, whyItMatters, importance, importanceReason, reliability, reliabilityReason, bullets, tags };
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
// Related Articles 検索
// -----------------------------------------------------------------------------

/**
 * 全記事をスキャンしてインメモリインデックスを作成
 */
async function loadArticlesForRelated() {
  const articlesDir = path.join(AI_NEWS_DIR, 'articles');
  
  let entries;
  try {
    entries = await fs.readdir(articlesDir, { withFileTypes: true });
  } catch {
    return [];
  }
  
  const articles = [];
  
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    
    const filepath = path.join(articlesDir, entry.name);
    
    try {
      const content = await fs.readFile(filepath, 'utf8');
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      
      if (!fmMatch) continue;
      
      const fm = YAML.parse(fmMatch[1]);
      
      articles.push({
        file: entry.name,
        title: fm.title || entry.name.replace(/\.md$/, ''),
        date: fm.created || fm.date || '',
        tags: Array.isArray(fm.tags) ? fm.tags : [],
        importance: fm.importance || fm.interest || 3,
        source: fm.source || '',
        domain: fm.domain || '',
        host: fm.host || fm.domain || ''
      });
    } catch {
      // YAML パースエラーまたはファイル読み込みエラーはスキップ
    }
  }
  
  return articles;
}

/**
 * Related記事を検索
 */
async function findRelatedArticles(currentFile, currentTags, currentHost, maxResults = 5) {
  const allArticles = await loadArticlesForRelated();
  
  // 現在の記事を除外
  const others = allArticles.filter(art => art.file !== currentFile);
  
  // 同タグ記事（タグ一致数でソート）
  const byTags = others
    .filter(art => {
      if (!Array.isArray(art.tags) || art.tags.length === 0) return false;
      if (!Array.isArray(currentTags) || currentTags.length === 0) return false;
      // ai-news を除外したタグで一致チェック
      const artTagsFiltered = art.tags.filter(t => t !== 'ai-news');
      const currentTagsFiltered = currentTags.filter(t => t !== 'ai-news');
      return artTagsFiltered.some(tag => currentTagsFiltered.includes(tag));
    })
    .map(art => {
      const artTagsFiltered = art.tags.filter(t => t !== 'ai-news');
      const currentTagsFiltered = currentTags.filter(t => t !== 'ai-news');
      const matchCount = artTagsFiltered.filter(tag => currentTagsFiltered.includes(tag)).length;
      return { ...art, matchCount };
    })
    .sort((a, b) => {
      // タグ一致数でソート
      if (a.matchCount !== b.matchCount) return b.matchCount - a.matchCount;
      // importance でソート
      const impA = a.importance || 3;
      const impB = b.importance || 3;
      if (impA !== impB) return impB - impA;
      // 日付でソート（新しい順）
      return (b.date || '').localeCompare(a.date || '');
    })
    .slice(0, maxResults);
  
  // 同ソース記事
  const bySource = others
    .filter(art => {
      if (!currentHost) return false;
      return art.host === currentHost || art.domain === currentHost;
    })
    .sort((a, b) => {
      // importance でソート
      const impA = a.importance || 3;
      const impB = b.importance || 3;
      if (impA !== impB) return impB - impA;
      // 日付でソート（新しい順）
      return (b.date || '').localeCompare(a.date || '');
    })
    .slice(0, maxResults);
  
  return { byTags, bySource };
}

// -----------------------------------------------------------------------------
// Markdown 出力
// -----------------------------------------------------------------------------

function renderMarkdown({ title, url, source, domain, created, tldr, body, status = 'summarized', whyItMatters = null, importance = null, importanceReason = null, reliability = null, reliabilityReason = null, inputTags = null, relatedArticles = null }) {
  const lines = [];

  lines.push("---");
  lines.push("type: ai-news");
  lines.push(`title: ${escapeYaml(title)}`);
  lines.push(`url: ${escapeYaml(url)}`);
  lines.push(`source_url: ${escapeYaml(url)}`);  // daily 生成で必須
  lines.push(`source: ${escapeYaml(source)}`);
  lines.push(`domain: ${escapeYaml(domain)}`);
  lines.push(`tldr: ${escapeYaml(tldr)}`);
  lines.push(`created: ${created}`);
  if (status && status !== 'summarized') {
    lines.push(`status: ${status}`);
  }
  if (whyItMatters) {
    lines.push(`why_it_matters: ${escapeYaml(whyItMatters)}`);
  }
  if (importance !== null && importance !== undefined) {
    lines.push(`importance: ${importance}`);
  }
  if (importanceReason) {
    lines.push(`importance_reason: ${escapeYaml(importanceReason)}`);
  }
  if (reliability) {
    lines.push(`reliability: ${reliability}`);
  }
  if (reliabilityReason) {
    lines.push(`reliability_reason: ${escapeYaml(reliabilityReason)}`);
  }
  
  // interestの設定（status別）
  const interestMap = {
    'x_only': 3,
    'summarized': 3,
    'blocked': 2
  };
  const interest = importance !== null ? importance : (interestMap[status] || 3);
  lines.push(`interest: ${interest}`);
  
  // tagsの設定（引数から受け取るか、status別のデフォルト）
  let finalTags = inputTags && inputTags.length > 0 ? [...inputTags] : ['ai-news'];
  if (!finalTags.includes('ai-news')) {
    finalTags.unshift('ai-news');
  }
  if (status === 'x_only' && !finalTags.includes('x')) {
    finalTags.push('x');
  } else if (status === 'blocked' && !finalTags.includes('blocked')) {
    finalTags.push('blocked');
  }
  lines.push(`tags: [${finalTags.join(', ')}]`);
  
  lines.push("cssclass: ai-news-article");
  lines.push("---");

  lines.push("");
  lines.push(`# ${title}`);
  lines.push("");

  // 引用元をCallout形式で表示
  lines.push("> [!info] 引用元");
  lines.push(`> ${url}`);
  lines.push("");

  // status別の本文処理
  if (status === 'x_only') {
    // X URL: 引用元のみ、本文なし
    lines.push("## メモ");
    lines.push("");
    lines.push("（X投稿のため、要約は省略されました。リンク先を確認してください）");
    lines.push("");
  } else if (status === 'blocked') {
    // blocked: warningのみ
    lines.push(body.trim());
    lines.push("");
  } else {
    // summarized: TL;DR + 本文
    if (tldr && !body.includes('[!summary]')) {
      lines.push("> [!summary] TL;DR");
      lines.push(`> ${tldr}`);
      lines.push("");
    }
    
    let cleanBody = body || '';
    cleanBody = cleanBody.replace(/\r\n/g, '\n');
    cleanBody = cleanBody.replace(/\n{3,}/g, '\n\n');
    
    lines.push(cleanBody.trim());
    lines.push("");
    
    // Why it matters セクション
    if (whyItMatters) {
      lines.push("> [!important] Why it matters");
      lines.push(`> ${whyItMatters}`);
      lines.push("");
    }
    
    // 信頼度セクション
    if (reliability) {
      const reliabilityLabel = { high: '高', mid: '中', low: '低' }[reliability] || reliability;
      const reasonText = reliabilityReason ? `（${reliabilityReason}）` : '';
      lines.push(`**信頼度:** ${reliabilityLabel}${reasonText}`);
      lines.push("");
    }
  }

  // Related Articles セクション（末尾に追加）
  if (relatedArticles && (relatedArticles.byTags.length > 0 || relatedArticles.bySource.length > 0)) {
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## 🔗 Related Articles');
    lines.push('');
    
    if (relatedArticles.byTags.length > 0) {
      lines.push('### 同じトピック');
      lines.push('');
      lines.push('| Title | Date | Imp | Source |');
      lines.push('| --- | --- | --- | --- |');
      relatedArticles.byTags.forEach(art => {
        const titleEscaped = (art.title || '').replace(/\|/g, '\\|');
        const artPath = `articles/${art.file}`;
        const dateStr = art.date || '';
        const impStr = art.importance || '';
        const sourceStr = art.source || art.host || '';
        lines.push(`| [[${artPath}\\|${titleEscaped}]] | ${dateStr} | ${impStr} | ${sourceStr} |`);
      });
      lines.push('');
    }
    
    if (relatedArticles.bySource.length > 0) {
      lines.push('### 同じソース');
      lines.push('');
      lines.push('| Title | Date | Imp |');
      lines.push('| --- | --- | --- |');
      relatedArticles.bySource.forEach(art => {
        const titleEscaped = (art.title || '').replace(/\|/g, '\\|');
        const artPath = `articles/${art.file}`;
        const dateStr = art.date || '';
        const impStr = art.importance || '';
        lines.push(`| [[${artPath}\\|${titleEscaped}]] | ${dateStr} | ${impStr} |`);
      });
      lines.push('');
    }
  }

  return lines.join("\n");
}

// -----------------------------------------------------------------------------
// メイン
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// オフライン/エラー時/予算オーバー時のフォールバック生成
// -----------------------------------------------------------------------------

function createUnsummarizedFallback(title, url, reason) {
  return {
    tldr: `（未要約: ${reason}）内容を確認するにはリンクを開いてください。`,
    body: `> [!warning] 未要約 (${reason})\n> Gemini API のクォータ制限、またはエラーのため要約をスキップしました。\n> [元記事](${url}) から内容を確認してください。\n\n（後で手動更新するか、翌日以降に再生成してください）`,
    titleJa: null // タイトル翻訳もスキップ
  };
}

function createLinkOnlyFallback(title, url, note = "リンク保存") {
  return {
    tldr: `${note}: 内容はリンク先を確認してください。`,
    body: `> [!note] ${note}\n> 自動要約対象外、または本文取得困難なためリンクのみ保存しました。\n> [元記事](${url}) を確認してください。`,
    titleJa: null
  };
}

async function main() {
  const { url, created, outdir, sourceOverride, domainOverride, titleOverride, descriptionOverride } = parseArgs(
    process.argv.slice(2)
  );

  if (!url) {
    console.error(
      "Usage: node scripts/summarize_article.mjs <URL> [--date=YYYY-MM-DD] [--outdir=articles] [--source=LABEL] [--domain=HOST] [--title=TITLE] [--description=DESC]"
    );
    process.exit(1);
  }

  const createdDate = created || todayYYYYMMDD();
  const urlObj = new URL(url);
  const domain = domainOverride || urlObj.hostname;

  // X/Twitter URLは記事抽出が難しいためフラグを立てる
  const isTwitterUrl = (domain === 'x.com' || domain === 'twitter.com' || domain === 'www.x.com' || domain === 'www.twitter.com');

  const source = sourceOverride || toSourceLabelFromDomain(domain);

  const articlesDir = path.resolve(AI_NEWS_DIR, outdir);
  await fs.mkdir(articlesDir, { recursive: true });

  console.log("[summarize] AI_NEWS_DIR =", AI_NEWS_DIR);
  console.log("[summarize] ARTICLES_DIR =", articlesDir);
  console.log("[summarize] URL          =", url);
  console.log("[summarize] created      =", createdDate);
  console.log("[summarize] domain       =", domain);
  console.log("[summarize] source       =", source);
  if (titleOverride) {
    console.log("[summarize] title (from metadata) =", titleOverride);
  }

  // usageManager の初期化 (project root/state)
  const usageManager = new GeminiUsageManager(path.join(ROOT_DIR, 'state'));

  let title, textContent;
  let status = 'summarized'; // デフォルト
  
  if (isTwitterUrl) {
    // X/Twitter: 本文取得をスキップし、「x_only」モード
    console.log("[summarize] X/Twitter URL detected - using x_only mode");
    title = titleOverride || `X Post (${url})`; // Discord embedタイトル優先
    textContent = ""; // 本文なし
    status = 'x_only';
  } else {
    // 通常の記事抽出
    try {
      const result = await extractArticle(url);
      title = result.title;
      textContent = result.textContent;
      
      // extractArticleのタイトルより、Discord embedタイトルを優先
      if (titleOverride) {
        title = titleOverride;
      }
    } catch (err) {
      console.warn(`[summarize] extractArticle failed: ${err.message}`);
      title = titleOverride || `Article (${domain})`;
      textContent = "";
      status = 'blocked'; // 本文取得失敗
    }
  }

  let summary;

  // X URL (x_only) の場合は要約をスキップ
  if (status === 'x_only') {
    console.log("[summarize] x_only mode: skipping summarization");
    summary = createLinkOnlyFallback(title, url, "X投稿");
  }
  // オフラインモード
  else if (process.env.AI_NEWS_OFFLINE === "1") {
    console.log("[summarize] AI_NEWS_OFFLINE=1 → offlineSummary を使用");
    summary = offlineSummary(textContent, title, url);
  } 
  // blocked (本文取得失敗) の場合も要約スキップ
  else if (status === 'blocked') {
    console.log("[summarize] blocked mode: skipping summarization");
    summary = createUnsummarizedFallback(title, url, "本文取得失敗");
  }
  // 通常のGemini要約（予算チェック付き）
  else {
    // 予算チェック
    const budgetStatus = await usageManager.checkBudget();
    
    if (!budgetStatus.allowed) {
      console.warn(`[summarize] Gemini budget/limit prevented execution: ${budgetStatus.reason}`);
      summary = createUnsummarizedFallback(title, url, budgetStatus.reason);
      status = 'blocked';
    } else {
      // 実行
        // 難易度判定
        const diff = classifyDifficulty({ url, text: textContent });
        console.log(`[summarize] Difficulty: hard=${diff.hard}, reasons=[${diff.reasons.join(", ")}]`);

        // 初回試行のモデル決定
        let useHard = diff.hard;
        let errorReason = null;

        try {
           summary = await summarizeWithGemini(textContent, title, url, useHard);
           await usageManager.increment();
        } catch (err) {
           console.warn(`[summarize] 1st attempt (${useHard ? 'Hard' : 'Easy'}) failed: ${err.message}`);
           
           // Easyで失敗した場合はHardでリトライ (予算/429エラー以外)
           if (!useHard && !err.message.includes('Quota') && !err.message.includes('429')) {
             console.log("[summarize] Retrying with Hard model...");
             try {
               summary = await summarizeWithGemini(textContent, title, url, true);
               await usageManager.increment();
             } catch (retryErr) {
               console.warn(`[summarize] Retry failed: ${retryErr.message}`);
               errorReason = retryErr.message;
             }
           } else {
             errorReason = err.message;
           }
        }

        if (!summary) {
          // 最終的に失敗した場合
           if (errorReason && (errorReason.includes('429') || errorReason.includes('Quota'))) {
              await usageManager.markLimitReached();
              summary = createUnsummarizedFallback(title, url, "Quota Exceeded (429)");
           } else {
             // 難物記事として失敗ノートを残すか、単なるエラーか
             // ここでは「要約不可」としてフォールバック
             summary = createUnsummarizedFallback(title, url, `Failed after retry: ${errorReason}`);
           }
           status = 'blocked';
        }
    }
  }

  const slug = buildSlugFromUrlOrTitle(urlObj, title);
  const filename = `${createdDate}--${domain}--${slug}.md`;
  const filepath = path.join(articlesDir, filename);

  // 翻訳タイトルがあれば採用
  if (summary.titleJa) {
    console.log(`[summarize] Translated title from Gemini: ${summary.titleJa}`);
    title = summary.titleJa;
  }

  // Related記事を検索（新規記事生成時のみ）
  let relatedArticles = null;
  if (status === 'summarized' && summary.tags && summary.tags.length > 0) {
    try {
      relatedArticles = await findRelatedArticles(
        filename,
        summary.tags,
        domain
      );
      console.log(`[summarize] Found ${relatedArticles.byTags.length} related by tags, ${relatedArticles.bySource.length} by source`);
    } catch (err) {
      console.warn(`[summarize] Failed to find related articles: ${err.message}`);
    }
  }

  const md = renderMarkdown({
    title,
    url,
    source,
    domain,
    created: createdDate,
    tldr: summary.tldr,
    body: summary.body,
    status,
    whyItMatters: summary.whyItMatters,
    reliability: summary.reliability,
    reliabilityReason: summary.reliabilityReason,
    inputTags: summary.tags,
    relatedArticles  // 追加
  });

  await fs.writeFile(filepath, md, "utf8");

  console.log(
    `[summarize] wrote ${path.relative(AI_NEWS_DIR, filepath)} (title="${title}", status=${status})`
  );
}

main().catch((err) => {
  console.error("[summarize] fatal error:", err);
  process.exit(1);
});
