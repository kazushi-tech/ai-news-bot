#!/usr/bin/env node
/**
 * build_index_weekly.mjs
 * 目的: 期間内(既定は直近7日)の要約(md)からインデックス表を生成（重複排除・日本語優先）
 * 既定列: タイトル | 記事 | 引用元
 * 追加オプション:
 *  - --from=YYYY-MM-DD --to=YYYY-MM-DD
 *  - --allow=host1,host2            // 許可ドメインのみ抽出
 *  - --with-snippet                  // 要約列追加
 *  - --link=wiki|publish|obsidian    // 記事リンクの形
 */

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import dayjs from "dayjs";
import { articleLink } from "./lib/links.mjs";

/* ---------------------- args/env ---------------------- */
const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, ...v] = a.replace(/^--/, "").split("=");
  return [k, v.join("=") || true];
}));

const LINK_MODE = (args.link || process.env.LINK_MODE || "wiki").toString();
const OBSIDIAN_VAULT = (args.vault || process.env.OBSIDIAN_VAULT || "Main").toString();
const PUBLISH_BASE = (args.publish_base || process.env.PUBLISH_BASE || "").toString();
const WITH_SNIPPET = !!args["with-snippet"];
const SUMMARY_DIR = (args.summary_dir || "summary").toString();
const OUT = (args.out || `summary/index-weekly.md`).toString();

const today = dayjs();
const TO = dayjs((args.to || today.format("YYYY-MM-DD")).toString());
const FROM = dayjs((args.from || today.subtract(6, "day").format("YYYY-MM-DD")).toString());
const ALLOW = (args.allow ? String(args.allow).split(",").map(s => s.trim().toLowerCase()).filter(Boolean) : null);

/* ---------------------- helpers ----------------------- */
function parseUrl(data, content = "") {
  const cand = data.url || data.source || data.source_url || data.link;
  if (cand) return String(cand);
  const m = content.match(/https?:\/\/[^\s)\]]+/);
  return m ? m[0] : "";
}
function hostFrom(u) {
  try {
    return new URL(u).host.toLowerCase();
  } catch {
    return "";
  }
}
function stripMd(md) {
  return String(md || "")
    .replace(/`{3}[\s\S]*?`{3}/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/[#>*_\-\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// === ここから置き換え ===
function jaRatio(s) {
  const m = String(s || "").match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/g);
  return (m ? m.length : 0) / (String(s || "").length || 1);
}

function cleanJaTitle(raw) {
  let base = String(raw || "").trim();

  // 末尾に来がちな区切り + 英語サイト名を丸ごと落とす（保険）
  base = base.replace(/\s*(?:[|｜:：\-–—])\s*[A-Za-z0-9].*$/, "").trim();

  // 代表的な区切り文字で分割（左側・日本語率が高い方を優先）
  const parts = base.split(/\s*(?:\||｜|—|–|－|-|:|：)\s*/g).filter(Boolean);

  // 日本語率が高い最初の要素
  for (const p of parts) {
    if (jaRatio(p) >= 0.2) return p.trim();
  }
  return (parts[0] || base).trim();
}

function titleFrom(data, file) {
  const fallback = path.basename(file).replace(/^\d{4}-\d{2}-\d{2}--/, "").replace(/\.md$/, "");
  const raw = (data.title || data.headline || fallback).toString();
  return cleanJaTitle(raw);
}
// === ここまで置き換え ===


function dateFromName(file) {
  const base = path.basename(file);
  const m = base.match(/^(\d{4}-\d{2}-\d{2})--/);
  return m ? m[1] : null;
}
function inRange(file) {
  const s = dateFromName(file);
  if (!s) return false;
  const d = dayjs(s, "YYYY-MM-DD");
  return (d.isSame(FROM, "day") || d.isAfter(FROM, "day")) && (d.isSame(TO, "day") || d.isBefore(TO, "day"));
}
function uniqueByUrlJaFirst(items) {
  const map = new Map();
  for (const it of items) {
    const key = (it.url || "").replace(/[?#].*$/, "");
    if (!key) continue;
    if (!map.has(key)) {
      map.set(key, it);
      continue;
    }
    const cur = map.get(key);
    const curIsJa = (cur.lang || "").toLowerCase().startsWith("ja");
    const nxtIsJa = (it.lang || "").toLowerCase().startsWith("ja");
    if (!curIsJa && nxtIsJa) map.set(key, it);
  }
  return [...map.values()];
}

/* ---------------------- load & build ------------------ */
const filesAll = (await fs.readdir(SUMMARY_DIR)).filter(f => f.endsWith(".md")).map(f => path.join(SUMMARY_DIR, f));
const files = filesAll.filter(inRange);

const rowsRaw = [];
for (const file of files) {
  const txt = await fs.readFile(file, "utf8");
  const { data, content } = matter(txt);
  const url = parseUrl(data, content);
  const host = hostFrom(url);
  if (ALLOW && (!host || !ALLOW.includes(host))) continue;

  const title = titleFrom(data, file);
  const lang = (data.lang || data.language || "").toString();
  const snippet = data.tldr || data.summary || stripMd(content).slice(0, 200);

  rowsRaw.push({
    file: file.replace(/\\/g, "/"),
    url, host, title, lang, snippet,
    date: dateFromName(file) || ""
  });
}

// 重複排除（URL基準・日本語優先）
const rows = uniqueByUrlJaFirst(rowsRaw);

// ソート：日付 desc → ファイル名 desc
rows.sort((a, b) => (b.date + b.file).localeCompare(a.date + a.file));

const header3 = `| タイトル | 記事 | 引用元 |
|---|---|---|`;
const header4 = `| タイトル | 記事 | 引用元 | 要約 |
|---|---|---|---|`;

const rangeStr = `${FROM.format("YYYY-MM-DD")} 〜 ${TO.format("YYYY-MM-DD")}`;
const lines = [];
lines.push(`# 週次ニュース索引 (${rangeStr})`);
lines.push("");
lines.push(WITH_SNIPPET ? header4 : header3);

for (const it of rows) {
  const linkToArticle = articleLink({
    mode: LINK_MODE,
    vault: OBSIDIAN_VAULT,
    filePath: it.file,
    publishBase: PUBLISH_BASE
  });
  const external = it.url ? `[${it.host || "source"}](${it.url})` : "";
  if (WITH_SNIPPET) {
    lines.push(`| ${it.title} | ${linkToArticle} | ${external} | ${it.snippet} |`);
  } else {
    lines.push(`| ${it.title} | ${linkToArticle} | ${external} |`);
  }
}

await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, lines.join("\n") + "\n", "utf8");

console.log(`✅ weekly index written: ${OUT}`);
