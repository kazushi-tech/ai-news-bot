import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = path.resolve(process.env.NEWS_ROOT ?? path.resolve('.', ''));
const DIR  = path.join(ROOT, 'articles');

function buildBody(fm, body) {
  const title = fm.title ?? '（無題）';
  const url   = fm.source_url ?? fm.url ?? '';
  const host  = fm.host ?? fm.source ?? '';
  const tldr  = fm.tldr ?? '';

  // key_points が配列なら番号付きに
  let details = '';
  if (Array.isArray(fm.key_points) && fm.key_points.length) {
    details =
      '## 詳細レポート\n' +
      fm.key_points.map((p, i) => `### ${i + 1}. ${p.title ?? ''}\n${p.text ?? p}`).join('\n\n');
  }

  return [
    `# ${title}`,
    `\n> [!quote] 引用元\n> 元記事: ${url ? `<${url}>` : '（不明）'}  \n> 媒体: ${host || '（不明）'}`,
    `\n> [!summary] 概要\n> ${tldr || '（準備中）'}`,
    details || '## 詳細レポート\n（準備中）',
    '## まとめ\n（必要に応じて追記）',
    '## リスク・未確定要素\n- （必要に応じて追記）'
  ].join('\n\n');
}

async function main() {
  const files = (await fs.readdir(DIR)).filter(f => f.endsWith('.md'));
  let fixed = 0;

  for (const f of files) {
    const fp = path.join(DIR, f);
    const raw = await fs.readFile(fp, 'utf8');
    const { data: fm, content } = matter(raw);

    // 既存本文から「引用元」「概要」コールアウトの重複を除去（保守的に）
    const cleaned = content
      .replace(/^> \[!quote\][\s\S]*?(?:\n(?=^#|^##|^> \[!|\Z))/m, '')
      .replace(/^> \[!summary\][\s\S]*?(?:\n(?=^#|^##|^> \[!|\Z))/m, '')
      .trim();

    const body = buildBody(fm, cleaned);
    const out  = matter.stringify(body, fm);

    if (out.trim() !== raw.trim()) {
      await fs.writeFile(fp, out, 'utf8');
      fixed++;
    }
  }
  console.log(`[doctor_format_articles] formatted ${fixed} file(s).`);
}

main().catch(e => { console.error(e); process.exit(1); });
