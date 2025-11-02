#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const domain = (process.argv[2] || "").trim();
if (!domain) {
  console.error("Usage: node scripts/make_source_note.mjs <domain>");
  process.exit(1);
}

const dir = "sources";
await fs.mkdir(dir, { recursive: true });

const md = `---
title: "${domain} 一覧"
---
\`\`\`dataview
TABLE file.link AS 記事, default(date, file.ctime) AS 日付, model AS モデル, source_url AS 出典
FROM "summary"
WHERE host = "${domain}"
SORT date DESC, file.ctime DESC
\`\`\`
`;

const out = path.join(dir, `${domain}.md`);
await fs.writeFile(out, md, "utf8");
console.log(`Created: ${out}`);
