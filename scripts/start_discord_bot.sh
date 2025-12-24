#!/bin/bash
# Discord Queue Bot を起動するスクリプト

cd /Users/omats/git-check/myapp/ai-news-bot

# 既存のbotプロセスを停止
pkill -f "discord_queue_bot.mjs" 2>/dev/null || true

# ログディレクトリ作成
mkdir -p logs

# botを起動
exec node --env-file=.env scripts/discord_queue_bot.mjs >> logs/discord_bot.log 2>&1
