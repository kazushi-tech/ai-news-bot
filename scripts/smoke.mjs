// scripts/smoke.mjs
// 1件だけ通すスモークテスト（Dwarkeshのカラパシー記事例を使用）

import fs from 'fs';
import { execFileSync } from 'child_process';

fs.mkdirSync('sources', { recursive: true });
const line = "- [ ] https://www.dwarkesh.com/p/andrej-karpathy\n";
fs.appendFileSync('sources/url_inbox.md', line, 'utf8');

console.log('Added 1 URL to sources/url_inbox.md');
execFileSync('node', ['scripts/build_ai_news.mjs', '--max', '1', '--jp-columns', '--save-fulltext'], { stdio: 'inherit' });