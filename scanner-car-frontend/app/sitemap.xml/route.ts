import { renderSitemapIndex } from '@/lib/sitemap';
import { listChunkUrls } from '@/lib/sitemap-data';

// /sitemap.xml is a sitemap index; the URLs live in /sitemaps/*.xml chunks.
// Rendered per request (never prerendered: the OpenNext build has no
// incremental cache, so a build-time copy would stay frozen until redeploy and
// could bake in a transient API failure). The CDN cache header does the caching.
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    const xml = renderSitemapIndex(await listChunkUrls());
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
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
