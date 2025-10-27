#!/usr/bin/env node
import 'dotenv/config';
import fs from 'node:fs/promises';
import fssync from 'node:fs';
import path from 'node:path';
import Parser from 'rss-parser';
import {
  ensureDir, readJson, writeJson, stripUtm, toSlug, jstDateStr,
  fetchHTML, extractArticle, detectLang, domainFromUrl, tagsFromDomain,
  copyToVaultDir, tableHeader
} from '../lib/utils.mjs';

const args = parseArgs(process.argv.slice(2));
const LOG = !!process.env.LOG_EVERYTHING;

const NEWS_DIR = 'news';
const FULL_DIR = 'news/fulltext';
const SEEN_FILE = '.cache/seen.json';
const INBOX = 'sources/url_inbox.md';
const RSS_FILE = 'sources/rss.txt';

(async () => {
  await ensureDir(NEWS_DIR);
  await ensureDir(FULL_DIR);
  await ensureDir('.cache');

  const seen = await readJson(SEEN_FILE, []);
  const today = jstDateStr();

  // 収集
  let targets = [];
  if (args.rss) {
    targets = await collectFromRss({ sinceDays: args['since-days'] ?? 7, max: args.max ?? 20, seen });
  } else {
    targets = await collectFromInbox({ max: args.max ?? 1, seen });
  }
  if (targets.length === 0) {
    console.log('No new targets.');
    process.exit(0);
  }

  // 処理
  const rows = [];
  for (const u of targets) {
    const url = stripUtm(u);
    try {
      const html = await fetchHTML(url);
      const art = extractArticle(html, url);
      const domain = domainFromUrl(url);
      const lang = detectLang((art?.textContent || '') + ' ' + (art?.title || ''));
      const tags = tagsFromDomain(url);

      const title = (art?.title || tryTitleFromHtml(html) || url).trim();
      const slug = `${today}--${toSlug(title) || toSlug(domain) || 'untitled'}`;
      const fullPath = path.join(FULL_DIR, `${slug}.md`);

      // 概要（課金ゼロ＝ローカル要約）: 先頭~中盤の重要っぽい文を数行抽出（雑だが実用）
      const summary = summarizeLocal(art?.textContent || art?.excerpt || '', lang.code);

      // 任意: OpenAI要約
      const ai = process.env.OPENAI_API_KEY ? await tryAiSummary(title, art?.textContent || '', lang.code) : null;

      const md = buildArticleMarkdown({
        title, url, domain, date: today, tags, lang, art, summary, ai
      });
      await fs.writeFile(fullPath, md);
      LOG && console.log('saved fulltext:', fullPath);

      rows.push({
        time: new Date().toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit' }),
        title, url, domain, lang: lang.code, tags
      });

      // seen更新 & inboxチェック
      if (!seen.includes(url)) seen.push(url);
      await markInboxChecked(url).catch(() => {});

      // ちょい待ち（連投抑制）
      await new Promise((r) => setTimeout(r, 200));
    } catch (e) {
      console.error('Process error:', url, e.message);
    }
  }

  await writeJson(SEEN_FILE, seen);

  // デイリーファイル
  const dayMd = path.join(NEWS_DIR, `${today}--AI-news.md`);
  const jp = !!args['jp-columns'];
  const table = renderTable(rows, { jp });

  if (!fssync.existsSync(dayMd)) {
    const header = jp ? `# AIニュース (${today})\n\n` : `# AI News (${today})\n\n`;
    await fs.writeFile(dayMd, header + table);
  } else {
    await fs.appendFile(dayMd, table);
  }
  console.log(`OK: ${rows[0]?.title || 'N/A'} / Processed ${rows.length} item(s.)`);

  // Obsidianへコピー（ローカルのみ）
  if (process.env.VAULT_DIR) {
    await copyToVaultDir(process.env.VAULT_DIR);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const v = (argv[i + 1] && !argv[i + 1].startsWith('--')) ? argv[++i] : true;
      out[k] = /^\d+$/.test(v) ? Number(v) : v;
    }
  }
  return out;
}

async function collectFromInbox({ max, seen }) {
  const txt = fssync.existsSync(INBOX) ? await fs.readFile(INBOX, 'utf8') : '';
  const lines = txt.split('\n').map(s => s.trim());
  const urls = [];
  for (const l of lines) {
    const m = l.match(/^- \[ \] (https?:\/\/\S+)/);
    if (m) {
      const u = m[1];
      if (!seen.includes(u)) urls.push(u);
    }
  }
  return urls.slice(0, max);
}

