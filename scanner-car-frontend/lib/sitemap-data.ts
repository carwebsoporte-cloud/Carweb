import { getAllCodesPaged, getManufacturers, getManufacturerCodes, getPublishedPosts } from '@/lib/api';
import { hasEnglishTranslation } from '@/lib/blog';
import { esToEnPath } from '@/lib/i18n';
import { SITE_URL } from '@/lib/site';
import {
  CODES_PAGE_SIZE,
  bilingualEntries,
  chunkName,
  uniqueEntries,
  type EntryOptions,
  type SitemapChunk,
  type SitemapEntry,
} from '@/lib/sitemap';

// Same indexability policy as Phase 2: only `seoIndexable` codes are listed and
// English URLs are listed only when the English translation is complete.

const OEM_PAGE_SIZE = 500;
const OEM_CONCURRENCY = 4;

function bilingual(path: string, opts: EntryOptions, includeEnglish = true): SitemapEntry[] {
  return bilingualEntries(SITE_URL, esToEnPath, path, opts, includeEnglish);
}

function errorContext(error: unknown) {
  return error instanceof Error ? { message: error.message, stack: error.stack } : { error };
}

function hasSpecificOemContent(code: { title?: string; description?: string }): boolean {
  return Boolean(code.title?.trim() && code.description?.trim());
}

type GenericCode = Awaited<ReturnType<typeof getAllCodesPaged>>['data'][number];

function genericCodeEntries(codes: GenericCode[], now: Date): SitemapEntry[] {
  return codes.filter((code) => code.seoIndexable).flatMap((code) =>
    bilingual(`/code/${code.code.toUpperCase()}`, {
      changeFrequency: 'monthly',
      priority: 0.9,
      lastModified: code.updatedAt ? new Date(code.updatedAt) : now,
    }, code.hasEnglishTranslation),
  );
}

// Number of generic-code chunks (one per API page). Throws when the API is
// unavailable so the caller never caches an index with missing chunks.
async function countCodeChunks(): Promise<number> {
  const first = await getAllCodesPaged(1, CODES_PAGE_SIZE, undefined, { throwOnError: true });
  return Math.max(first.pages, 1);
}

export async function listChunkNames(): Promise<string[]> {
  const pages = await countCodeChunks();
  const chunks: SitemapChunk[] = [
    { kind: 'core' },
    ...Array.from({ length: pages }, (_, i): SitemapChunk => ({ kind: 'codes', page: i + 1 })),
    { kind: 'brands' },
  ];
  return chunks.map(chunkName);
}

export async function listChunkUrls(): Promise<string[]> {
  return (await listChunkNames()).map((name) => `${SITE_URL}/sitemaps/${name}`);
}

export async function buildCodesChunk(page: number): Promise<SitemapEntry[] | null> {
  const first = await getAllCodesPaged(1, CODES_PAGE_SIZE, undefined, { throwOnError: true });
  if (page > Math.max(first.pages, 1)) return null;
  const current = page === 1 ? first : await getAllCodesPaged(page, CODES_PAGE_SIZE, undefined, { throwOnError: true });
  return uniqueEntries(genericCodeEntries(current.data, new Date()));
}

