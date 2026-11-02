import { parseChunkName, renderUrlset } from '@/lib/sitemap';
import { buildBrandsChunk, buildCodesChunk, buildCoreChunk } from '@/lib/sitemap-data';

// Sitemap chunks: core.xml, codes-N.xml and brands.xml. Rendered per request
// (see app/sitemap.xml/route.ts); builders are all-or-nothing, so any API
// failure yields a 503 that is never cached.
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ chunk: string }> }): Promise<Response> {
  const { chunk: name } = await params;
  const chunk = parseChunkName(name);
  if (!chunk) return new Response('Not found', { status: 404 });

  try {
    const entries =
      chunk.kind === 'core' ? await buildCoreChunk()
      : chunk.kind === 'brands' ? await buildBrandsChunk()
      : await buildCodesChunk(chunk.page);
    if (!entries) return new Response('Not found', { status: 404 });

    return new Response(renderUrlset(entries), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('[sitemap] chunk failed', { name, error });
    return new Response('Sitemap temporarily unavailable', {
      status: 503,
      headers: { 'Cache-Control': 'no-store', 'Retry-After': '300' },
    });
  }
}
