
---
title: AI News — Index
---

# AI News — 一覧

```dataview
TABLE WITHOUT ID
  choice(length(default(title_ja, "")) > 0, default(title_ja, ""), "（タイトル未設定）") AS "タイトル",
  link(file.link, "記事ページへ") AS "記事ページへ",
  link(default(source_url, url), "引用元") AS "引用元"
FROM "news/articles"
SORT default(date, file.ctime) DESC

`````





