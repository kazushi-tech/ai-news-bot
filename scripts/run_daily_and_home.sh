#!/bin/zsh
set -euo pipefail

cd ~/git-check/myapp/ai-news-bot

echo "[runner] === run_daily_and_home.sh start ==="

# 1) Daily インデックス生成
echo "[runner] npm run daily"
npm run daily

# 2) X clips インデックス生成
echo "[runner] node scripts/build_index_x_clips.mjs"
node scripts/build_index_x_clips.mjs

# 3) ドメイン別インデックス生成
echo "[runner] node scripts/build_sources_index.mjs"
node scripts/build_sources_index.mjs

# 4) ホーム (Weekly / Daily / その他リンク) 生成
echo "[runner] npm run home"
npm run home

echo "[runner] === run_daily_and_home.sh done ==="
