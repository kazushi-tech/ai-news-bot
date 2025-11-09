---
title: "Bloomberg Japan 一覧"
---
```dataview
TABLE file.link AS 記事, default(date, file.ctime) AS 日付, model AS モデル, source_url AS 出典
FROM "summary"
WHERE host = "bloomberg.co.jp"
SORT date DESC, file.ctime DESC
