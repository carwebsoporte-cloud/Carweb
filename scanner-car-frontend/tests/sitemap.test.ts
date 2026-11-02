import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  bilingualEntries,
  chunkName,
  parseChunkName,
  renderSitemapIndex,
  renderUrlset,
  uniqueEntries,
} from '../lib/sitemap.ts';

const SITE = 'https://example.test';
const toEn = (p: string) => p.replace('/guias', '/guides');
const opts = { changeFrequency: 'weekly' as const, priority: 0.8, lastModified: new Date('2026-01-02T03:04:05.000Z') };

test('bilingualEntries emits es + en with hreflang alternates', () => {
  const entries = bilingualEntries(SITE, toEn, '/guias', opts, true);
  assert.deepEqual(entries.map((e) => e.url), [`${SITE}/guias`, `${SITE}/en/guides`]);
  assert.deepEqual(entries[0].alternates.languages, {
    es: `${SITE}/guias`,
    en: `${SITE}/en/guides`,
    'x-default': `${SITE}/guias`,
  });
});

test('bilingualEntries maps root to /en and can omit English', () => {
  const root = bilingualEntries(SITE, toEn, '/', opts, true);
  assert.deepEqual(root.map((e) => e.url), [`${SITE}/`, `${SITE}/en`]);
  const esOnly = bilingualEntries(SITE, toEn, '/code/P0300', opts, false);
  assert.equal(esOnly.length, 1);
  assert.deepEqual(Object.keys(esOnly[0].alternates.languages), ['es', 'x-default']);
});

test('uniqueEntries drops repeated urls keeping the first', () => {
  const a = bilingualEntries(SITE, toEn, '/guias', opts, true);
  assert.equal(uniqueEntries([...a, ...a]).length, 2);
});

test('renderUrlset produces valid escaped XML', () => {
  const entries = bilingualEntries(SITE, toEn, '/a&b', opts, false);
  const xml = renderUrlset(entries);
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>\n<urlset /);
  assert.match(xml, /xmlns:xhtml="http:\/\/www\.w3\.org\/1999\/xhtml"/);
  assert.match(xml, /<loc>https:\/\/example\.test\/a&amp;b<\/loc>/);
  assert.match(xml, /<lastmod>2026-01-02T03:04:05\.000Z<\/lastmod>/);
  assert.match(xml, /<changefreq>weekly<\/changefreq>/);
  assert.match(xml, /<priority>0\.8<\/priority>/);
  assert.match(xml, /<xhtml:link rel="alternate" hreflang="x-default" href="https:\/\/example\.test\/a&amp;b" \/>/);
  assert.ok(xml.trimEnd().endsWith('</urlset>'));
});

test('renderSitemapIndex lists chunk locations', () => {
  const xml = renderSitemapIndex([`${SITE}/sitemaps/core.xml`, `${SITE}/sitemaps/codes-1.xml`]);
  assert.match(xml, /<sitemapindex xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  assert.match(xml, /<sitemap><loc>https:\/\/example\.test\/sitemaps\/codes-1\.xml<\/loc><\/sitemap>/);
});

test('chunk names round-trip and reject garbage', () => {
  assert.equal(chunkName({ kind: 'core' }), 'core.xml');
  assert.equal(chunkName({ kind: 'brands' }), 'brands.xml');
  assert.equal(chunkName({ kind: 'codes', page: 3 }), 'codes-3.xml');
  assert.deepEqual(parseChunkName('codes-12.xml'), { kind: 'codes', page: 12 });
  assert.deepEqual(parseChunkName('core.xml'), { kind: 'core' });
  assert.deepEqual(parseChunkName('brands.xml'), { kind: 'brands' });
  for (const bad of ['codes-0.xml', 'codes-x.xml', 'codes-1', 'other.xml', 'codes-01.xml', '../x.xml']) {
    assert.equal(parseChunkName(bad), null, bad);
  }
});
