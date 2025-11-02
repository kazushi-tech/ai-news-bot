#!/usr/bin/env bash
# scripts/clip_sum_publish.sh
set -e

URL="$1"
if [ -z "$URL" ]; then
  echo "Usage: bash scripts/clip_sum_publish.sh <URL>"
  exit 1
fi

node scripts/clip_url.mjs "$URL"

LATEST="$(ls -t src/clips/*.md | head -n1)"
[ -z "$LATEST" ] && echo "no clip found" && exit 1

node scripts/summarize_clip.mjs "$LATEST"

git add -A
git commit -m "clip+sum (Gemini 2.5-flash)" || true
git push
