import { NextRequest, NextResponse } from 'next/server';
import { esToEnPath, enToEsPath, isOldEnglishSlug } from './lib/i18n-routes';

// Estrategia i18n v3 (Fase 3):
//  · Español = idioma base, servido en la raíz (/...). Sus URLs no cambian.
//  · Inglés  = servido bajo /en con slugs en INGLÉS real:
//      /en/brands, /en/guides, /en/diagnosis, /en/search, /en/vehicle, /en/advertise
//    El middleware reescribe /en/<en-slug> → /<es-slug> internamente
//    y marca el request con el header `x-locale=en`.
//  · Redirect 301 de slugs antiguos (/en/marcas → /en/brands).
//  · Primera visita sin preferencia guardada (cookie NEXT_LOCALE): si el
//    navegador pide inglés, se redirige a /en con slug traducido.

function detectLocale(req: NextRequest): 'es' | 'en' {
  const accept = req.headers.get('accept-language') || '';
  const first = accept.split(',')[0]?.trim().toLowerCase() || '';
  return first.startsWith('en') ? 'en' : 'es';
}

function withLocaleHeader(req: NextRequest, locale: 'es' | 'en', rewriteTo?: URL) {
  const headers = new Headers(req.headers);
  headers.set('x-locale', locale);
  const res = rewriteTo
    ? NextResponse.rewrite(rewriteTo, { request: { headers } })
    : NextResponse.next({ request: { headers } });
  res.headers.set('x-locale', locale);
  return res;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Rutas en inglés ──
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const enPath = pathname === '/en' ? '/' : pathname.slice(3);

    // Redirect 301: slug español antiguo → slug inglés nuevo
    if (isOldEnglishSlug(enPath)) {
      const newEnPath = esToEnPath(enPath);
      const url = req.nextUrl.clone();
      url.pathname = newEnPath === '/' ? '/en' : `/en${newEnPath}`;
      return NextResponse.redirect(url, 301);
    }

    // Rewrite: /en/<en-slug> → /<es-slug> internamente
    const esPath = enToEsPath(enPath);
    const url = req.nextUrl.clone();
    url.pathname = esPath;
    return withLocaleHeader(req, 'en', url);
  }

  // ── Rutas en español. Auto-detección solo en la primera visita ──
  const hasPreference = req.cookies.has('NEXT_LOCALE');
  if (!hasPreference && detectLocale(req) === 'en') {
    const enPath = pathname === '/' ? '' : esToEnPath(pathname);
    const url = req.nextUrl.clone();
    url.pathname = enPath === '' ? '/en' : `/en${enPath}`;
    return NextResponse.redirect(url);
  }

  return withLocaleHeader(req, 'es');
}

// Excluye API, panel admin, assets de Next, uploads y archivos con extensión
// (sitemap.xml, robots.txt, *.png, etc.).
export const config = {
  matcher: ['/((?!api|admin|_next|uploads|.*\\..*).*)'],
};
