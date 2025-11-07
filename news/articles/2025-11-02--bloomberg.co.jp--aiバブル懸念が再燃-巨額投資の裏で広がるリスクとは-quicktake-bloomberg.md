---
title: 記事タイトル
date: 2025-11-02
model: gemini-2.5-flash
source_url: https://example.com/path
host: example.com
tldr: 1〜3文で要約。
key_points:
  - ポイント1
  - ポイント2
---
```dataview
TABLE 
  date AS "日付",
  title AS "タイトル",
  link(file.path, "記事ページへ") AS "記事ページへ",
  host AS "引用元",
  substring(tldr, 0, 140) + choice(length(tldr) > 140, "…", "") AS "要約"
FROM "news/articles"
WHERE date = date(regexreplace(this.file.name, "--.*$", ""))
SORT file.name DESC

`````

