---
title: "{{title}}"
title_ja: "{{title_ja}}"
source_url: "{{source_url}}"
date: {{date}}           # 例: 2025-11-08
model: gemini-2.5-flash
host: "{{host}}"
tags: [ai-news]
tldr: |
  {{tldr}}
key_points:
  {{#each key_points}}
  - {{this}}
  {{/each}}
---

# 概要（TL;DR）
{{tldr}}

---

## 詳細レポート
{{#each sections}}
### {{this.title}}
{{this.body}}

{{/each}}

---

## 引用元
- {{#if source_url}}[元記事 ↗]({{source_url}}){{/if}}
- 出典ホスト: **{{host}}**

## リスク・未確定要素
{{risks}}

## 今後の観測／アクション
{{actions}}
