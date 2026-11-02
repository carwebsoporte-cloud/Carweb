import { getAllCodesPaged, getManufacturers, getManufacturerCodes, getPublishedPosts } from '@/lib/api';
import { hasEnglishTranslation } from '@/lib/blog';
import { esToEnPath } from '@/lib/i18n';
import { SITE_URL } from '@/lib/site';
import { CODES_PAGE_SIZE, chunkName, type SitemapChunk, type SitemapEntry } from '@/lib/sitemap';
import {
  buildBrandsChunk as buildBrands,
  buildCodesChunk as buildCodes,
  buildCoreChunk as buildCore,
  type SitemapDeps,
} from '@/lib/sitemap-builders';

// Binds the pure builders to the real API. Every read throws on failure
// (`throwOnError`), so a failed section rejects instead of yielding a partial
// sitemap.
const deps: SitemapDeps = {
  siteUrl: SITE_URL,
  toEnPath: esToEnPath,
  hasBlogEnglish: hasEnglishTranslation,
  getPosts: () => getPublishedPosts({ throwOnError: true }),
  getCodesPage: (page, limit) => getAllCodesPaged(page, limit, undefined, { throwOnError: true }),
  getManufacturers: () => getManufacturers({ throwOnError: true }),
  getManufacturerCodes: (slug, page, limit) => getManufacturerCodes(slug, page, limit, undefined, { throwOnError: true }),
};

export const buildCoreChunk = (): Promise<SitemapEntry[]> => buildCore(deps);
export const buildBrandsChunk = (): Promise<SitemapEntry[]> => buildBrands(deps);
export const buildCodesChunk = (page: number): Promise<SitemapEntry[] | null> => buildCodes(deps, page);

export async function listChunkUrls(): Promise<string[]> {
  const first = await deps.getCodesPage(1, CODES_PAGE_SIZE);
  const pages = Math.max(first.pages, 1);
  const chunks: SitemapChunk[] = [
    { kind: 'core' },
    ...Array.from({ length: pages }, (_, i): SitemapChunk => ({ kind: 'codes', page: i + 1 })),
    { kind: 'brands' },
  ];
  return chunks.map((chunk) => `${SITE_URL}/sitemaps/${chunkName(chunk)}`);
}
