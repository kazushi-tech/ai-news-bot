#!/usr/bin/env node
import 'dotenv/config';
import { execFileSync } from 'node:child_process';

// 実体は build_ai_news.mjs と同じ。--rss 未指定で max 任意。
execFileSync('node', ['scripts/build_ai_news.mjs', '--max', process.argv[2] || '5', '--jp-columns', '--save-fulltext'], { stdio: 'inherit' });
