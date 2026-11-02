import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const genericPage = read('app/code/[codeId]/page.tsx');
const oemPage = read('app/code/[codeId]/[manufacturer]/page.tsx');
const sitemap = read('lib/sitemap-data.ts');
const structuredData = read('components/code/CodeStructuredData.tsx');

assert.match(genericPage, /robots: \{ index: code\?\.seoIndexable \?\? false, follow: true \}/);
assert.match(oemPage, /robots: \{ index: code\.seoIndexable, follow: true \}/);
assert.match(sitemap, /codes\.filter\(\(code\) => code\.seoIndexable\)/);
assert.match(sitemap, /bilingual\(`\/code\/\$\{code\.code\.toUpperCase\(\)\}`,/);
assert.match(sitemap, /\}, code\.hasEnglishTranslation\)/);
assert.match(sitemap, /hasSpecificOemContent\(code\) && code\.seoIndexable/);
assert.doesNotMatch(structuredData, /descFallback/);
assert.match(structuredData, /\.\.\.\(storedDescription \? \{ description: storedDescription \} : \{\}\)/);

console.log('SEO policy source checks passed.');
