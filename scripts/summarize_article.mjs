// scripts/summarize_article.mjs
// URL から記事を取得して Gemini 2.5 Flash で要約し、
// Obsidian 用 Markdown を ai-news/articles/ に出力する。
// 403 / ネットワークエラー時は URL context tool だけでのフォールバック要約を行う。

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

// ====== 環境変数 ======
const GEMINI_API_KEY =
  process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const NEWS_ROOT =
  process.env.NEWS_ROOT ||
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "ai-news");

if (!GEMINI_API_KEY) {
  console.error(
    "[summarize_article] ❌ ERROR: GOOGLE_API_KEY or GEMINI_API_KEY is not set"
  );
  process.exit(1);
}

// ====== ユーティリティ ======

function todayYMD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function slugify(str, fallback = "article") {
  if (!str) return fallback;
  const s = str
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || fallback;
}

function buildArticlePath(rawUrl, extractedTitle) {
  const url = new URL(rawUrl);
  const host = url.host;
  const date = todayYMD();

  const lastPathSegment = url.pathname
    .split("/")
    .filter(Boolean)
    .pop();

  const slugSource =
    lastPathSegment ||
    extractedTitle ||
    host.replace(/\./g, "-") ||
    "article";

  const slug = slugify(slugSource);
  const fileName = `${date}--${host}--${slug}.md`;
  const articlesDir = path.join(NEWS_ROOT, "articles");
  const filePath = path.join(articlesDir, fileName);

  return { host, date, articlesDir, filePath };
}

async function fetchHtml(rawUrl) {
  const res = await fetch(rawUrl, {
    redirect: "follow",
    headers: {
      // OpenAI や一部サイト向けに、ブラウザっぽい UA を設定
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
    },
  });

  if (!res.ok) {
    const err = new Error(
      `Failed to fetch article: ${res.status} ${res.statusText}`
    );
    err.status = res.status;
    throw err;
  }

  return res.text();
}

function extractArticle(rawUrl, html) {
  const dom = new JSDOM(html, { url: rawUrl });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article) {
    return { title: "", textContent: "" };
  }

  const title = (article.title || "").trim();
  const textContent = (article.textContent || "").trim();
  return { title, textContent };
}

