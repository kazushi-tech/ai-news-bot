
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = process.env.NEWS_ROOT 
  ? path.join(process.env.NEWS_ROOT, 'articles')
  : path.resolve(__dirname, '..', '..', 'ai-news', 'articles');

async function main() {
  console.log('Cleaning up duplicate titles in:', ARTICLES_DIR);
  
  let files;
  try {
    files = await fs.readdir(ARTICLES_DIR);
  } catch (err) {
    console.error('Error reading dir:', err);
    return;
  }

  const targets = files.filter(f => f.endsWith('.md'));
  console.log(`Found ${targets.length} markdown files.`);

  let fixedCount = 0;

  for (const file of targets) {
    const fullPath = path.join(ARTICLES_DIR, file);
    const content = await fs.readFile(fullPath, 'utf8');

    // Split frontmatter
    const match = content.match(/^(---\n[\s\S]*?\n---\n)([\s\S]*)$/);
    if (!match) continue;

    const frontmatter = match[1];
    let body = match[2];

    // Check if body has the duplicate structure
    // Structure we want to fix:
    // H1 Title
    // Callouts
    // ## 概要
    // <--- Duplicate content starts here (H1, Callouts)
    
    // We'll trust the logic we put in doctor_layout_articles.mjs:
    // It creates a structure like:
    // # Title
    // > [!summary] TL;DR
    // ...
    // ## 概要
    // ...Content...

    // The issue is that "Content" often starts with # Title again.

    // Strategy: Find ## 概要 and look at what follows.
    if (body.includes('## 概要')) {
      const parts = body.split(/(?=^## 概要)/m);
      if (parts.length < 2) continue; // Should not happen if includes matched

      const preOverview = parts[0]; 
      let overviewSection = parts.slice(1).join(''); 

      // Check inside overviewSection for H1
      const hasDuplicateTitle = /^#\s+.+/m.test(overviewSection);
      const hasDuplicateCallout = /^>\s*\[!info\]/m.test(overviewSection);

      if (hasDuplicateTitle || hasDuplicateCallout) {
        // Fix it!
        // Remove "## 概要" line itself temporarily to clean content, or just clean the content
        let cleanOverview = overviewSection.replace(/^## 概要\n*/, '');

        // Remove H1s
        cleanOverview = cleanOverview.replace(/^#\s+[^\n]+\n*/gm, '');
        cleanOverview = cleanOverview.replace(/\n#\s+[^\n]+\n*/g, '\n');
        
        // Remove Callout 'info' block (often citation)
        cleanOverview = cleanOverview.replace(/^>\s*\[!info\][^\n]*\n(>\s*[^\n]*\n?)*/gm, '');
        
        // Remove URL lines if loose
        // (Hard to detecting specific URL without parsing FM, but we can try generic valid URL line removal if we want, 
        //  or just rely on the specific patterns we saw)
        
        // Reassemble
        const newBody = preOverview + '## 概要\n\n' + cleanOverview.trim() + '\n\n';
        
        // Write back
        await fs.writeFile(fullPath, frontmatter + newBody, 'utf8');
        console.log(`Fixed: ${file}`);
        fixedCount++;
      }
    }
  }

  console.log(`Done. Fixed ${fixedCount} files.`);
}

main();
