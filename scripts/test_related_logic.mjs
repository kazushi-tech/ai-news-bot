// scripts/test_related_logic.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const NEWS_ROOT = REPO_ROOT; // 簡易的に設定
const AI_NEWS_DIR = path.join(NEWS_ROOT, 'news', 'ai');

// summarize_article.mjs からコピーしたロジック (簡易版)
async function loadArticlesForRelated() {
  const articlesDir = path.join(NEWS_ROOT, 'articles'); // NEWS_ROOT直下のarticles
  
  let entries;
  try {
    entries = await fs.readdir(articlesDir, { withFileTypes: true });
  } catch (e) {
    console.error("Failed to read articles dir:", e);
    return [];
  }
  
  const articles = [];
  
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    
    const filepath = path.join(articlesDir, entry.name);
    
    try {
      const content = await fs.readFile(filepath, 'utf8');
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      
      if (!fmMatch) continue;
      
      const fm = YAML.parse(fmMatch[1]);
      
      articles.push({
        file: entry.name,
        title: fm.title || entry.name.replace(/\.md$/, ''),
        date: fm.created || fm.date || '',
        tags: Array.isArray(fm.tags) ? fm.tags : [],
        importance: fm.importance || fm.interest || 3,
        source: fm.source || '',
        domain: fm.domain || '',
        host: fm.host || fm.domain || ''
      });
    } catch {
      // ignore
    }
  }
  
  return articles;
}

async function findRelatedArticles(currentFile, currentTags, currentHost, maxResults = 5) {
  const allArticles = await loadArticlesForRelated();
  
  // 現在の記事を除外
  const others = allArticles.filter(art => art.file !== currentFile);
  
  console.log(`Total articles found: ${allArticles.length}`);
  console.log(`Current tags: ${currentTags}`);
  console.log(`Current host: ${currentHost}`);

  // 同タグ記事（タグ一致数でソート）
  const byTags = others
    .filter(art => {
      if (!Array.isArray(art.tags) || art.tags.length === 0) return false;
      if (!Array.isArray(currentTags) || currentTags.length === 0) return false;
      // ai-news を除外したタグで一致チェック
      const artTagsFiltered = art.tags.filter(t => t !== 'ai-news');
      const currentTagsFiltered = currentTags.filter(t => t !== 'ai-news');
      return artTagsFiltered.some(tag => currentTagsFiltered.includes(tag));
    })
    .map(art => {
      const artTagsFiltered = art.tags.filter(t => t !== 'ai-news');
      const currentTagsFiltered = currentTags.filter(t => t !== 'ai-news');
      const matchCount = artTagsFiltered.filter(tag => currentTagsFiltered.includes(tag)).length;
      return { ...art, matchCount };
    })
    .sort((a, b) => {
      // タグ一致数でソート
      if (a.matchCount !== b.matchCount) return b.matchCount - a.matchCount;
      // importance でソート
      const impA = a.importance || 3;
      const impB = b.importance || 3;
      if (impA !== impB) return impB - impA;
      // 日付でソート（新しい順）
      return (b.date || '').localeCompare(a.date || '');
    })
    .slice(0, maxResults);
  
  // 同ソース記事
  const bySource = others
    .filter(art => {
      if (!currentHost) return false;
      return art.host === currentHost || art.domain === currentHost;
    })
    .sort((a, b) => {
      // importance でソート
      const impA = a.importance || 3;
      const impB = b.importance || 3;
      if (impA !== impB) return impB - impA;
      // 日付でソート（新しい順）
      return (b.date || '').localeCompare(a.date || '');
    })
    .slice(0, maxResults);
  
  return { byTags, bySource };
}

async function runTest() {
  // テストケース: Anthropicの最新記事あたりのタグを使ってテスト
  const testFile = "dummy-new-article.md";
  const testTags = ["OpenAI", "ChatGPT"]; 
  const testHost = "openai.com";

  console.log("=== Running Related Articles Logic Test ===");
  const result = await findRelatedArticles(testFile, testTags, testHost);
  
  console.log("\n--- BY TAGS ---");
  result.byTags.forEach(art => {
      console.log(`[${art.matchCount} matches] ${art.title} (${art.date})`);
  });

  console.log("\n--- BY SOURCE ---");
  result.bySource.forEach(art => {
      console.log(`[${art.source}] ${art.title} (${art.date})`);
  });
}

runTest();
