#!/usr/bin/env node
// smoke.mjs — 環境/ディレクトリ/依存の簡易チェック


import fs from 'node:fs';
import path from 'node:path';


const mustDirs = ['news', 'sources', '.cache'];
const mustFiles = ['package.json', '.env.example'];


let ok = true;


const ver = process.versions.node;
console.log('Node version:', ver);
if (!/^\d+/.test(ver) || Number(ver.split('.')[0]) < 24) {
console.error('NG: Node 24+ が必要です');
ok = false;
}


for (const d of mustDirs) {
if (!fs.existsSync(path.join(process.cwd(), d))) {
console.error('NG: missing dir', d);
ok = false;
}
}
for (const f of mustFiles) {
if (!fs.existsSync(path.join(process.cwd(), f))) {
console.error('NG: missing file', f);
ok = false;
}
}


if (ok) {
console.log('OK: environment looks good.');
}