# AI News Bot

Discordに投稿されたAI関連ニュースのリンクを収集し、Gemini APIを用いて要約・日本語タイトル翻訳を行い、Obsidian用のMarkdownファイルとして保存するボットシステムです。

## セットアップ

1. **Ruby & Node.js の準備**
   - 必要なバージョンがインストールされていること。
   - `npm install` を実行。

2. **環境変数 (.env)**
   - `DISCORD_TOKEN`: Discord Bot Token
   - `DISCORD_CHANNEL_ID`: 監視するチャンネルID
   - `GOOGLE_API_KEY`: Gemini API Key
   - `GEMINI_RPD_BUDGET`: 1日あたりのGemini API呼び出し上限回数（デフォルト: 15）

## Obsidian での表示設定 (重要)

生成される記事の見栄えを良くするため（Dラボ風）、以下の設定を行ってください。

1. **CSSスニペットの有効化**
   - Obsidianの `Settings` -> `Appearance` -> `CSS snippets` を開く。
   - 以下のスニペットが `ai-news/.obsidian/snippets` に配置されていることを確認し、有効化（トグルON）にする。
     - `ai-news-title.css`

2. **閲覧**
   - `ai-news/news/YYYY-MM-DD--AI-news.md` が日次インデックスです。
   - ここから各記事 (`ai-news/articles/xxxx.md`) に飛ぶことができます。

## 機能

- **Web Clipper的保全**
  - URLが投稿されると即座に記事ファイルを生成します。
  - Gemini APIがレート制限(429)や予算オーバーで使えない場合でも、「未要約」としてリンクを保全します。
- **X (Twitter) 対応**
  - XのURLは本文取得が難しいため、自動的に「リンク保存モード」になります。
- **日本語タイトル**
  - Gemini APIにより、元の英語タイトルを日本語に翻訳して保存します。
