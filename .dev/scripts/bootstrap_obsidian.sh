#!/usr/bin/env bash
set -euo pipefail

# 必要フォルダ
mkdir -p news sources indexes/weekly clips templates

# 記事テンプレ
cat > templates/article.md <<'MD'
---
title: ""
source_url: ""
date: ""
model: "gemini-2.5-flash"
host: ""
tags: [ai-news]
---
## 概要 (TL;DR)
## 重要ポイント
## 詳細レポート（What happened/背景/影響/関係者/データ表）
## 引用（Notable quotes）
## リスクと課題
## 今後の見通し/アクション

---
## Source URL（必須）
MD

# ソース別インデックス汎用テンプレ（Dataview）
cat > templates/source_index.md <<'MD'
---
title: "<host> Index"
tags: [ai-news, source-index]
---
# <host> の記事一覧
> 自動生成。編集しないでOK。

```dataview
TABLE file.link AS 記事, date AS 日付, model AS モデル, source_url AS 出典
FROM "news"
WHERE contains(lower(host), this.file.name)
SORT date DESC
