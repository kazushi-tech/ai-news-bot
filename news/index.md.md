---
title: AI News ダッシュボード
---

## 日次
```dataview
TABLE WITHOUT ID file.link AS "日次"
FROM "news/daily"
SORT file.name DESC
LIMIT 7
`````
## 週次
```dataview
TABLE WITHOUT ID file.link AS "週次"
FROM "news/weekly"
SORT file.name DESC
LIMIT 8
`````

