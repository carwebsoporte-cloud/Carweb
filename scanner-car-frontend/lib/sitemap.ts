// Pure sitemap helpers (no framework or network imports) so they can be unit
// tested with `node --test`. Data fetching lives in ./sitemap-data.

export type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: ChangeFrequency;
  priority: number;
  alternates: { languages: Record<string, string> };
}

export interface EntryOptions {
  changeFrequency: ChangeFrequency;
  priority: number;
  lastModified: Date;
}

// Builds a bilingual entry pair: Spanish URL at the root + English under /en,
// with translated slugs supplied by `toEnPath` (e.g. /marcas -> /en/brands).
export function bilingualEntries(
  siteUrl: string,
  toEnPath: (esPath: string) => string,
  path: string,
  opts: EntryOptions,
  includeEnglish = true,
): SitemapEntry[] {
  const esUrl = `${siteUrl}${path}`;
  const enPath = path === '/' ? '' : toEnPath(path);
  const enUrl = enPath === '' ? `${siteUrl}/en` : `${siteUrl}/en${enPath}`;
  const languages: Record<string, string> = includeEnglish
    ? { es: esUrl, en: enUrl, 'x-default': esUrl }
    : { es: esUrl, 'x-default': esUrl };
  const base = { lastModified: opts.lastModified, changeFrequency: opts.changeFrequency, priority: opts.priority };
  const entries: SitemapEntry[] = [{ url: esUrl, ...base, alternates: { languages } }];
  if (includeEnglish) entries.push({ url: enUrl, ...base, alternates: { languages } });
  return entries;
}

export function uniqueEntries(entries: SitemapEntry[]): SitemapEntry[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';

export function renderUrlset(entries: SitemapEntry[]): string {
  const body = entries
    .map((entry) => {
      const links = Object.entries(entry.alternates.languages)
        .map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(href)}" />`)
        .join('\n');
      return [
        '<url>',
        `<loc>${escapeXml(entry.url)}</loc>`,
        links,
        `<lastmod>${entry.lastModified.toISOString()}</lastmod>`,
        `<changefreq>${entry.changeFrequency}</changefreq>`,
        `<priority>${entry.priority}</priority>`,
        '</url>',
      ].join('\n');
    })
    .join('\n');
  return `${XML_HEADER}\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`;
}

export function renderSitemapIndex(locations: string[]): string {
  const body = locations.map((loc) => `<sitemap><loc>${escapeXml(loc)}</loc></sitemap>`).join('\n');
  return `${XML_HEADER}\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

// Chunk layout served under /sitemaps/<name>:
//   core.xml     static pages, blog posts, categories
//   codes-N.xml  generic codes, API page N (1-based, CODES_PAGE_SIZE per page)
//   brands.xml   manufacturer pages and OEM code variants
export const CODES_PAGE_SIZE = 1000;

export type SitemapChunk = { kind: 'core' } | { kind: 'brands' } | { kind: 'codes'; page: number };

export function chunkName(chunk: SitemapChunk): string {
  if (chunk.kind === 'codes') return `codes-${chunk.page}.xml`;
  return `${chunk.kind}.xml`;
}

export function parseChunkName(name: string): SitemapChunk | null {
  if (name === 'core.xml') return { kind: 'core' };
  if (name === 'brands.xml') return { kind: 'brands' };
  const match = /^codes-([1-9]\d*)\.xml$/.exec(name);
  return match ? { kind: 'codes', page: Number(match[1]) } : null;
}
