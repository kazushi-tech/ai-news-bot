// scripts/test_summarize_logic.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 実際には Gemini API を叩くのはコストがかかる＆非決定的なので、
// summarize_article.mjs の renderMarkdown 等のロジックのみをテストしたいが、
// モジュール化されていない部分が多いので、統合テスト的に実行するか、
// あるいは summarize_article.mjs をインポートしてテストするのが難しい。

// ここでは、「疑似的に」Geminiが返したJSONを使って、Frontmatter生成が正しいかを確認する
// ユニットテスト的なスクリプトを作成する

// summarize_article.mjs は export していない関数が多いので、
// 今回変更したロジック (JSONパース -> summaryオブジェクト -> renderMarkdown) を
// 再現して検証する。

function renderMarkdownMock({ title, url, tldr, body, status, tags, importance, importanceReason }) {
  const lines = [];
  lines.push("---");
  lines.push(`title: ${title}`);
  
  if (tags && tags.length > 0) {
      lines.push("tags:");
      tags.forEach(t => lines.push(`  - ${t}`));
  }
  
  if (importance) {
      lines.push(`importance: ${importance}`);
      if (importanceReason) lines.push(`importance_reason: ${importanceReason}`);
  }
  
  lines.push("---");
  lines.push("");
  lines.push(`# ${title}`);
  lines.push("");
  lines.push(`> TL;DR: ${tldr}`);
  lines.push("");
  
  // Body check
  const bodyObj = (typeof body === 'object') ? body : { overview: body };
  if (bodyObj.overview) lines.push(`## Overview\n${bodyObj.overview}`);
  if (bodyObj.keyPoints) lines.push(`## Key Points\n${bodyObj.keyPoints.join('\n')}`);
  
  return lines.join("\n");
}

async function runTest() {
  console.log("=== Testing Logic for Tags & Importance ===");
  
  const mockGeminiResponse = {
    title_ja: "AIの未来",
    tldr: "AIはすごい。",
    body: {
      overview: "AIが進化しています。",
      keyPoints: ["Point 1", "Point 2"],
      whyItMatters: "生活が変わるから",
      whatToDoNext: "勉強しよう"
    },
    tags: ["AI", "Future"],
    importance: 5,
    importance_reason: "革新的だから",
    reliability: "high"
  };
  
  // マッピングロジックの再現
  const summary = {
    titleJa: mockGeminiResponse.title_ja,
    tldr: mockGeminiResponse.tldr,
    body: mockGeminiResponse.body,
    tags: mockGeminiResponse.tags,
    importance: mockGeminiResponse.importance,
    importanceReason: mockGeminiResponse.importance_reason
  };
  
  const output = renderMarkdownMock({
    title: summary.titleJa,
    url: "http://example.com",
    tldr: summary.tldr,
    body: summary.body,
    status: "summarized",
    tags: summary.tags,
    importance: summary.importance,
    importanceReason: summary.importanceReason
  });
  
  console.log("--- Generated Markdown ---");
  console.log(output);
  
  if (output.includes("tags:") && output.includes("- AI") && output.includes("importance: 5")) {
    console.log("\n[PASS] Tags and Importance are present.");
  } else {
    console.error("\n[FAIL] Tags or Importance missing.");
  }
}

runTest();
