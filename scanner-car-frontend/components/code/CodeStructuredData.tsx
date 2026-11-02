/* JSON-LD para la página de detalle de un código (TechArticle + Breadcrumb + HowTo).
   Server component: inyecta <script type="application/ld+json">.
   Localizado: la URL canónica, el idioma y los textos siguen al locale activo. */

import type { OBDCode } from '@/lib/types';
import type { Locale } from '@/lib/i18n';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.carweb.com.co';

const CATEGORY_NAME: Record<string, { es: string; en: string }> = {
  P: { es: 'Powertrain (Motor y Transmisión)', en: 'Powertrain (Engine & Transmission)' },
  B: { es: 'Body (Carrocería)', en: 'Body' },
  C: { es: 'Chassis (Chasis)', en: 'Chassis' },
  U: { es: 'Network (Red CAN)', en: 'Network (CAN bus)' },
};

const T = {
  es: {
    home: 'Inicio',
    thing: 'Código OBD2',
    howTo: (c: string) => `Cómo solucionar el código OBD2 ${c} paso a paso`,
    step: 'Paso',
    keywords: ['OBD2', 'código de falla', 'diagnóstico automotriz'],
  },
  en: {
    home: 'Home',
    thing: 'OBD2 code',
    howTo: (c: string) => `How to fix OBD2 code ${c} step by step`,
    step: 'Step',
    keywords: ['OBD2', 'fault code', 'automotive diagnostics'],
  },
} as const;

export default function CodeStructuredData({
  code,
  locale = 'es',
}: {
  code: OBDCode;
  locale?: Locale;
}) {
  const t = T[locale];
  const letter = code.code[0].toUpperCase();
  const catName = CATEGORY_NAME[letter]?.[locale] ?? 'OBD2';
  const prefix = locale === 'en' ? '/en' : '';

  // URL canónica = misma lógica que la página (genérico vs OEM + prefijo /en),
  // para que @id/mainEntityOfPage coincidan con <link rel="canonical">.
  const isOem = !!code.manufacturer && code.manufacturer.isGeneric === false;
  const path = isOem ? `/code/${code.code}/${code.manufacturer!.slug}` : `/code/${code.code}`;
  const url = `${SITE_URL}${prefix}${path}`;
  const categoryUrl = `${SITE_URL}${prefix}/category/${letter}`;
  const storedDescription = code.description?.trim();

  const solutions = (code.solutions ?? []).map((s) => s.solution);

  const techArticle = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: `${code.code} — ${code.title}`,
    ...(storedDescription ? { description: storedDescription } : {}),
    about: { '@type': 'Thing', name: `${t.thing} ${code.code}` },
    articleSection: catName,
    inLanguage: locale,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    ...(code.createdAt ? { datePublished: code.createdAt } : {}),
    ...(code.updatedAt ? { dateModified: code.updatedAt } : {}),
    publisher: {
      '@type': 'Organization',
      name: 'CARWEB',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/carweb/logo-carweb.webp` },
    },
    keywords: [code.code, ...t.keywords, code.title].join(', '),
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t.home, item: `${SITE_URL}${prefix}` },
      { '@type': 'ListItem', position: 2, name: catName, item: categoryUrl },
      { '@type': 'ListItem', position: 3, name: code.code, item: url },
    ],
  };

  // HowTo: las soluciones son un procedimiento paso a paso → schema HowTo.
  const howTo = solutions.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: t.howTo(code.code),
        ...(storedDescription ? { description: storedDescription } : {}),
        inLanguage: locale,
        step: solutions.map((s, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: `${t.step} ${i + 1}`,
          text: s,
        })),
      }
    : null;

  const graph = [techArticle, breadcrumb, ...(howTo ? [howTo] : [])];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
