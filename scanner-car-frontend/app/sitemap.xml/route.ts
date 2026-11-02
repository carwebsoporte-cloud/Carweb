import { renderSitemapIndex } from '@/lib/sitemap';
import { listChunkUrls } from '@/lib/sitemap-data';

// /sitemap.xml is a sitemap index; the URLs live in /sitemaps/*.xml chunks.
export const revalidate = 86400;

export async function GET(): Promise<Response> {
  try {
    const xml = renderSitemapIndex(await listChunkUrls());
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('[sitemap] index failed', error);
    return new Response('Sitemap temporarily unavailable', {
      status: 503,
      headers: { 'Cache-Control': 'no-store', 'Retry-After': '300' },
    });
  }
}
