// 全記事を走査し、domainごとにテーブル化
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const SOURCES = ["articles", "summary"];
const OUT_DIR = path.join(ROOT, "domains");

async function exists(p) { try { await fs.access(p); return true; } catch { return false; } }
async function walk(dir, out = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const fp = path.join(dir, e.name);
    if (e.isDirectory()) await walk(fp, out);
    else if (e.isFile() && /\.md$/i.test(e.name)) out.push(fp);
  } return out;
}
function parseFrontmatter(md) {
  const res = {};
  if (!md.startsWith("---")) return res;
  const end = md.indexOf("\n---", 3);
  if (end === -1) return res;
  const fm = md.slice(3, end).replace(/^\n/, "");
  for (const line of fm.split(/\r?\n/)) {
    const m = line.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    let [, k, v] = m; v = v.trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    res[k] = v;
  }
  return res;
}
function makeLink(fp) {
  const rel = path.relative(ROOT, fp).replaceAll(path.sep, "/");
  return `[[${rel}]]`;
}
function escapePipes(s) { return String(s ?? "").replaceAll("|", "\\|"); }

async function main() {
  const files = [];
  for (const dir of SOURCES) {
    const p = path.join(ROOT, dir);
    if (await exists(p)) await walk(p, files);
  }

  const byDomain = new Map();
  for (const fp of files) {
    const md = await fs.readFile(fp, "utf8");
    const fm = parseFrontmatter(md);
    const domain = fm.domain || "";
    if (!domain) continue;
    const list = byDomain.get(domain) ?? [];
    list.push({
      title: fm.title || "(untitled)",
      link: makeLink(fp),
      url: fm.url || "",
      source: fm.source || "",
      tldr: fm.tldr || "",
      created: fm.created || fm.date || "",
    });
    byDomain.set(domain, list);
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  for (const [domain, rows] of byDomain) {
    rows.sort((a, b) => (a.created + a.title).localeCompare(b.created + b.title, "ja"));
    const header = `---\ntitle: "Domain Index — ${domain}"\n---\n\n# ${domain}\n`;
    const tableHead = `\n| 日付 | タイトル | 記事ページへ | 元記事 | 引用元 | 要約 |\n|---|---|---|---|---|---|\n`;
    const lines = rows.map(r =>
      `| ${escapePipes(r.created)} | ${escapePipes(r.title)} | ${escapePipes(r.link)} | ${escapePipes(r.url ? `[link](${r.url})` : "")} | ${escapePipes(r.source)} | ${escapePipes(r.tldr)} |`
    ).join("\n");
    const md = header + tableHead + lines + "\n";
    const outPath = path.join(OUT_DIR, `${domain}.md`);
    await fs.writeFile(outPath, md, "utf8");
    console.log(`✔ Wrote: ${path.relative(ROOT, outPath)}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
