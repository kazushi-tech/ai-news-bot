#!/usr/bin/env node
/*
summarize.mjs
- Node 20 ESM
- 入力: --url or --seed-file(--seed_file)、--style、--lang、--model
- 出力: out/summary/<RUN_ID>-<host>/summary.md と <host>.html
- 仕様: JSON-LD(Article|NewsArticle|BlogPosting)のarticleBody優先 + Readability併用
- 要: GOOGLE_API_KEY (Google AI Studio / Gemini)
*/

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { fetch } from 'undici';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------
// CLI args
// ---------------------------
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v = ''] = a.split('=');
      const key = k.replace(/^--/, '');
      if (v !== '') args[key] = v;
      else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) args[key] = argv[++i];
      else args[key] = '';
    }
  }
  return args;
}

const args = parseArgs(process.argv);
const INPUT_URL = (args.url || '').trim();
const SEED_FILE = (args['seed-file'] || args['seed_file'] || '').trim();
const STYLE = (args.style || process.env.STYLE || 'general').trim();
const LANG = (args.lang || process.env.SLANG || process.env.LANG || 'ja').trim();
const MODEL = (args.model || process.env.GEMINI_MODEL || 'gemini-1.5-flash').trim();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
if (!GOOGLE_API_KEY) {
  console.error('Missing GOOGLE_API_KEY');
  process.exit(1);
}

// ---------------------------
// Utils
// ---------------------------
const UA = 'ai-news-bot/1.0 (+https://github.com/)';
const ACCEPT_LANG = LANG === 'ja' ? 'ja,en;q=0.8' : 'en,ja;q=0.6';
const RUN_ID = process.env.GITHUB_RUN_ID || String(Date.now());

function sanitizeFilename(s) {
  return s.replace(/[\\/:*?"<>|]/g, '-').slice(0, 200);
}
function hostOf(u) {
  try { return new URL(u).host.replace(/^www\./, ''); } catch { return 'unknown'; }
}
function normalizeText(s) {
  return s
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\u00A0/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function readSeedFile(p) {
  const raw = await fs.readFile(p, 'utf8');
  return raw.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
}

// ---------------------------
// Fetch & extract
// ---------------------------
async function fetchHTML(url) {
  const res = await fetch(url, {
    headers: {
      'user-agent': UA,
      'accept-language': ACCEPT_LANG,
      'accept': 'text/html,application/xhtml+xml',
    },
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${res.statusText}`);
  return await res.text();
}

function extractFromJSONLD(document) {
  const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')];
  for (const s of scripts) {
    try {
      const json = JSON.parse(s.textContent || 'null');
      const items = Array.isArray(json) ? json : [json];
      for (const it of items) {
        const type = (it['@type'] || '').toString().toLowerCase();
        if (/(article|newsarticle|blogposting)/.test(type)) {
          const body = it.articleBody || it.text || it.description;
          if (body && typeof body === 'string') {
            return normalizeText(body);
          }
        }
      }
    } catch { /* ignore */ }
  }
  return '';
}

function extractWithReadability(html, url) {
  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;
  const article = new Readability(doc).parse();
  const text = article?.textContent ? normalizeText(article.textContent) : '';
  return { text, cleanedHTML: article?.content || '' };
}

function extractArticle(html, url) {
  const dom = new JSDOM(html, { url });
  const ldText = extractFromJSONLD(dom.window.document);
  if (ldText) return { text: ldText, cleanedHTML: '' };
  return extractWithReadability(html, url);
}

// ---------------------------
// Gemini
// ---------------------------
async function generateSummary({ text, url, style, lang }) {
  const prompt = [
    `You are a professional news summarizer. Language: ${lang}. Style: ${style}.`,
    `Summarize the article below for busy engineers.`,
    `Return Markdown only. Include:`,
    `- Title (H1)`,
    `- TL;DR (3 sentences)`,
    `- Key points (5-8 bullets, with concise, factual statements)`,
    `- Notable quotes if any (bullets)`,
    `- Source URL at the end`,
    `Article:`,
    text,
  ].join('\n\n');

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GOOGLE_API_KEY}`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errTxt = await res.text().catch(() => '');
    throw new Error(`Gemini API error ${res.status}: ${errTxt}`);
  }
  const data = await res.json();
  const textOut =
    data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('')?.trim();
  if (!textOut) throw new Error('Empty response from Gemini');
  return textOut;
}

// ---------------------------
// Write outputs
// ---------------------------
async function writeOutputs(baseDir, host, url, md, sourceHTML) {
  const dir = path.join(baseDir, `summary/${RUN_ID}-${sanitizeFilename(host)}`);
  await fs.mkdir(dir, { recursive: true });

  const frontmatter =
`---
title: "${sanitizeFilename(host)}"
date: "${new Date().toISOString()}"
url: "${url}"
lang: "${LANG}"
style: "${STYLE}"
model: "${MODEL}"
run_id: "${RUN_ID}"
host: "${host}"
---`;

  const mdPath = path.join(dir, 'summary.md');
  await fs.writeFile(mdPath, `${frontmatter}\n\n${md}\n`, 'utf8');

  const htmlPath = path.join(dir, `${sanitizeFilename(host)}.html`);
  if (sourceHTML) {
    await fs.writeFile(htmlPath, sourceHTML, 'utf8');
  } else {
    // フルHTMLが無い場合はURLだけ入れた簡易HTMLを出しておく
    await fs.writeFile(htmlPath, `<!doctype html><meta charset="utf-8"><p>Source: <a href="${url}">${url}</a>`, 'utf8');
  }

  return { mdPath, htmlPath, outDir: dir };
}

// ---------------------------
// Main
// ---------------------------
async function runOne(url) {
  const host = hostOf(url);
  console.log(`[run] ${host} :: ${url}`);

  const html = await fetchHTML(url);
  const { text, cleanedHTML } = extractArticle(html, url);
  if (!text) throw new Error('Failed to extract article text');

  // レート制御（念のため）
  await delay(100);

  const summary = await generateSummary({ text, url, style: STYLE, lang: LANG });
  const { mdPath, htmlPath } = await writeOutputs('out', host, url, summary, cleanedHTML || html);

  console.log(`[ok] MD: ${mdPath}`);
  console.log(`[ok] HTML: ${htmlPath}`);
}

async function main() {
  try {
    const urls = [];
    if (INPUT_URL) urls.push(INPUT_URL);
    if (SEED_FILE) {
      const fromSeed = await readSeedFile(SEED_FILE);
      urls.push(...fromSeed);
    }
    if (urls.length === 0) {
      console.error('No input. Provide --url or --seed-file');
      process.exit(1);
    }

    // 順次処理（API制限を考慮）
    for (const u of urls) {
      try {
        await runOne(u);
      } catch (e) {
        console.error(`[error] ${u}: ${String(e)}`);
      }
    }
  } catch (e) {
    console.error(String(e));
    process.exit(1);
  }
}

main();
