// file: scripts/summarize_from_clip.mjs
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import matter from 'gray-matter';
import * as cheerio from 'cheerio';
import { formatInTimeZone } from 'date-fns-tz';
import { parseISO, isValid as isValidDate } from 'date-fns';
import { fetch as undiciFetch } from 'undici';
import { fetch } from 'undici'; // 追加: リダイレクト解決で使用

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {
  GOOGLE_API_KEY,
  GEMINI_MODEL = 'gemini-2.5-flash',
  TIMEZONE = 'Asia/Tokyo',
  NEWS_ROOT = path.resolve(__dirname, '..', '..'),
  LINK_MODE = 'obsidian',     // 将来拡張用
  AI_NEWS_OFFLINE = '0',
} = process.env;

const ROOT = path.resolve(NEWS_ROOT);
const ARTICLES_DIR = path.join(ROOT, 'articles');

function todayStr() {
  return formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd');
}

function cleanHost(host) {
  return host.replace(/^www\./, '');
}

// ASCIIスラッグ化
function asciiSlugify(input) {
  if (!input) return '';
  const ascii = input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return ascii || '';
}

function fallbackSlugFrom(title, url) {
  const u = new URL(url);
  const tail = decodeURIComponent(u.pathname.split('/').filter(Boolean).pop() || '');
  let candidate = asciiSlugify(tail) || asciiSlugify(title);
  if (!candidate || candidate.length < 3) {
    const h = createHash('sha1').update(title || url).digest('hex').slice(0, 8);
    candidate = `art-${h}`;
  }
  return candidate;
}

async function ensureDirs() {
  await fs.mkdir(ARTICLES_DIR, { recursive: true });
  await fs.mkdir(path.join(ROOT, 'news', 'daily'), { recursive: true });
  await fs.mkdir(path.join(ROOT, 'news', 'weekly'), { recursive: true });
}

async function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => (data += chunk));
    process.stdin.on('end', () => resolve(data.trim()));
  });
}

async function fetchHtml(url) {
  const res = await undiciFetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': 'ai-news-bot/1.0' }
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  return await res.text();
}

// 追加: URL解決（リダイレクト追跡して最終URLを取得）
async function resolveFinalUrl(input) {
  try {
    const res = await fetch(input, { redirect: 'follow' });
    return res?.url || input;
  } catch {
    return input;
  }
}

function extractMeta(html, url) {
  const $ = cheerio.load(html);
  const u = new URL(url);
  const domain = cleanHost(u.host);

  const ogTitle = $('meta[property="og:title"]').attr('content') || '';
  const docTitle = $('title').text()?.trim() || '';
  let title = ogTitle || docTitle;

  const siteName = $('meta[property="og:site_name"]').attr('content') || '';
  const ld = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const raw = $(el).text();
      const json = JSON.parse(raw);
      if (Array.isArray(json)) ld.push(...json);
      else ld.push(json);
    } catch {}
  });

  function pickFromGraph(graph) {
    if (!graph) return {};
    const nodes = Array.isArray(graph) ? graph : graph['@graph'];
    if (!nodes) return {};
    const candidates = nodes.filter(x => x['@type'] && /Article|NewsArticle|BlogPosting/i.test(x['@type']));
    const art = candidates[0] || {};
    const publisher = (art.publisher && (art.publisher.name || art.publisher)) || '';
    return {
      title: art.headline || '',
      datePublished: art.datePublished || art.dateCreated || '',
      publisher: publisher
    };
  }

  let datePublished = '';
  let publisher = '';

  for (const block of ld) {
    if (block['@type'] && /Article|NewsArticle|BlogPosting/i.test(block['@type'])) {
      title = block.headline || title;
      datePublished = block.datePublished || block.dateCreated || datePublished;
      publisher = (block.publisher && (block.publisher.name || block.publisher)) || publisher;
    }
    if (block['@graph']) {
      const g = pickFromGraph(block['@graph']);
      title = g.title || title;
      datePublished = g.datePublished || datePublished;
      publisher = g.publisher || publisher;
    }
  }

  if (!datePublished) {
    const dateMetaSelectors = [
      'meta[property="article:published_time"]',
      'meta[name="article:published_time"]',
      'meta[name="pubdate"]',
      'meta[name="date"]',
      'meta[itemprop="datePublished"]'
    ];
    for (const sel of dateMetaSelectors) {
      const v = $(sel).attr('content');
      if (v) { datePublished = v; break; }
    }
  }

  let created = '';
  if (datePublished) {
    const d = parseISO(datePublished);
    if (isValidDate(d)) {
      created = formatInTimeZone(d, TIMEZONE, 'yyyy-MM-dd');
    }
  }

  const source = siteName || publisher || domain;
  return { title, domain, source, created };
}

