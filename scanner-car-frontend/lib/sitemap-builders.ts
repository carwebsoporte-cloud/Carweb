// Sitemap chunk builders with injected data access so they can be unit tested
// with `node --test`. Every builder is all-or-nothing: if any section or brand
// fails to load it rejects, so the route answers 503 (never cached) instead of
// serving a partial sitemap with a long cache lifetime.

import {
  CODES_PAGE_SIZE,
  bilingualEntries,
  uniqueEntries,
  type EntryOptions,
  type SitemapEntry,
} from './sitemap.ts';

export const OEM_PAGE_SIZE = 500;
const OEM_CONCURRENCY = 4;
// The backend (Render free) times out when many code pages are requested at once.
const CODES_PAGE_CONCURRENCY = 3;

// Maps items in sequential batches so at most `limit` calls are in flight.
async function mapInBatches<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += limit) {
    results.push(...(await Promise.all(items.slice(i, i + limit).map(fn))));
  }
  return results;
}

interface CodeLike {
  code: string;
  title?: string;
  description?: string;
  seoIndexable: boolean;
  hasEnglishTranslation: boolean;
  updatedAt?: string;
}

export interface SitemapDeps {
  siteUrl: string;
  toEnPath: (esPath: string) => string;
  hasBlogEnglish: (post: never) => boolean;
  getPosts: () => Promise<{ slug: string; date: string }[]>;
  getCodesPage: (page: number, limit: number) => Promise<{ data: CodeLike[]; pages: number }>;
  getManufacturers: () => Promise<{ slug: string; isGeneric: boolean; _count?: { codes: number } }[]>;
  getManufacturerCodes: (
    slug: string,
    page: number,
    limit: number,
  ) => Promise<{ manufacturer: unknown; total: number; pages: number; data: CodeLike[] }>;
}

function bilingual(deps: SitemapDeps, path: string, opts: EntryOptions, includeEnglish = true): SitemapEntry[] {
  return bilingualEntries(deps.siteUrl, deps.toEnPath, path, opts, includeEnglish);
}

function hasSpecificOemContent(code: { title?: string; description?: string }): boolean {
  return Boolean(code.title?.trim() && code.description?.trim());
}

// Phase 2 policy: only `seoIndexable` codes are listed; English URLs only when
// the English translation is complete.
function genericCodeEntries(deps: SitemapDeps, codes: CodeLike[], now: Date): SitemapEntry[] {
  return codes.filter((code) => code.seoIndexable).flatMap((code) =>
    bilingual(deps, `/code/${code.code.toUpperCase()}`, {
      changeFrequency: 'monthly',
      priority: 0.9,
      lastModified: code.updatedAt ? new Date(code.updatedAt) : now,
    }, code.hasEnglishTranslation),
  );
}

// One generic-code chunk = one API page. Returns null past the last page.
export async function buildCodesChunk(deps: SitemapDeps, page: number): Promise<SitemapEntry[] | null> {
  const current = await deps.getCodesPage(page, CODES_PAGE_SIZE);
  if (page > Math.max(current.pages, 1)) return null;
  return uniqueEntries(genericCodeEntries(deps, current.data, new Date()));
}

