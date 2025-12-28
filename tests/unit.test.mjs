// tests/unit.test.mjs
// 最小ユニットテスト（parse→render、slug生成）

import assert from 'node:assert';
import { normalizeUrl, hashUrl } from '../scripts/lib/url_normalizer.mjs';
import { formatTableRow, formatDetails } from '../scripts/lib/append_to_daily.mjs';
import { generateSlug } from '../scripts/lib/slug.mjs';

console.log('Running unit tests...\n');

// ============================================
// URL Normalizer Tests
// ============================================
console.log('=== URL Normalizer ===');

// Test 1: Tracking parameter removal
{
  const input = 'https://example.com/article?utm_source=twitter&id=123';
  const expected = 'https://example.com/article?id=123';
  const result = normalizeUrl(input);
  assert.strictEqual(result, expected, 'Should remove utm_source');
  console.log('✅ Tracking param removal');
}

// Test 2: www removal
{
  const input = 'https://www.example.com/path';
  const expected = 'https://example.com/path';
  const result = normalizeUrl(input);
  assert.strictEqual(result, expected, 'Should remove www');
  console.log('✅ www removal');
}

// Test 3: Trailing slash removal
{
  const input = 'https://example.com/path/';
  const expected = 'https://example.com/path';
  const result = normalizeUrl(input);
  assert.strictEqual(result, expected, 'Should remove trailing slash');
  console.log('✅ Trailing slash removal');
}

// Test 4: Hash generation
{
  const url = 'https://example.com/article';
  const hash = hashUrl(url);
  assert.strictEqual(hash.length, 16, 'Hash should be 16 chars');
  console.log('✅ Hash generation');
}

// ============================================
// Table Row Formatter Tests
// ============================================
console.log('\n=== Table Row Formatter ===');

// Test 5: Basic table row
{
  const row = formatTableRow({
    n: 1,
    title: 'Test Article',
    source: 'Example',
    oneLineSummary: 'This is a test.',
    tags: ['ai', 'news'],
    url: 'https://example.com'
  });
  assert(row.includes('| 1 |'), 'Should have row number');
  assert(row.includes('Test Article'), 'Should have title');
  assert(row.includes('[リンク]'), 'Should have link');
  console.log('✅ Basic table row');
}

// Test 6: Pipe escape
{
  const row = formatTableRow({
    n: 1,
    title: 'Title | with pipe',
    source: 'Src',
    oneLineSummary: 'Sum',
    tags: [],
    url: 'https://example.com'
  });
  assert(row.includes('Title \\| with pipe'), 'Should escape pipe');
  console.log('✅ Pipe escape');
}

// ============================================
// Details Formatter Tests
// ============================================
console.log('\n=== Details Formatter ===');

// Test 7: Basic details
{
  const details = formatDetails({
    n: 1,
    title: 'Test',
    url: 'https://example.com',
    bullets: ['Point 1', 'Point 2'],
    whyItMatters: 'Important reason',
    reliability: 'high',
    reliabilityReason: 'Official source'
  });
  assert(details.includes('### 1)'), 'Should have heading');
  assert(details.includes('- Point 1'), 'Should have bullets');
  assert(details.includes('**Why it matters:**'), 'Should have why');
  assert(details.includes('**信頼度:** 高'), 'Should have reliability');
  console.log('✅ Basic details');
}

// ============================================
// Slug Generator Tests
// ============================================
console.log('\n=== Slug Generator ===');

// Test 8: Basic slug
{
  const slug = generateSlug('Hello World Test');
  assert(slug === 'hello-world-test', `Expected 'hello-world-test', got '${slug}'`);
  console.log('✅ Basic slug');
}

// Test 9: Special characters
{
  const slug = generateSlug('Test!@#$%^&*()Article');
  assert(!slug.includes('!'), 'Should remove special chars');
  assert(!slug.includes('@'), 'Should remove special chars');
  console.log('✅ Special char removal');
}

// Test 10: Length limit
{
  const longTitle = 'A'.repeat(100);
  const slug = generateSlug(longTitle);
  assert(slug.length <= 80, 'Should respect max length');
  console.log('✅ Length limit');
}

console.log('\n✅ All tests passed!');
