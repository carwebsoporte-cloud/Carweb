import { parseChunkName, renderUrlset } from '@/lib/sitemap';
import { buildBrandsChunk, buildCodesChunk, buildCoreChunk, listChunkNames } from '@/lib/sitemap-data';

// Cached sitemap chunks: core.xml, codes-N.xml and brands.xml.
export const revalidate = 86400;

// Prerender every chunk at build time so Cloudflare serves static XML instead
// of re-crawling the API per request. If the API is unreachable at build time,
// chunks fall back to on-demand rendering.
export async function generateStaticParams(): Promise<{ chunk: string }[]> {
  try {
    return (await listChunkNames()).map((chunk) => ({ chunk }));
  } catch (error) {
    console.error('[sitemap] generateStaticParams failed; chunks render on demand', error);
    return [];
  }
}

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
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
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
