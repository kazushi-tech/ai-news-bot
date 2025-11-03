<%*
const url = await tp.system.prompt("Source URL");
const u = new URL(url);
const hostTag = u.host.replace(/\./g,'-'); // ← 追加
tR = `---
title: "${tp.file.title}"
date: ${tp.date.now("YYYY-MM-DD")}
source_url: "${url}"
host: "${u.host}"
tags: [ai-news, article, ${hostTag}]  // ← ここだけ hostTag
model: gemini-2.5-flash
---
`;
%>

# <% tp.file.title %>

> **引用元**: [<% u.host %>](<% url %>)

## 概要 (TL;DR)

## 重要ポイント

## 詳細レポート（What happened / 背景 / 影響 / 関係者 / データ）
- 

## 引用（Notable quotes）
- 

## リスクと課題
- 

## 今後の見通し / アクション
- 

---
## Source URL（必須）
<% url %>