export async function buildCoreChunk(deps: SitemapDeps): Promise<SitemapEntry[]> {
  const now = new Date();
  const staticRoutes = [
    ...bilingual(deps, '/', { changeFrequency: 'daily', priority: 1, lastModified: now }),
    ...bilingual(deps, '/guias', { changeFrequency: 'weekly', priority: 0.8, lastModified: now }),
    ...bilingual(deps, '/diagnostico', { changeFrequency: 'weekly', priority: 0.7, lastModified: now }),
    ...bilingual(deps, '/marcas', { changeFrequency: 'weekly', priority: 0.6, lastModified: now }),
    ...bilingual(deps, '/vehiculo', { changeFrequency: 'monthly', priority: 0.6, lastModified: now }),
    ...bilingual(deps, '/anunciarse', { changeFrequency: 'monthly', priority: 0.6, lastModified: now }),
    ...bilingual(deps, '/blog', { changeFrequency: 'weekly', priority: 0.6, lastModified: now }),
    ...bilingual(deps, '/nosotros', { changeFrequency: 'yearly', priority: 0.4, lastModified: now }),
    ...bilingual(deps, '/contacto', { changeFrequency: 'yearly', priority: 0.4, lastModified: now }),
    ...bilingual(deps, '/terminos', { changeFrequency: 'yearly', priority: 0.3, lastModified: now }),
    ...bilingual(deps, '/privacidad', { changeFrequency: 'yearly', priority: 0.3, lastModified: now }),
  ];

  const posts = await deps.getPosts();
  const blogRoutes = posts.flatMap((post) =>
    bilingual(deps, `/blog/${post.slug}`, { changeFrequency: 'monthly', priority: 0.5, lastModified: new Date(post.date) }, deps.hasBlogEnglish(post as never)),
  );

  // Category pages list English only when every generic code of the category is
  // translated, which needs the full generic inventory.
  const first = await deps.getCodesPage(1, CODES_PAGE_SIZE);
  const rest = await mapInBatches(
    Array.from({ length: Math.max(first.pages - 1, 0) }, (_, i) => i + 2),
    CODES_PAGE_CONCURRENCY,
    (page) => deps.getCodesPage(page, CODES_PAGE_SIZE),
  );
  const allCodes = [first, ...rest].flatMap((page) => page.data);

  const categoryRoutes = ['P', 'B', 'C', 'U'].flatMap((c) => {
    const categoryCodes = allCodes.filter((code) => code.code.toUpperCase().startsWith(c));
    const includeEnglish = categoryCodes.length > 0 && categoryCodes.every((code) => code.hasEnglishTranslation);
    return bilingual(deps, `/category/${c}`, { changeFrequency: 'weekly', priority: 0.7, lastModified: now }, includeEnglish);
  });

  return uniqueEntries([...staticRoutes, ...blogRoutes, ...categoryRoutes]);
}

async function buildManufacturerEntries(deps: SitemapDeps, slug: string, now: Date): Promise<SitemapEntry[]> {
  const firstPage = await deps.getManufacturerCodes(slug, 1, OEM_PAGE_SIZE);
  // A brand without published codes is legitimately absent, not a failure.
  if (!firstPage.manufacturer || firstPage.total <= 0) return [];

  const remaining = await Promise.all(
    Array.from({ length: Math.max(firstPage.pages - 1, 0) }, (_, i) => deps.getManufacturerCodes(slug, i + 2, OEM_PAGE_SIZE)),
  );
  const allOemCodes = [firstPage, ...remaining].flatMap((page) => page.data);
  const validOemCodes = allOemCodes.filter((code) => hasSpecificOemContent(code) && code.seoIndexable);
  if (validOemCodes.length === 0) return [];

  const fullyTranslated = validOemCodes.length === allOemCodes.length
    && validOemCodes.every((code) => code.hasEnglishTranslation);
  return [
    ...bilingual(deps, `/marcas/${slug}`, { changeFrequency: 'weekly', priority: 0.6, lastModified: now }, fullyTranslated),
    ...validOemCodes.flatMap((code) =>
      bilingual(deps, `/code/${code.code.toUpperCase()}/${slug}`, {
        changeFrequency: 'monthly',
        priority: 0.6,
        lastModified: code.updatedAt ? new Date(code.updatedAt) : now,
      }, code.hasEnglishTranslation),
    ),
  ];
}

export async function buildBrandsChunk(deps: SitemapDeps): Promise<SitemapEntry[]> {
  const now = new Date();
  const brands = (await deps.getManufacturers()).filter((m) => !m.isGeneric && (m._count?.codes ?? 0) > 0);
  const entries: SitemapEntry[] = [];
  for (let i = 0; i < brands.length; i += OEM_CONCURRENCY) {
    const batch = await Promise.all(brands.slice(i, i + OEM_CONCURRENCY).map((m) => buildManufacturerEntries(deps, m.slug, now)));
    batch.forEach((list) => entries.push(...list));
  }
  return uniqueEntries(entries);
}