async function collectFromRss({ sinceDays = 7, max = 20, seen }) {
  const parser = new Parser();
  const feeds = fssync.existsSync(RSS_FILE) ? (await fs.readFile(RSS_FILE, 'utf8')).split('\n').map(s => s.trim()).filter(Boolean) : [];
  const since = Date.now() - sinceDays * 86400000;
  const picked = [];
  for (const f of feeds) {
    try {
      const feed = await parser.parseURL(f);
      for (const item of feed.items || []) {
        const link = item.link || item.guid || '';
        if (!link) continue;
        const pub = item.isoDate ? new Date(item.isoDate).getTime() : (item.pubDate ? new Date(item.pubDate).getTime() : 0);
        if (pub && pub < since) continue;
        if (!seen.includes(link)) picked.push(link);
      }
    } catch (e) {
      console.error('RSS error:', f, e.message);
    }
  }
  // 重複排除＆最大件数
  const uniq = Array.from(new Set(picked));
  return uniq.slice(0, max);
}

function tryTitleFromHtml(html) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1] : '';
}

function summarizeLocal(text, langCode = 'ja') {
  if (!text) return '';
  const sents = splitSentences(text, langCode).slice(0, 8);
  return sents.slice(0, 4).join(' ');
}

async function tryAiSummary(title, text, langCode = 'ja') {
  if (!text) return null;
  try {
    const sys = "You are an assistant that writes concise tech news briefs.";
    const jp = langCode === 'ja';
    const user = [
      `記事タイトル: ${title}`,
      `本文（抜粋）: ${text.slice(0, 6000)}`
    ].join('\n');
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: `${user}\n\n出力は${jp ? '日本語' : 'English'}で、「概要(5行以内)」「詳細レポート(箇条書き5点)」を返して。` }
        ],
        temperature: 0.2
      })
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';
    return content;
  } catch (e) {
    console.error('AI summary error:', e.message);
    return null;
  }
}

function buildArticleMarkdown({ title, url, domain, date, tags = [], lang, art, summary, ai }) {
  const langLabel = lang?.name || 'Unknown';
  const fm = [
    '---',
    `title: "${escapeYaml(title)}"`,
    `date: ${date}`,
    `url: ${url}`,
    `domain: ${domain}`,
    `lang: ${lang?.code || 'und'}`,
    `tags: [${tags.map(t => `"${t}"`).join(', ')}]`,
    '---\n'
  ].join('\n');

  const header = `# ${title}\n\n`;

  const sectionSource = [
    '## 🔗 引用元',
    `- **URL**: ${url}`,
    `- **サイト**: ${art?.siteName || domain}`,
    art?.byline ? `- **著者**: ${art.byline}` : '',
    `- **言語**: ${langLabel}`,
    ''
  ].filter(Boolean).join('\n');

  const sectionSummary = [
    '## 🧭 概要',
    (ai ? ai.split('\n').slice(0, 10).join('\n') : (summary || '(no summary)')),
    ''
  ].join('\n');

  const sectionDetail = [
    '## 📝 詳細レポート',
    (ai ? ai : (art?.markdown || '(no content)'))
  ].join('\n');

  return fm + header + sectionSource + '\n' + sectionSummary + '\n' + sectionDetail + '\n';
}

function escapeYaml(s) {
  return String(s).replace(/"/g, '\\"');
}

function splitSentences(text, langCode) {
  if (langCode === 'ja') {
    return text.split(/(?<=[。！!？\?])/).map(s => s.trim()).filter(Boolean);
  }
  return text.split(/(?<=[\.\!\?])\s+/).map(s => s.trim()).filter(Boolean);
}

function renderTable(rows, { jp = false } = {}) {
  let md = tableHeader({ jp });
  for (const r of rows) {
    const tags = r.tags.join(',');
    md += `| ${r.time} | [${escapePipes(r.title)}](${r.url}) | ${r.domain} | ${r.lang} | ${tags} |\n`;
  }
  md += '\n';
  return md;
}

function escapePipes(s) { return String(s).replace(/\|/g, '\\|'); }

async function markInboxChecked(url) {
  if (!fssync.existsSync(INBOX)) return;
  const txt = await fs.readFile(INBOX, 'utf8');
  const out = txt.replace(new RegExp(`^- \\[ \\] ${escapeReg(url)}$`, 'm'), `- [x] ${url}`);
  if (out !== txt) await fs.writeFile(INBOX, out);
}
function escapeReg(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