export async function buildCoreChunk(): Promise<SitemapEntry[]> {
  const now = new Date();
  const staticRoutes = [
    ...bilingual('/', { changeFrequency: 'daily', priority: 1, lastModified: now }),
    ...bilingual('/guias', { changeFrequency: 'weekly', priority: 0.8, lastModified: now }),
    ...bilingual('/diagnostico', { changeFrequency: 'weekly', priority: 0.7, lastModified: now }),
    ...bilingual('/marcas', { changeFrequency: 'weekly', priority: 0.6, lastModified: now }),
    ...bilingual('/vehiculo', { changeFrequency: 'monthly', priority: 0.6, lastModified: now }),
    ...bilingual('/anunciarse', { changeFrequency: 'monthly', priority: 0.6, lastModified: now }),
    ...bilingual('/blog', { changeFrequency: 'weekly', priority: 0.6, lastModified: now }),
    ...bilingual('/nosotros', { changeFrequency: 'yearly', priority: 0.4, lastModified: now }),
    ...bilingual('/contacto', { changeFrequency: 'yearly', priority: 0.4, lastModified: now }),
    ...bilingual('/terminos', { changeFrequency: 'yearly', priority: 0.3, lastModified: now }),
    ...bilingual('/privacidad', { changeFrequency: 'yearly', priority: 0.3, lastModified: now }),
  ];

  let blogRoutes: SitemapEntry[] = [];
  try {
    const posts = await getPublishedPosts({ throwOnError: true });
    blogRoutes = posts.flatMap((post) =>
      bilingual(`/blog/${post.slug}`, { changeFrequency: 'monthly', priority: 0.5, lastModified: new Date(post.date) }, hasEnglishTranslation(post)),
    );
  } catch (error) {
    console.error('[sitemap] blog section failed', errorContext(error));
  }

  // Category pages list English only when every generic code of the category is
  // translated, which needs the full generic inventory.
  const allCodes: GenericCode[] = [];
  let genericCodesComplete = true;
  try {
    const first = await getAllCodesPaged(1, CODES_PAGE_SIZE, undefined, { throwOnError: true });
    allCodes.push(...first.data);
    const rest = await Promise.allSettled(
      Array.from({ length: Math.max(first.pages - 1, 0) }, (_, i) =>
        getAllCodesPaged(i + 2, CODES_PAGE_SIZE, undefined, { throwOnError: true }),
      ),
    );
    rest.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allCodes.push(...result.value.data);
      } else {
        genericCodesComplete = false;
        console.error('[sitemap] generic codes section failed', { page: index + 2, ...errorContext(result.reason) });
      }
    });
  } catch (error) {
    genericCodesComplete = false;
    console.error('[sitemap] generic codes section failed', errorContext(error));
  }

  const categoryRoutes = ['P', 'B', 'C', 'U'].flatMap((c) => {
    const categoryCodes = allCodes.filter((code) => code.code.toUpperCase().startsWith(c));
    const includeEnglish = genericCodesComplete && categoryCodes.length > 0 && categoryCodes.every((code) => code.hasEnglishTranslation);
    return bilingual(`/category/${c}`, { changeFrequency: 'weekly', priority: 0.7, lastModified: now }, includeEnglish);
  });

  return uniqueEntries([...staticRoutes, ...blogRoutes, ...categoryRoutes]);
}

async function buildManufacturerEntries(slug: string, now: Date): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [];
  try {
    const firstOemPage = await getManufacturerCodes(slug, 1, OEM_PAGE_SIZE, undefined, { throwOnError: true });
    if (!firstOemPage.manufacturer || firstOemPage.total <= 0) {
      throw new Error(`Manufacturer ${slug} returned no published codes`);
    }

    const allOemCodes = [...firstOemPage.data];
    let pageFailure = false;
    if (firstOemPage.pages > 1) {
      const remaining = await Promise.allSettled(
        Array.from({ length: firstOemPage.pages - 1 }, (_, i) =>
          getManufacturerCodes(slug, i + 2, OEM_PAGE_SIZE, undefined, { throwOnError: true }),
        ),
      );
      remaining.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allOemCodes.push(...result.value.data);
        } else {
          pageFailure = true;
          console.error('[sitemap] manufacturers/OEM section failed', { manufacturer: slug, page: index + 2, ...errorContext(result.reason) });
        }
      });
    }

    const validOemCodes = allOemCodes.filter((code) => hasSpecificOemContent(code) && code.seoIndexable);
    if (validOemCodes.length === 0) return entries;

    const fullyTranslated = !pageFailure
      && validOemCodes.length === allOemCodes.length
      && validOemCodes.every((code) => code.hasEnglishTranslation);
    entries.push(...bilingual(`/marcas/${slug}`, { changeFrequency: 'weekly', priority: 0.6, lastModified: now }, fullyTranslated));
    for (const code of validOemCodes) {
      entries.push(...bilingual(`/code/${code.code.toUpperCase()}/${slug}`, {
        changeFrequency: 'monthly',
        priority: 0.6,
        lastModified: code.updatedAt ? new Date(code.updatedAt) : now,
      }, code.hasEnglishTranslation));
    }
  } catch (error) {
    console.error('[sitemap] manufacturers/OEM section failed', { manufacturer: slug, ...errorContext(error) });
  }
  return entries;
}

export async function buildBrandsChunk(): Promise<SitemapEntry[]> {
  const now = new Date();
  const brands = (await getManufacturers({ throwOnError: true })).filter((m) => !m.isGeneric && (m._count?.codes ?? 0) > 0);
  const entries: SitemapEntry[] = [];
  for (let i = 0; i < brands.length; i += OEM_CONCURRENCY) {
    const batch = await Promise.all(brands.slice(i, i + OEM_CONCURRENCY).map((m) => buildManufacturerEntries(m.slug, now)));
    batch.forEach((list) => entries.push(...list));
  }
  return uniqueEntries(entries);
}
