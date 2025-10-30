import fs from 'node:fs';
import path from 'node:path';

export function ensureFileDir(p) { fs.mkdirSync(path.dirname(p), { recursive: true }); }

export function loadItems(p) {
  ensureFileDir(p);
  if (!fs.existsSync(p)) return [];
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return []; }
}

export function saveItems(p, items) {
  ensureFileDir(p);
  fs.writeFileSync(p, JSON.stringify(items, null, 2) + '\n', 'utf8');
}

export function appendQueueLine(p, url) {
  ensureFileDir(p);
  fs.appendFileSync(p, `${url}\n`, 'utf8');
}

export function readQueueLines(p) {
  if (!fs.existsSync(p)) return [];
  const t = fs.readFileSync(p, 'utf8').trim();
  if (!t) return [];
  return t.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
}

export function clearQueue(p) { fs.writeFileSync(p, '', 'utf8'); }
