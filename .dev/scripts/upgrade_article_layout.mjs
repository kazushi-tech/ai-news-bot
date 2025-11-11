// v7 safe+hard: backup → 強めの正規化 → 再構成 → 仕上げで「H見出し→コールアウト」を強制変換
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT       = path.resolve(__dirname, "..");
const DIR        = path.join(ROOT, "articles");
const BAKDIR     = path.join(DIR, ".backup");

const VARIANTS = {
  summary:      ["概要","要約","サマリー","TL;DR","TLDR"],
  background:   ["背景・前提","背景","前提"],
  points:       ["具体的なポイント","要点","ポイント","Key Points","キーポイント"],
  implications: ["重要な示唆","示唆","Implications","意味合い"],
  risks:        ["リスク・未確定要素","リスク","課題","懸念","Limitations"],
  quote:        ["引用・ソース","引用元","出典","ソース","参考","References"]
};
const ORDER = [
  ["summary","summary","概要"],
  ["background","note","背景・前提"],
  ["points","check","具体的なポイント"],
  ["implications","tip","重要な示唆"],
  ["risks","warning","リスク・未確定要素"],
];

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function stripAllBlockquotes(txt){
  // 行頭の ">> > " のような連続引用も全て剥がす
  return txt.split("\n").map(l=>l.replace(/^\s*(?:>\s*)+/, "")).join("\n");
}
function stripAnyQuoteSection(txt){
  // callout型（> [!quote] / [!QUOTE] / [quote] 等）
  txt = txt.replace(/(^|\n)\s*(?:>\s*)?\[\!?quote\][^\n]*\n(?:\s*(?:>\s*)?.*\n)*/ig, "$1");
  // 見出し型
  txt = txt.replace(/(^|\n)\s*#{1,6}\s*(?:引用元|引用・ソース)[^\n]*\n[\s\S]*?(?=(\n\s*#{1,6}\s)|\n?$)/ig, "$1");
  // プレーン型
  txt = txt.replace(/(^|\n)\s*(?:引用元|引用・ソース)\s*\n(?:\s*[-・].*\n)+/ig, "$1");
  return txt;
}
function calloutLineToHeading(txt){
  // 行頭に ">", 全角/半角スペースがあってもOK
  return txt.replace(/^\s*(?:>\s*)?\[!?([a-z]+)\]\s*(.+?)(?:\s*[:：])?\s*$/gmi, "## $2");
}
function removeDuplicateH1(txt, title){
  if (!title) return txt;
  const re = new RegExp(`^\\s*#\\s+${esc(title)}\\s*$\\n?`, "m");
  return txt.replace(re, "");
}
function splitSectionsByHeadings(txt){
  const all = Object.values(VARIANTS).flat().map(esc).join("|");
  const re  = new RegExp(String.raw`(^|\n)\s*#{1,6}\s*(?:${all})(?:\s*[:：])?\s*\r?\n`, "gi");
  const idx = [];
  let m;
  while ((m = re.exec(txt))) idx.push(m.index + (m[1] ? m[1].length : 0));
  const blocks = [];
  for (let i=0;i<idx.length;i++){
    const s = idx[i];
    const e = i+1<idx.length ? idx[i+1] : txt.length;
    const chunk = txt.slice(s, e);
    const head  = (chunk.match(/^\s*#{1,6}\s*(.+)$/m)||[])[1]?.trim()||"";
    const label = head.replace(/\s*[:：]\s*$/,"");
    const body  = chunk.replace(/^\s*#{1,6}\s*.+\r?\n/,"");
    blocks.push({ label, body });
  }
  return blocks;
}
function classify(label){
  const low = label.toLowerCase();
  for (const [key, list] of Object.entries(VARIANTS)){
    if (list.some(w => low.includes(w.toLowerCase()))) return key;
  }
  return null;
}
function toCallout(tag, title, body){
  const q = (body ?? "").trimEnd().split("\n").map(l=>`> ${l}`.replace(/>\s*$/,"")).join("\n");
  return `> [!${tag}] ${title}\n${q}\n`;
}
function buildTop(title, url, host, dateStr){
  const h1 = title ? `# ${title}\n\n` : "";
  const quote =
    `> [!quote] 引用元\n` +
    `> - 元記事: ${url || "（不明）"}\n` +
    `> - 媒体: ${host || "（不明）"}\n` +
    (dateStr ? `> - 公開日: ${dateStr}\n` : "") + `\n`;
  return h1 + quote;
}

// 仕上げ：まだ H見出しが残っていたら、容赦なくコールアウトに変換（強制）
function hardenHeadingsToCallouts(md){
  for (const [keyWords, tag, label] of ORDER){
    const words = VARIANTS[keyWords];
    const w     = words.map(esc).join("|");
    const re = new RegExp(
      String.raw`(^|\n)\s*#{1,6}\s*(?:${w})(?:\s*[:：])?\s*\r?\n` +
      String.raw`([\s\S]*?)(?=(\n\s*#{1,6}\s)|\n?$)`,
      "gi"
    );
    md = md.replace(re, (_m, pfx, body) => pfx + toCallout(tag, label, body));
  }
  return md;
}

async function run(){
  await fs.mkdir(BAKDIR, { recursive: true });
  const files = (await fs.readdir(DIR)).filter(f=>f.endsWith(".md"));
  let changed = 0;

  for (const f of files){
    const fp  = path.join(DIR, f);
    const raw = await fs.readFile(fp, "utf8");
    const fm  = matter(raw);
    const orig = fm.content;

    // 正規化（強め）
    let base = orig;
    base = stripAllBlockquotes(base);
    base = stripAnyQuoteSection(base);
    base = calloutLineToHeading(base);
    base = removeDuplicateH1(base, fm.data.title);

    // セクション抽出
    const blocks = splitSectionsByHeadings(base);
    const bucket = {};
    for (const b of blocks){
      const k = classify(b.label);
      if (!k) continue;
      (bucket[k] ||= []).push(b.body.trim());
    }

    // 再構成
    let body = "";
    if (Object.keys(bucket).length === 0){
      body = toCallout("summary", "概要", orig.trim());
    } else {
      for (const [key, tag, label] of ORDER){
        if (bucket[key]?.length){
          body += toCallout(tag, label, bucket[key].join("\n\n"));
        }
      }
      // 余剰テキスト（見出し外）も拾う
      const consumed = blocks.map(b=>b.body).join("");
      const residual = base.replace(consumed, "").trim();
      if (residual) body += toCallout("note", "補足", residual);
    }

    // 最終ハード補正：残った H見出しをコールアウトへ強制変換
    body = hardenHeadingsToCallouts(body);

    const head = buildTop(
      fm.data.title,
      fm.data.source_url || fm.data.url || "",
      fm.data.host || fm.data.source || "",
      fm.data.date || fm.data.published || ""
    );
    const nextContent = (head + body).trim() + "\n";

    // 仕上げチェック：summary/tip 等のコールアウトが一つも無ければ全体を概要で包む
    if (!/\n>\s*\[!(summary|note|check|tip|warning)\]/i.test(nextContent)){
      console.warn(`[force-wrap] ${f}: no callouts detected, wrapping as summary.`);
      body = toCallout("summary", "概要", orig.trim());
    }

    const next = matter.stringify((head + body).trim() + "\n", fm.data);

    // 極端に短くなる場合はスキップ
    const tooShort = next.length < Math.min(raw.length * 0.4, raw.length - 500);
    if (tooShort){
      console.warn(`[skip] ${f} looks too short after transform. skipped.`);
      continue;
    }

    if (next !== raw){
      await fs.writeFile(path.join(BAKDIR, f + ".bak"), raw, "utf8");
      await fs.writeFile(fp, next, "utf8");
      changed++;
    }
  }
  console.log(`[upgrade v7] updated ${changed} file(s). (backup -> ${path.relative(ROOT, BAKDIR)})`);
}

run().catch(e=>{ console.error(e); process.exit(1); });
