
The Information 一覧
TABLE file.link AS 記事, date AS 日付, default(model,"") AS モデル, default(source_url,"") AS 出典
FROM "summary" OR "src/summary"
WHERE contains(lower(string(source_url) + " " + string(host) + " " + file.name), "theinformation.com")
SORT date DESC


