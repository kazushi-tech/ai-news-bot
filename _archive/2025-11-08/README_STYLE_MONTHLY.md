# Style + Monthly Index Patch

- `.obsidian/snippets/news-publish.css` : 3枚目のスクショに寄せたテーブル＆見出しスタイル
- `scripts/build_index_monthly.mjs` : 今月分の「日次ニュース」を1ページに埋め込むインデックス

## 使い方
1. ファイルをリポジトリ直下に上書き配置
2. Obsidian → 設定 → 外観 → スニペット で **news-publish.css** を有効化
3. 月間インデックス生成：
   ```bash
   node scripts/build_index_monthly.mjs
   ```
   `news/index-monthly.md` が更新されます。
