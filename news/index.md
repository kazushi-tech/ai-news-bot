---
title: AI News ダッシュボード
---

## 日次
```dataview
LIST FROM "news/daily"
SORT file.name DESC
LIMIT 30
`````

週次
TABLE WITHOUT ID file.link AS "週次"
FROM "news/weekly"
SORT file.name DESC


