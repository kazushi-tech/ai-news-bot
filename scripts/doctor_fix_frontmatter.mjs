// file: scripts/doctor_fix_frontmatter.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ARTICLES_DIR = path.join(ROOT, "news", "articles");

// 「日本語かどうか」ざっくり判定（漢字/ひらがな/カタカナ/長音等）
const JP_REGEX = /[一-龯ぁ-んァ-ンー々〆〇]/u;

function pickHost(u) {
  try { return new URL(u).host; } catch { return undefined; }
}

function ymdFromFilename(fn) {
  const m = fn.match(/^(\d{4}-\d{2}-\d{2})--/);
  return m?.[1];
}

async function* iterMarkdown(dir) {
  const ents = await fs.readdir(dir, { withFileTypes: true });
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* iterMarkdown(p);
    else if (e.isFile() && e.name.endsWith(".md")) yield p;
  }
}

function build(front, body) {
  return matter.stringify(body ?? "", front, { language: "yaml" });
}

async function main() {
  let fixed = 0;
  for await (const fp of iterMarkdown(ARTICLES_DIR)) {
    const raw = await fs.readFile(fp, "utf8");
    const { data: fm, content } = matter(raw);

    const next = { ...fm };

    // 1) source_url の補完（url / source / link 等から拾う）
    next.source_url =
      fm.source_url ??
      fm.url ??
      fm.source_url_raw ??
      fm.link ??
      fm.source ??
      undefined;

    // 2) host の補完
    next.host = fm.host ?? pickHost(next.source_url) ?? pickHost(fm.url);

    // 3) date の補完（frontmatter→ファイル名→保持）
    next.date = fm.date ?? ymdFromFilename(path.basename(fp));

    // 4) 日本語タイトルの整理：title_ja が空なら、
    //    - fm.title が日本語っぽければそれを採用
    //    - それ以外は空（Dataview側で「（タイトル未設定）」表示）
    if (!fm.title_ja || String(fm.title_ja).trim() === "") {
      if (fm.title && JP_REGEX.test(String(fm.title))) {
        next.title_ja = String(fm.title).trim();
      } else {
        // 何もしない（空のままにして英語を出さない）
        delete next.title_ja;
      }
    }

    // 5) model は既定値が欲しければ付与（任意）
    next.model = fm.model ?? "gemini-2.5-flash";

    // 変更があれば書き戻し
    const same =
      String(fm.source_url ?? "") === String(next.source_url ?? "") &&
      String(fm.host ?? "") === String(next.host ?? "") &&
      String(fm.date ?? "") === String(next.date ?? "") &&
      String(fm.title_ja ?? "") === String(next.title_ja ?? "") &&
      String(fm.model ?? "") === String(next.model ?? "");

    if (!same) {
      const out = build(next, content);
      await fs.writeFile(fp, out, "utf8");
      fixed++;
    }
  }
  console.log(`[doctor] fixed ${fixed} file(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
