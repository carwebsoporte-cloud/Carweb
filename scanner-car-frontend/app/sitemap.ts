import type { MetadataRoute } from 'next';
import { getAllCodesPaged, getManufacturers, getManufacturerCodes, getPublishedPosts } from '@/lib/api';
import { hasEnglishTranslation } from '@/lib/blog';
import { esToEnPath } from '@/lib/i18n';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.carweb.com.co';

export const revalidate = 3600;

// Keep one sitemap while the published inventory is well below 50,000 URLs.
// When scale requires it, split static, codes, manufacturers/brands, and blog
// into /sitemaps/*.xml files plus an index.

// Construye una entrada bilingüe: URL en español (raíz) + URL en inglés (/en)
// con slugs traducidos (p.ej. /marcas → /en/brands).
function bilingual(
  path: string,
  opts: { changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number; lastModified: Date },
  includeEnglish = true,
): MetadataRoute.Sitemap {
  const esUrl = `${SITE_URL}${path}`;
  const enPath = path === '/' ? '' : esToEnPath(path);
  const enUrl = enPath === '' ? `${SITE_URL}/en` : `${SITE_URL}/en${enPath}`;
  const languages = includeEnglish ? { es: esUrl, en: enUrl, 'x-default': esUrl } : { es: esUrl, 'x-default': esUrl };
  const base = { lastModified: opts.lastModified, changeFrequency: opts.changeFrequency, priority: opts.priority };
  const routes = [{ url: esUrl, ...base, alternates: { languages } }];
  if (includeEnglish) routes.push({ url: enUrl, ...base, alternates: { languages } });
  return routes;
}

function uniqueRoutes(routes: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  return routes.filter((route) => {
    if (seen.has(route.url)) return false;
    seen.add(route.url);
    return true;
  });
}

function errorContext(error: unknown) {
  return error instanceof Error ? { message: error.message, stack: error.stack } : { error };
}

function hasSpecificOemContent(code: { title?: string; description?: string }): boolean {
  return Boolean(code.title?.trim() && code.description?.trim());
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPublishedPosts({ throwOnError: true });
    blogRoutes = posts.flatMap((post) =>
      bilingual(`/blog/${post.slug}`, { changeFrequency: 'monthly', priority: 0.5, lastModified: new Date(post.date) }, hasEnglishTranslation(post)),
    );
  } catch (error) {
    console.error('[sitemap] blog section failed', errorContext(error));
  }

  let codeRoutes: MetadataRoute.Sitemap = [];
  let allCodes: Awaited<ReturnType<typeof getAllCodesPaged>>['data'] = [];
  let genericCodesComplete = true;
  try {
    const firstPage = await getAllCodesPaged(1, 1000, undefined, { throwOnError: true });
    const totalPages = firstPage.pages;
    allCodes = [...firstPage.data];
    if (totalPages > 1) {
      const remaining = [];
      for (let p = 2; p <= totalPages; p++) {
        remaining.push(getAllCodesPaged(p, 1000, undefined, { throwOnError: true }));
      }
      const pages = await Promise.allSettled(remaining);
      pages.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allCodes.push(...result.value.data);
        } else {
          genericCodesComplete = false;
          console.error('[sitemap] generic codes section failed', {
            page: index + 2,
            ...errorContext(result.reason),
          });
        }
      });
    }
    codeRoutes = allCodes.filter((code) => code.seoIndexable).flatMap((code) =>
      bilingual(`/code/${code.code.toUpperCase()}`, {
        changeFrequency: 'monthly',
        priority: 0.9,
        lastModified: code.updatedAt ? new Date(code.updatedAt) : now,
      }, code.hasEnglishTranslation),
    );
  } catch (error) {
    genericCodesComplete = false;
    console.error('[sitemap] generic codes section failed', errorContext(error));
    codeRoutes = allCodes.filter((code) => code.seoIndexable).flatMap((code) =>
      bilingual(`/code/${code.code.toUpperCase()}`, {
        changeFrequency: 'monthly',
        priority: 0.9,
        lastModified: code.updatedAt ? new Date(code.updatedAt) : now,
      }, code.hasEnglishTranslation),
    );
  }

  const categoryRoutes = ['P', 'B', 'C', 'U'].flatMap((c) => {
    const categoryCodes = allCodes.filter((code) => code.code.toUpperCase().startsWith(c));
    const includeEnglish = genericCodesComplete && categoryCodes.length > 0 && categoryCodes.every((code) => code.hasEnglishTranslation);
    return bilingual(`/category/${c}`, { changeFrequency: 'weekly', priority: 0.7, lastModified: now }, includeEnglish);
  });

  // Marcas (con códigos) + cada código OEM bajo su marca.
  const oemRoutes: MetadataRoute.Sitemap = [];
  try {
    const brands = (await getManufacturers({ throwOnError: true })).filter((m) => !m.isGeneric && (m._count?.codes ?? 0) > 0);
    for (const m of brands) {
      let allOemCodes: Awaited<ReturnType<typeof getManufacturerCodes>>['data'] = [];
      let pageFailure = false;
      try {
        const firstOemPage = await getManufacturerCodes(m.slug, 1, 500, undefined, { throwOnError: true });
        if (!firstOemPage.manufacturer || firstOemPage.total <= 0) {
          throw new Error(`Manufacturer ${m.slug} returned no published codes`);
        }

        const oemPages = firstOemPage.pages;
        allOemCodes = [...firstOemPage.data];
        if (oemPages > 1) {
          const remainingOem = [];
          for (let p = 2; p <= oemPages; p++) {
            remainingOem.push(getManufacturerCodes(m.slug, p, 500, undefined, { throwOnError: true }));
          }
          const oemPagesData = await Promise.allSettled(remainingOem);
          oemPagesData.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              allOemCodes.push(...result.value.data);
            } else {
              pageFailure = true;
              console.error('[sitemap] manufacturers/OEM section failed', {
                manufacturer: m.slug,
                page: index + 2,
                ...errorContext(result.reason),
              });
            }
          });
        }

        const validOemCodes = allOemCodes.filter((code) => hasSpecificOemContent(code) && code.seoIndexable);
        if (validOemCodes.length === 0) continue;

        const fullyTranslated = !pageFailure
          && validOemCodes.length === allOemCodes.length
          && validOemCodes.every((code) => code.hasEnglishTranslation);
        oemRoutes.push(...bilingual(`/marcas/${m.slug}`, { changeFrequency: 'weekly', priority: 0.6, lastModified: now }, fullyTranslated));
        for (const code of validOemCodes) {
          oemRoutes.push(...bilingual(`/code/${code.code.toUpperCase()}/${m.slug}`, {
            changeFrequency: 'monthly',
            priority: 0.6,
            lastModified: code.updatedAt ? new Date(code.updatedAt) : now,
          }, code.hasEnglishTranslation));
        }
      } catch (error) {
        console.error('[sitemap] manufacturers/OEM section failed', {
          manufacturer: m.slug,
          ...errorContext(error),
        });
      }
    }
  } catch (error) {
    console.error('[sitemap] manufacturers/OEM section failed', errorContext(error));
  }

  return uniqueRoutes([...staticRoutes, ...blogRoutes, ...categoryRoutes, ...codeRoutes, ...oemRoutes]);
}
