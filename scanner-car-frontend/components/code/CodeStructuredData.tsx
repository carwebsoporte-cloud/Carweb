/* JSON-LD para la página de detalle de un código (TechArticle + Breadcrumb + FAQ).
   Server component: inyecta <script type="application/ld+json">.
   Localizado: la URL canónica, el idioma y los textos siguen al locale activo. */

import type { OBDCode } from '@/lib/types';
import type { Locale } from '@/lib/i18n';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://carweb.app';

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
    descFallback: (c: string, t: string) => `Código OBD2 ${c}: ${t}.`,
    qMeaning: (c: string) => `¿Qué significa el código ${c}?`,
    qSymptoms: (c: string) => `¿Cuáles son los síntomas del código ${c}?`,
    qCauses: (c: string) => `¿Qué causa el código ${c}?`,
    qSolution: (c: string) => `¿Cómo se soluciona el código ${c}?`,
    qDrive: (c: string) => `¿Puedo seguir conduciendo con el código ${c}?`,
    keywords: ['OBD2', 'código de falla', 'diagnóstico automotriz'],
  },
  en: {
    home: 'Home',
    thing: 'OBD2 code',
    descFallback: (c: string, t: string) => `OBD2 code ${c}: ${t}.`,
    qMeaning: (c: string) => `What does code ${c} mean?`,
    qSymptoms: (c: string) => `What are the symptoms of code ${c}?`,
    qCauses: (c: string) => `What causes code ${c}?`,
    qSolution: (c: string) => `How do you fix code ${c}?`,
    qDrive: (c: string) => `Can I keep driving with code ${c}?`,
    keywords: ['OBD2', 'fault code', 'automotive diagnostics'],
  },
} as const;

export default function CodeStructuredData({
  code,
  severityAdvice,
  locale = 'es',
}: {
  code: OBDCode;
  severityAdvice: string;
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

  const symptoms = (code.symptoms ?? []).map((s) => s.symptom);
  const causes = (code.causes ?? []).map((c) => c.cause);
  const solutions = (code.solutions ?? []).map((s) => s.solution);

  const techArticle = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: `${code.code} — ${code.title}`,
    description: code.description || t.descFallback(code.code, code.title),
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

  const faqEntries: { q: string; a: string }[] = [
    { q: t.qMeaning(code.code), a: `${code.title}. ${code.description || ''}`.trim() },
  ];
  if (symptoms.length) faqEntries.push({ q: t.qSymptoms(code.code), a: symptoms.join('. ') + '.' });
  if (causes.length) faqEntries.push({ q: t.qCauses(code.code), a: causes.join('. ') + '.' });
  if (solutions.length) faqEntries.push({ q: t.qSolution(code.code), a: solutions.join(' ') });
  faqEntries.push({ q: t.qDrive(code.code), a: severityAdvice });

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqEntries.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const graph = [techArticle, breadcrumb, faq];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
