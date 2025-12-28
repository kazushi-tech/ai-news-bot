# AI News Vault File Specification

このドキュメントは、Obsidian Publish対応のVaultファイル規約を定義します。

---

## 1. ディレクトリ構造

```
vault_root/
├── index.md              # トップページ
├── news/                 # 日次ニュース
│   ├── ai/               # AI News用サブディレクトリ
│   │   ├── INDEX.md      # AI Newsインデックス
│   │   └── YYYY-MM-DD-AI-news.md
│   └── YYYY-MM-DD--AI-news.md  # 既存形式（互換）
├── articles/             # 個別記事ページ
│   └── YYYY-MM-DD--domain--slug.md
├── weekly/               # 週次まとめ
│   └── YYYY-Wnn.md
├── _templates/           # テンプレート（Publish除外）
└── .data/                # データファイル（Publish除外）
```

---

## 2. Frontmatter仕様

### Daily (日次ニュース)

```yaml
---
date: YYYY-MM-DD
kind: ai-news
timezone: Asia/Tokyo
---
```

### Article (個別記事)

```yaml
---
type: ai-news
title: '<日本語タイトル>'
url: '<元URL>'
source_url: '<元URL>'
source: '<ソース名>'
domain: '<ドメイン>'
tldr: '<1行要約>'
created: YYYY-MM-DD
tags: [ai-news, <tag1>, <tag2>]
why_it_matters: '<重要性>'
reliability: high|mid|low
reliability_reason: '<理由>'
interest: 1-5
cssclass: ai-news-article
---
```

### Weekly (週次まとめ)

```yaml
---
week: YYYY-Wnn
range_start: YYYY-MM-DD
range_end: YYYY-MM-DD
kind: ai-news-weekly
---
```

### Index

```yaml
---
kind: ai-news-index
updated: YYYY-MM-DD
---
```

---

## 3. Slug命名規則

### ルール

1. **ベース**: 英数小文字 + ハイフンのみ
2. **最大長**: 80文字
3. **衝突回避**: 必要時ハッシュ8文字を末尾に付与
4. **日本語**: ローマ字化またはハッシュ

### パターン

```
# 記事ファイル
YYYY-MM-DD--{domain}--{slug}.md

# 日次ファイル
YYYY-MM-DD-AI-news.md       # 新形式
YYYY-MM-DD--AI-news.md      # 既存互換

# 週次ファイル
YYYY-Wnn.md
```

### slug生成例

```javascript
// 入力: "OpenAI、GPT-5を発表"
// 出力: "openai-gpt-5-wo-happyou" または "openai-gpt5-a1b2c3d4"
```

---

## 4. Obsidian Publish対応

### 除外設定 (.obsidian/publish.json)

```json
{
  "exclude": ["_templates", ".data", "queue"]
}
```

### CSS Class

- `ai-news-article`: 記事ページ用スタイル
- 対応CSSスニペット: `.obsidian/snippets/ai-news-title.css`

---

## 5. 内部リンク規則

- Obsidian WikiLink形式: `[[articles/filename|表示テキスト]]`
- 外部リンク: `[テキスト](URL)`
- テーブル内のパイプエスケープ: `\\|`
