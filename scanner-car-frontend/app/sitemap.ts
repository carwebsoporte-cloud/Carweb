import type { MetadataRoute } from 'next';
import { getAllCodesPaged, getManufacturers, getManufacturerCodes, getPublishedPosts } from '@/lib/api';
import { esToEnPath } from '@/lib/i18n';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://carweb.app';

export const revalidate = 3600;

// Construye una entrada bilingüe: URL en español (raíz) + URL en inglés (/en)
// con slugs traducidos (p.ej. /marcas → /en/brands).
function bilingual(
  path: string,
  opts: { changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number; lastModified: Date },
): MetadataRoute.Sitemap {
  const esUrl = `${SITE_URL}${path}`;
  const enPath = path === '/' ? '' : esToEnPath(path);
  const enUrl = enPath === '' ? `${SITE_URL}/en` : `${SITE_URL}/en${enPath}`;
  const languages = { es: esUrl, en: enUrl };
  const base = { lastModified: opts.lastModified, changeFrequency: opts.changeFrequency, priority: opts.priority };
  return [
    { url: esUrl, ...base, alternates: { languages } },
    { url: enUrl, ...base, alternates: { languages } },
  ];
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
    const posts = await getPublishedPosts();
    blogRoutes = posts.flatMap((post) =>
      bilingual(`/blog/${post.slug}`, { changeFrequency: 'monthly', priority: 0.5, lastModified: new Date(post.date) }),
    );
  } catch {
    blogRoutes = [];
  }

  const categoryRoutes = ['P', 'B', 'C', 'U'].flatMap((c) =>
    bilingual(`/category/${c}`, { changeFrequency: 'weekly', priority: 0.7, lastModified: now }),
  );

  let codeRoutes: MetadataRoute.Sitemap = [];
  try {
    const firstPage = await getAllCodesPaged(1, 1000);
    const totalPages = firstPage.pages;
    const allCodes = [...firstPage.data];
    if (totalPages > 1) {
      const remaining = [];
      for (let p = 2; p <= totalPages; p++) {
        remaining.push(getAllCodesPaged(p, 1000));
      }
      const pages = await Promise.all(remaining);
      for (const page of pages) allCodes.push(...page.data);
    }
    codeRoutes = allCodes.flatMap((code) =>
      bilingual(`/code/${code.code}`, {
        changeFrequency: 'monthly',
        priority: 0.9,
        lastModified: code.updatedAt ? new Date(code.updatedAt) : now,
      }),
    );
  } catch {
    codeRoutes = [];
  }

  // Marcas (con códigos) + cada código OEM bajo su marca.
  let oemRoutes: MetadataRoute.Sitemap = [];
  try {
    const brands = (await getManufacturers()).filter((m) => !m.isGeneric && (m._count?.codes ?? 0) > 0);
    for (const m of brands) {
      oemRoutes.push(...bilingual(`/marcas/${m.slug}`, { changeFrequency: 'weekly', priority: 0.6, lastModified: now }));
      const firstOemPage = await getManufacturerCodes(m.slug, 1, 500);
      const oemPages = firstOemPage.pages;
      const allOemCodes = [...firstOemPage.data];
      if (oemPages > 1) {
        const remainingOem = [];
        for (let p = 2; p <= oemPages; p++) {
          remainingOem.push(getManufacturerCodes(m.slug, p, 500));
        }
        const oemPagesData = await Promise.all(remainingOem);
        for (const page of oemPagesData) allOemCodes.push(...page.data);
      }
      for (const code of allOemCodes) {
        oemRoutes.push(...bilingual(`/code/${code.code}/${m.slug}`, {
          changeFrequency: 'monthly',
          priority: 0.6,
          lastModified: code.updatedAt ? new Date(code.updatedAt) : now,
        }));
      }
    }
  } catch {
    oemRoutes = [];
  }

  return [...staticRoutes, ...blogRoutes, ...categoryRoutes, ...codeRoutes, ...oemRoutes];
}
