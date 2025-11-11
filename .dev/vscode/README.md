# ai-news-bot


Discordに貼られたURLやRSSから記事を取得 → 要約 → frontmatter付きMarkdownを `news/` に生成します。GitHub Actionsで無料運用でき、Obsidianボルトへも直出力（`VAULT_DIR`）可能です。


## Quick Start


```bash
# 1. 依存関係
npm i


# 2. .env を作成
cp .env.example .env
# 値を編集 → 以下をまとめて読み込み(推奨)
set -a && source ./.env && set +a


# 3. 初回ディレクトリ作成
npm run init:dirs


# 4. ローカル Smoke
# (記事URLを1行追記して1件ビルド)
echo "- [ ] https://www.dwarkesh.com/p/andrej-karpathy" >> sources/url_inbox.md
npm run build:news -- --max 1 --jp-columns --save-fulltext


# 5. Bot (任意)
npm run start:bot