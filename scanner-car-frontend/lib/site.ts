// Configuración central de la identidad del sitio (marca, dominio, entidad).
// Punto único de verdad para SEO/JSON-LD: evita que el dominio o el nombre de
// marca queden hardcodeados en múltiples sitios (riesgo al cambiar de dominio).
//
// El dominio de producción es carweb.com.co. En Vercel define
// NEXT_PUBLIC_SITE_URL=https://carweb.com.co para sobreescribir el fallback.

import { WHATSAPP, EMAIL } from './contact';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.carweb.com.co').replace(/\/$/, '');

export const SITE_NAME = 'CARWEB';
export const SITE_LEGAL_NAME = 'CARWEB';

export const LOGO_URL = `${SITE_URL}/assets/carweb/logo-carweb.webp`;

export const SITE_DESCRIPTION = {
  es: 'CARWEB es la enciclopedia profesional de códigos de avería OBD2 en español: encuentra cualquier código de falla, comprende la avería, identifica las causas y descubre la solución paso a paso.',
  en: 'CARWEB is the professional OBD2 trouble-code encyclopedia: find any fault code, understand the failure, identify the causes and discover the step-by-step fix.',
} as const;

/** Resumen corto y citable de la marca (para IA generativas / GEO). */
export const SITE_TAGLINE = {
  es: 'Enciclopedia profesional de códigos OBD2: diagnóstico, causas y soluciones.',
  en: 'Professional OBD2 trouble-code encyclopedia: diagnostics, causes and fixes.',
} as const;

/** Perfiles sociales oficiales. Añádelos aquí cuando existan; si está vacío,
 *  el JSON-LD omite `sameAs` (no se debe emitir un array vacío). */
export const SOCIAL_LINKS: string[] = [
  // 'https://www.facebook.com/...',
  // 'https://www.instagram.com/...',
  // 'https://www.youtube.com/...',
  // 'https://x.com/...',
];

/** Datos de contacto reutilizados en la entidad Organization. */
export const CONTACT = {
  email: EMAIL,
  /** Teléfono en formato E.164 para schema.org (telephone). */
  phone: `+${WHATSAPP}`,
  /** Países/idiomas a los que sirve principalmente el sitio. */
  areaServed: ['CO', 'MX', 'AR', 'CL', 'PE', 'EC', 'ES', 'US'],
  languages: ['es', 'en'],
} as const;

/** URL absoluta para una ruta interna respetando el prefijo de idioma. */
export function absoluteUrl(path = '', locale: 'es' | 'en' = 'es'): string {
  const prefix = locale === 'en' ? '/en' : '';
  const clean = path === '/' ? '' : path;
  return `${SITE_URL}${prefix}${clean}`;
}
