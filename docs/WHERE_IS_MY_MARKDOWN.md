# Where is my Markdown?

AI News Botが生成するMarkdownファイルの場所と、確認方法をまとめたドキュメントです。

## ファイルの場所

| 種別           | パス                        | 説明             |
| -------------- | --------------------------- | ---------------- |
| **index.md**   | `ai-news-bot/index.md`      | トップページ     |
| **Daily News** | `ai-news-bot/news/*.md`     | 日次ニュース一覧 |
| **Articles**   | `ai-news-bot/articles/*.md` | 個別記事ページ   |
| **Weekly**     | `ai-news-bot/weekly/*.md`   | 週次まとめ       |

## Obsidianで開く方法

1. Obsidianを起動
2. **Open folder as vault** を選択
3. `ai-news-bot/` フォルダを選択（`.obsidian` がある場所）

## 確認コマンド

```bash
# 生成物の場所と件数を確認
npm run doctor

# 出力例:
# 📄 index.md: ✅ 412 bytes
# 📁 articles/: ✅ 12 files
# 📁 news/: ✅ 5 files
# 📁 weekly/: ✅ 1 files
```

## 生成コマンド

```bash
# index.md + daily を更新
npm run build:all

# 週次レポート生成
npm run build:weekly

# 単一URL検証（dry-run）
npm run verify:url -- https://example.com --dry-run
```

## トラブルシューティング

### ファイルが見えない

1. `npm run doctor` でパスを確認
2. Obsidianで正しいVault (`ai-news-bot/`) を開いているか確認
3. Obsidianをリロード（Cmd+R / Ctrl+R）

### 親ディレクトリに古いファイルがある

以前のバージョンでは `myapp/` に出力されていました。
`npm run doctor` で警告が表示された場合、手動で移動してください：

```bash
# 移動（重複を避けるため -n オプション）
cp -n ../articles/*.md articles/
cp -n ../news/*.md news/
```
