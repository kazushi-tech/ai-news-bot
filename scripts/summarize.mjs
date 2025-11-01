#!/usr/bin/env node
// scripts/summarize.mjs
// 入力URLを取りに行って（通常 → AMP → テキストプロキシの順にフォールバック）
// 本文を要約して Markdown を標準出力へ出す。

const rawUrl = process.argv[2];
if (!rawUrl) {
  console.error("Usage: node scripts/summarize.mjs <URL>");
  process.exit(1);
}

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36";

async function fetchWithFallback(u) {
  const clean = u.trim();
  const headers = { "user-agent": UA, "accept-language": "ja,en;q=0.9" };

  const candidates = [
    clean,
    clean.includes("bloomberg")
      ? clean + (clean.includes("?") ? "&" : "?") + "output=amp"
      : null,
    `https://r.jina.ai/http://${clean.replace(/^https?:\/\//, "")}`,
  ].filter(Boolean);

  for (const url of candidates) {
    try {
      const res = await fetch(url, { headers, redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (text && text.length > 500) {
        return { from: url, body: text };
      }
    } catch (e) {
      console.error("[fetch fail]", url, String(e));
    }
  }
  throw new Error("All fetch fallbacks failed");
}

function htmlToText(html) {
  // r.jina.ai の場合はそもそもプレーンテキストなのでそのまま返す
  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(html);
  if (!looksHtml) return html;

  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");

  const title =
    (s.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
      s.match(/<title>([^<]+)<\/title>/i) ||
      [null, ""])[1];

  const ps = Array.from(s.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)).map((m) =>
    m[1].replace(/<[^>]+>/g, "").trim()
  );
  const text = [title, "", ps.join("\n\n")].join("\n");
  return text;
}

async function summarizeWithOpenAI(text, url) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const endpoint = "https://api.openai.com/v1/chat/completions";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const prompt = `
あなたは日本語の要約アシスタントです。以下の本文を簡潔に要約してください。

- 箇条書きで5〜8点
- 見出し行に1行TL;DR
- 引用があれば1〜2個だけ
- 出典URL: ${url}
`;

  // トークン対策で長文はカット
  const maxChars = 16000;
  const clipped = text.length > maxChars ? text.slice(0, maxChars) : text;

  const body = {
    model,
    temperature: 0.2,
    messages: [
      { role: "system", content: "You are a concise Japanese summarizer." },
      {
        role: "user",
        content: `${prompt}\n\n---\n${clipped}`,
      },
    ],
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("[openai error]", res.status, await res.text());
    return null;
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? null;
}

async function main() {
  const { from, body } = await fetchWithFallback(rawUrl);
  const text = htmlToText(body);

  // まずはOpenAIで要約。キーが無ければプレーンテキストの先頭を返す。
  let summary = await summarizeWithOpenAI(text, rawUrl);

  if (!summary) {
    const fallback = text.slice(0, 1200);
    summary = `**TL;DR**: 要約APIキーが未設定のため、本文冒頭のみ抜粋しています。\n\n${fallback}\n\n—\nSource: ${rawUrl}\nFetchedFrom: ${from}`;
  } else {
    summary = `**TL;DR**\n\n${summary}\n\n—\nSource: ${rawUrl}\nFetchedFrom: ${from}`;
  }

  // 標準出力（ワークフローで tee して summary.md に保存）
  console.log(summary);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