function buildPrompt({ clipped, url, source, domain, created }) {
  const createdStr = created || todayStr();
  return [
    {
      role: 'user',
      parts: [
        {
          text:
`あなたはAIニュース編集者です。以下のルールでMarkdown（YAML frontmatter付き）を**厳密フォーマット**で作成してください。

[不変ルール]
- モデル: Gemini 2.5-flash 固定
- 参照優先: 1) CLIPPED（本文の正確性で最優先） 2) URL context（公開日/媒体/不足補完）
- 出力は**日本語・落ち着いた解説調**・誇張NG・固有名詞/数値は正確

[frontmatter（順序固定・必須）]
---
title: "<32〜60字で正確な記事タイトル>"
url: "${url}"
source: "${source}"
domain: "${domain}"
tldr: "<2〜3行で“何が起きた/なぜ重要か”>"
created: "${createdStr}"
tags:
  - "ai-news"
  - "<主要トピック1>"
  - "<主要トピック2>"
check: true
---

[本文セクション（見出しはこの順）]
# 概要
# 背景・前提
# 具体的なポイント
- 箇条書きで要点（1..n）
# 重要な示唆
# リスク・未確定要素
- CLIPPEDとURLに矛盾があれば1行で明記（例：公開日が記事本文とSNS埋め込みで不一致）
# 引用・ソース
- 原文から20語以内の短い引用 + 出典（媒体名/URL）

[CLIPPED（最優先・そのまま整形の参考に）]
${clipped ? '```markdown\n' + clipped + '\n```' : '(なし)'}

[URL CONTEXT（メタ補完のみ）]
- url: ${url}
- source: ${source}
- domain: ${domain}
- created(候補): ${createdStr}

必ず**上のfrontmatterキー順**・見出し順で返してください。`
        }
      ]
    }
  ];
}

async function callGemini(promptParts) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`;
  const body = { contents: promptParts };
  const res = await undiciFetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('')?.trim();
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

function reorderFrontmatter(obj) {
  const ordered = {
    title: obj.title ?? '',
    url: obj.url ?? '',
    source: obj.source ?? '',
    domain: obj.domain ?? '',
    tldr: obj.tldr ?? '',
    created: obj.created ?? todayStr(),
    tags: Array.isArray(obj.tags) ? obj.tags : ['ai-news'],
    check: true
  };
  if (!ordered.tags.includes('ai-news')) {
    ordered.tags = ['ai-news', ...ordered.tags];
  }
  return ordered;
}

async function main() {
  // ---- CLI ----
  const argv = process.argv.slice(2);
  const urlFlagIdx = argv.indexOf('--url');
  if (urlFlagIdx === -1 || !argv[urlFlagIdx + 1]) {
    console.error('Usage: node scripts/summarize_from_clip.mjs --url "https://..." [--clip-file file.md | --clip-stdin]');
    process.exit(1);
    return;
  }
  const inputUrl = argv[urlFlagIdx + 1];

  // 追加: 受け取ったURLのリダイレクトを事前解決
  const finalUrl = await resolveFinalUrl(inputUrl);

  let clipped = '';
  const cf = argv.indexOf('--clip-file');
  const cs = argv.indexOf('--clip-stdin');
  if (cf !== -1 && argv[cf + 1]) {
    clipped = await fs.readFile(argv[cf + 1], 'utf8');
  } else if (cs !== -1) {
    clipped = await readStdin();
  }

  await ensureDirs();

  // ---- URLメタ抽出（finalUrlで実施） ----
  let meta = { title: '', domain: '', source: '', created: '' };
  try {
    const html = await fetchHtml(finalUrl);
    meta = extractMeta(html, finalUrl);
  } catch (e) {
    console.warn('[warn] URLメタ抽出に失敗:', e.message);
    const u = new URL(finalUrl);
    meta.domain = cleanHost(u.host);
    meta.source = meta.domain;
  }
  if (!meta.created) meta.created = todayStr();

  // ---- Gemini 要約（CLIPPED優先）----
  let modelMd = '';
  if (AI_NEWS_OFFLINE === '1') {
    modelMd = `---
title: "${meta.title || '（タイトル未取得）'}"
url: "${finalUrl}"
source: "${meta.source}"
domain: "${meta.domain}"
tldr: "（オフラインモード）"
created: "${meta.created}"
tags:
  - "ai-news"
  - "placeholder"
  - "placeholder"
check: true
---
# 概要
（オフラインモードのダミー）

# 背景・前提
# 具体的なポイント
- point

# 重要な示唆
# リスク・未確定要素
# 引用・ソース
- 引用（ダミー） — ${meta.source} / ${finalUrl}
`;
  } else {
    const prompt = buildPrompt({
      clipped,
      url: finalUrl,      // 最終URLを“正”
      source: meta.source,
      domain: meta.domain,
      created: meta.created
    });
    modelMd = await callGemini(prompt);
  }

  // ---- frontmatter検査・補完・順序固定 ----
  const parsed = matter(modelMd);
  const fm = parsed.data || {};

  fm.url = finalUrl;
  fm.source = meta.source || fm.source || meta.domain;
  fm.domain = meta.domain || fm.domain;
  fm.created = fm.created || meta.created || todayStr();

  const orderedFm = reorderFrontmatter(fm);

  // ---- ファイル名生成（finalUrlベース） ----
  const host = orderedFm.domain;
  const slug = fallbackSlugFrom(orderedFm.title, finalUrl);
  const filename = `${orderedFm.created}--${host}--${slug}.md`;
  const outPath = path.join(ARTICLES_DIR, filename);

  // ---- 最終Markdown整形 ----
  const body = parsed.content.trim().length ? parsed.content.trim() : '# 概要\n（本文未取得）';
  const finalMdOut = matter.stringify(body, orderedFm);

  await fs.writeFile(outPath, finalMdOut, 'utf8');
  console.log(`[ok] ${path.relative(ROOT, outPath)}`);
}

main().catch(err => {
  console.error('[error]', err);
  process.exit(1);
});
