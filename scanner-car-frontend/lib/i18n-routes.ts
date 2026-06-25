// Lógica de rutas e idioma (i18n) SIN diccionarios de UI.
// Se separó de lib/i18n.ts para que el middleware (Edge Runtime de Vercel)
// la importe sin arrastrar el diccionario de ~30KB al bundle del Edge, lo
// que rompía el deploy ("Edge Function referencing unsupported modules").

export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'es';

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'es' || value === 'en';
}

export function normalizeLocale(value: string | null | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

// Mapeo de slugs: español (ruta base) → inglés (ruta pública bajo /en)
const ES_TO_EN: [string, string][] = [
  ['/buscar', '/search'],
  ['/marcas', '/brands'],
  ['/guias', '/guides'],
  ['/diagnostico', '/diagnosis'],
  ['/vehiculo', '/vehicle'],
  ['/anunciarse', '/advertise'],
];

// Inverso: inglés → español (para middleware)
const EN_TO_ES: [string, string][] = ES_TO_EN.map(([es, en]) => [en, es]);

export function esToEnPath(path: string): string {
  for (const [es, en] of ES_TO_EN) {
    if (path === es) return en;
    if (path.startsWith(es + '/')) return en + path.slice(es.length);
  }
  return path;
}

export function enToEsPath(path: string): string {
  for (const [en, es] of EN_TO_ES) {
    if (path === en) return es;
    if (path.startsWith(en + '/')) return es + path.slice(en.length);
  }
  return path;
}

/** Comprueba si una ruta (sin /en) usa un slug español antiguo (para redirect 301). */
export function isOldEnglishSlug(path: string): boolean {
  for (const [es] of ES_TO_EN) {
    if (path === es || path.startsWith(es + '/')) return true;
  }
  return false;
}

/** Prefija una ruta interna con el idioma actual. El español no lleva prefijo;
 *  el inglés se sirve bajo /en con slug traducido. */
export function withLocale(href: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return href;
  if (!href.startsWith('/')) return href;
  const enPath = href === '/' ? '' : esToEnPath(href);
  if (enPath === '') return '/en';
  return `/en${enPath}`;
}

/** Quita el prefijo /en de una ruta y revierte el slug inglés → español. */
export function stripLocale(pathname: string): string {
  const base = pathname === '/en' ? '/' : pathname.startsWith('/en/') ? pathname.slice(3) : pathname;
  return enToEsPath(base);
}