// Gemini への要約リクエスト
async function callGeminiForSummary({
  url,
  host,
  date,
  articleText, // string | null
  isFallback, // boolean
}) {
  const model = GEMINI_MODEL;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const baseInstruction = [
    "あなたはニュース・テック系記事の要約アシスタントです。",
    "出力は必ず JSON のみで返してください。Markdown やコードブロックは一切含めないでください。",
    "",
    "JSON のスキーマは次の通りです:",
    "",
    "```json",
    '{',
    '  "title": "string",                // 記事の日本語タイトル（可能なら元タイトルをベースに要約してもよい）',
    '  "tldr": "string",                 // 2〜3行程度の要約（後で frontmatter と TL;DR コールアウト両方に使う）',
    '  "overview": "string",             // 記事全体の概要（500〜800文字程度）',
    '  "detail_sections": [              // 詳細レポート用のセクション',
    '    { "title": "string", "body": "string" }',
    "  ],",
    '  "key_points": ["string", ...],    // 箇条書きの重要ポイント',
    '  "insights": ["string", ...],      // 解釈・示唆・インパクト',
    '  "risks": ["string", ...],         // リスク・不確定要素・注意点',
    '  "notes": ["string", ...]          // 補足メモ（任意・なければ空配列）',
    "}",
    "```",
    "",
    "必ず上記 JSON をそのまま返し、それ以外の文字列は一切出力しないでください。",
  ].join("\n");

  let userPrompt;

  if (articleText && !isFallback) {
    // 通常ルート：抽出済み本文 + URL context の併用
    userPrompt = [
      baseInstruction,
      "",
      `対象の記事 URL: ${url}`,
      "",
      "以下に、スクレイピング済みの本文テキストを与えます。",
      "ノイズや重複が含まれていてもよいので、URL context tool で元ページも参照しつつ、",
      "最終的な JSON 要約を作成してください。",
      "",
      "----- スクレイピング本文（そのまま） -----",
      articleText,
      "----- スクレイピング本文ここまで -----",
    ].join("\n");
  } else {
    // フォールバックルート：URL context のみ
    userPrompt = [
      baseInstruction,
      "",
      `対象の記事 URL: ${url}`,
      "",
      "この URL への直接アクセス（サーバー側からの fetch）が 403 / 404 / ネットワークエラーなどで失敗しました。",
      "そのため、URL context tool のみを使って、ページ内容を取得して要約してください。",
      "",
      "ページの構造（セクション・見出し・リード文など）もできるだけ反映しつつ、上記 JSON スキーマに従って出力してください。",
    ].join("\n");
  }

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    // URL context tool を常に有効化（通常ルートでも補助的に利用）
    tools: [{ url_context: {} }],
    generationConfig: {
      temperature: 0.2,
      topK: 40,
      topP: 0.95,
    },
  };

  const res = await fetch(`${endpoint}?key=${encodeURIComponent(
    GEMINI_API_KEY
  )}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    const err = new Error(
      `Gemini API error: ${res.status} ${res.statusText} - ${errBody}`
    );
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map((p) => p.text || "").join("").trim();

  if (!text) {
    throw new Error("Gemini API returned empty response");
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    console.warn(
      "[summarize_article] ⚠️ Gemini response was not valid JSON, using raw markdown fallback"
    );
    // JSON じゃなかった場合は、本文すべてを 1 つのセクションとして扱う
    parsed = {
      title: "",
      tldr: "",
      overview: "",
      detail_sections: [{ title: "詳細レポート", body: text }],
      key_points: [],
      insights: [],
      risks: [],
      notes: [],
    };
  }

  return {
    model: model,
    summary: {
      title: parsed.title || "",
      tldr: parsed.tldr || "",
      overview: parsed.overview || "",
      detail_sections: Array.isArray(parsed.detail_sections)
        ? parsed.detail_sections
        : [],
      key_points: Array.isArray(parsed.key_points) ? parsed.key_points : [],
      insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    },
    rawText: text,
  };
}

function renderMarkdown({
  url,
  host,
  date,
  model,
  articleText,
  summary,
}) {
  const safeTldr =
    (summary.tldr || "").replace(/\r?\n/g, " ").trim() ||
    (summary.key_points && summary.key_points[0]) ||
    "";

  const frontmatterLines = [
    "---",
    `title: "${(summary.title || "").replace(/"/g, '\\"') || url}"`,
    `url: "${url}"`,
    `host: "${host}"`,
    `created: "${date}"`,
    `kind: "summary"`,
    `model: "${model}"`,
    `tldr: "${safeTldr.replace(/"/g, '\\"')}"`,
    "---",
    "",
  ];

  const lines = [];

  // TL;DR コールアウト
  lines.push("> [!summary] TL;DR");
  if (safeTldr) {
    // 2〜3個に分割できそうなら分割
    const bullets =
      summary.key_points && summary.key_points.length > 0
        ? summary.key_points.slice(0, 3)
        : [safeTldr];
    for (const item of bullets) {
      lines.push(`> - ${item}`);
    }
  } else {
    lines.push("> - （後で TL;DR を追記）");
  }
  lines.push("");

  // 概要
  lines.push("## 概要");
  lines.push("");
  if (summary.overview) {
    lines.push(summary.overview.trim());
  } else {
    lines.push("（概要は後で追記）");
  }
  lines.push("");

  // 詳細レポート
  lines.push("## 詳細レポート");
  lines.push("");
  if (summary.detail_sections.length > 0) {
    for (const section of summary.detail_sections) {
      const title = (section.title || "").trim();
      if (title) {
        lines.push(`### ${title}`);
        lines.push("");
      }
      if (section.body) {
        lines.push(section.body.trim());
        lines.push("");
      }
    }
  } else {
    lines.push("（詳細レポートは後で追記）");
    lines.push("");
  }

  // 抽出テキスト（元記事の生テキストの一部を残しておきたい場合）
  if (articleText) {
    lines.push("## 抽出テキスト（スクレイピング済み本文の一部）");
    lines.push("");
    const snippet = articleText.slice(0, 2000).trim(); // 長すぎるので先頭 2000 文字だけ
    lines.push("```text");
    lines.push(snippet);
    lines.push("```");
    lines.push("");
  }

  // 抽出ポイント
  lines.push("## 抽出ポイント");
  lines.push("");
  if (summary.key_points.length > 0) {
    for (const p of summary.key_points) {
      lines.push(`- ${p}`);
    }
  } else {
    lines.push("- （後で追記）");
  }
  lines.push("");

  // 重要な示唆
  lines.push("## 重要な示唆");
  lines.push("");
  if (summary.insights.length > 0) {
    for (const p of summary.insights) {
      lines.push(`- ${p}`);
    }
  } else {
    lines.push("- （後で追記）");
  }
  lines.push("");

  // リスク・未確定要素
  lines.push("## リスク・未確定要素");
  lines.push("");
  if (summary.risks.length > 0) {
    for (const p of summary.risks) {
      lines.push(`- ${p}`);
    }
  } else {
    lines.push("- （後で追記）");
  }
  lines.push("");

  // メモ
  lines.push("## メモ");
  lines.push("");
  if (summary.notes.length > 0) {
    for (const p of summary.notes) {
      lines.push(`- ${p}`);
    }
  } else {
    lines.push("- （必要に応じてメモを追記）");
  }
  lines.push("");

  // Source URL
  lines.push("---");
  lines.push("");
  lines.push(`Source URL: ${url}`);
  lines.push("");

  return frontmatterLines.join("\n") + lines.join("\n");
}

