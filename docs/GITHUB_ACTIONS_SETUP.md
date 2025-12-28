# GitHub Actions Setup for AI News Bot

## Required Secrets

GitHub Repository Settings → Secrets and variables → Actions で以下を設定:

### Discord Bot

- `DISCORD_BOT_TOKEN`: Discord Bot Token
- `DISCORD_CHANNEL_ID`: 投稿先チャンネルID

### (Optional) GitHub Token

- デフォルトの `GITHUB_TOKEN` が自動で利用可能
- `contents: write` 権限が必要な場合は workflow で指定済み

## Workflows

### 1. RSS Ingestion (`ingest_rss.yml`)

- **Schedule**: 6時間ごと (`0 */6 * * *`)
- **Action**: RSS収集 → `state/url_inbox.md` 更新 → Commit & Push
- **Secrets**: 不要

### 2. Post Candidates (`post_candidates.yml`)

- **Schedule**: 毎日0:00 UTC / 9:00 JST (`0 0 * * *`)
- **Action**: Inbox候補をDiscordに投稿（最大10件）
- **Secrets**: `DISCORD_BOT_TOKEN`, `DISCORD_CHANNEL_ID`

### 3. Manual Approval Flow

- Discord上でリアクション（✅/❌）または `/approve` コマンド
- ローカルまたはサーバーで `npm run inbox:manager` を常駐
- 承認後、自動でcommit/push

## Manual Trigger

各workflowは `workflow_dispatch` で手動実行可能:

1. GitHub Actions タブ
2. 対象workflow選択
3. "Run workflow" をクリック
