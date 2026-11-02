import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildBrandsChunk,
  buildCodesChunk,
  buildCoreChunk,
  type SitemapDeps,
} from '../lib/sitemap-builders.ts';

const code = (c: string, over: Record<string, unknown> = {}) => ({
  code: c,
  title: `Title ${c}`,
  description: 'desc',
  seoIndexable: true,
  hasEnglishTranslation: true,
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...over,
});

function makeDeps(over: Partial<SitemapDeps> = {}): SitemapDeps {
  return {
    siteUrl: 'https://example.test',
    toEnPath: (p) => p,
    hasBlogEnglish: () => true,
    getPosts: async () => [{ slug: 'a', date: '2026-01-01' }],
    getCodesPage: async (page) => ({ data: [code(`P000${page}`)], pages: 2 }),
    getManufacturers: async () => [{ slug: 'audi', isGeneric: false, _count: { codes: 1 } }],
    getManufacturerCodes: async () => ({ manufacturer: { slug: 'audi' }, total: 1, pages: 1, data: [code('P0300')] }),
    ...over,
  } as SitemapDeps;
}

const boom = async () => {
  throw new Error('api down');
};

test('core chunk builds when every section succeeds', async () => {
  const entries = await buildCoreChunk(makeDeps());
  assert.ok(entries.some((e) => e.url === 'https://example.test/blog/a'));
});

test('core chunk rejects when the blog section fails', async () => {
  await assert.rejects(buildCoreChunk(makeDeps({ getPosts: boom })), /api down/);
});

test('core chunk rejects when any generic codes page fails', async () => {
  const getCodesPage: SitemapDeps['getCodesPage'] = async (page) => {
    if (page === 2) throw new Error('page 2 down');
    return { data: [code('P0001')], pages: 2 };
  };
  await assert.rejects(buildCoreChunk(makeDeps({ getCodesPage })), /page 2 down/);
  await assert.rejects(buildCoreChunk(makeDeps({ getCodesPage: boom })), /api down/);
});

test('brands chunk rejects when one brand fails', async () => {
  const getManufacturers = async () => [
    { slug: 'audi', isGeneric: false, _count: { codes: 1 } },
    { slug: 'bmw', isGeneric: false, _count: { codes: 1 } },
  ];
  const getManufacturerCodes: SitemapDeps['getManufacturerCodes'] = async (slug) => {
    if (slug === 'bmw') throw new Error('bmw down');
    return { manufacturer: { slug }, total: 1, pages: 1, data: [code('P0300')] };
  };
  await assert.rejects(buildBrandsChunk(makeDeps({ getManufacturers, getManufacturerCodes })), /bmw down/);
  await assert.rejects(buildBrandsChunk(makeDeps({ getManufacturers: boom })), /api down/);
});

test('brands chunk rejects when a later page of a brand fails', async () => {
  const getManufacturerCodes: SitemapDeps['getManufacturerCodes'] = async (_slug, page) => {
    if (page === 2) throw new Error('oem page 2 down');
    return { manufacturer: { slug: 'audi' }, total: 2, pages: 2, data: [code('P0300')] };
  };
  await assert.rejects(buildBrandsChunk(makeDeps({ getManufacturerCodes })), /oem page 2 down/);
});

test('brands chunk skips a brand with no published codes without failing', async () => {
  const getManufacturerCodes: SitemapDeps['getManufacturerCodes'] = async () => ({ manufacturer: null, total: 0, pages: 0, data: [] });
  assert.deepEqual(await buildBrandsChunk(makeDeps({ getManufacturerCodes })), []);
});

test('codes chunk makes exactly one API call and returns null past the last page', async () => {
  let calls = 0;
  const getCodesPage: SitemapDeps['getCodesPage'] = async (page) => {
    calls++;
    return page > 2 ? { data: [], pages: 2 } : { data: [code('P0001'), code('P0002', { seoIndexable: false })], pages: 2 };
  };
  const entries = await buildCodesChunk(makeDeps({ getCodesPage }), 2);
  assert.equal(calls, 1);
  assert.deepEqual(entries?.map((e) => e.url), ['https://example.test/code/P0001', 'https://example.test/en/code/P0001']);
  assert.equal(await buildCodesChunk(makeDeps({ getCodesPage }), 3), null);
  await assert.rejects(buildCodesChunk(makeDeps({ getCodesPage: boom }), 1), /api down/);
});

test('core chunk keeps at most 3 generic codes page requests in flight', async () => {
  let inFlight = 0;
  let peak = 0;
  const getCodesPage: SitemapDeps['getCodesPage'] = async (page) => {
    inFlight += 1;
    peak = Math.max(peak, inFlight);
    await new Promise((resolve) => setTimeout(resolve, 5));
    inFlight -= 1;
    return { data: [code(`P${String(page).padStart(4, '0')}`)], pages: 10 };
  };
  await buildCoreChunk(makeDeps({ getCodesPage }));
  assert.ok(peak <= 3, `peak concurrency was ${peak}`);
});
