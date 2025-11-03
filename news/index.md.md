## 日次
```dataview
TABLE WITHOUT ID file.link AS "日付"
FROM "news/daily"
SORT file.name DESC
TABLE WITHOUT ID file.link AS "週次"
FROM "news/weekly"
SORT file.name DESC

（※ 上の三連バッククォートは「dataview」→コードブロック。貼った後は**編集モード→プレビューモード**に切り替えて表示確認してね）

TABLE WITHOUT ID file.link AS "週次"
FROM "news/weekly"
SORT file.name DESC
LIST FROM "news/weekly"
SORT file.name DESC
LIMIT 1