// ====== メイン処理 ======

async function main() {
  const rawUrl = process.argv[2];

  if (!rawUrl) {
    console.error("[summarize_article] ❌ ERROR: URL argument is required");
    process.exit(1);
  }

  console.log("[summarize_article] URL:", rawUrl);

  let html = "";
  let articleText = "";
  let extractedTitle = "";
  let isFallback = false;

  try {
    html = await fetchHtml(rawUrl);
    const { title, textContent } = extractArticle(rawUrl, html);

    extractedTitle = title || "";
    articleText = textContent || "";

    const MIN_CHARS = 400;
    if (!articleText || articleText.length < MIN_CHARS) {
      console.warn(
        `[summarize_article] ⚠️ extracted article text too short (${articleText.length} chars), falling back to URL context only`
      );
      isFallback = true;
      articleText = "";
    }
  } catch (err) {
    const status = err.status || null;
    if (status === 403) {
      console.warn(
        "[summarize_article] ⚠️ fetch failed (403 Forbidden), falling back to URL context only"
      );
    } else if (status) {
      console.warn(
        `[summarize_article] ⚠️ fetch failed (${status} ${err.message}), falling back to URL context only`
      );
    } else {
      console.warn(
        `[summarize_article] ⚠️ fetch error (${err.message}), falling back to URL context only`
      );
    }
    isFallback = true;
    articleText = "";
  }

  const date = todayYMD();
  const { host, articlesDir, filePath } = buildArticlePath(
    rawUrl,
    extractedTitle
  );

  const { model, summary } = await callGeminiForSummary({
    url: rawUrl,
    host,
    date,
    articleText: articleText || null,
    isFallback,
  });

  const markdown = renderMarkdown({
    url: rawUrl,
    host,
    date,
    model,
    articleText: articleText || null,
    summary,
  });

  await fs.mkdir(articlesDir, { recursive: true });
  await fs.writeFile(filePath, markdown, "utf8");

  console.log("[summarize_article] output:", filePath);
  console.log("[summarize_article] ✅ done:", filePath);
}

main().catch((err) => {
  console.error("[summarize_article] ❌ ERROR");
  console.error(err);
  process.exit(1);
});
