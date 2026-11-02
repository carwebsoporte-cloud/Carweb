import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getCodeByCode, getRelatedCodes } from '@/lib/api';
import { normalizeLocale, type Locale } from '@/lib/i18n';
import CodeDetailView from '@/components/code/CodeDetailView';

// Fuerza render por-request: la página lee headers() (x-locale) para decidir
// el idioma, lo cual es incompatible con la generación estática.
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ codeId: string; manufacturer: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.carweb.com.co';

async function getLocale(): Promise<Locale> {
  return normalizeLocale((await headers()).get('x-locale'));
}

function canonicalPaths(upper: string, manufacturerSlug: string) {
  const suffix = `/code/${upper}/${manufacturerSlug}`;
  return { es: `${SITE_URL}${suffix}`, en: `${SITE_URL}/en${suffix}` };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { codeId, manufacturer } = await params;
  const locale = await getLocale();
  const code = await getCodeByCode(codeId, locale, manufacturer);
  if (!code) return { title: locale === 'en' ? 'Code not found' : 'Código no encontrado' };
  if (locale === 'en' && !code.hasEnglishTranslation) {
    return {
      title: 'Code not found',
      robots: { index: false, follow: false },
    };
  }

  const upper = code.code.toUpperCase();
  const brandName = code.manufacturer?.name ?? manufacturer;
  const { es: esUrl, en: enUrl } = canonicalPaths(upper, code.manufacturer?.slug ?? manufacturer);
  const canonical = locale === 'en' ? enUrl : esUrl;

  const titleSuffix = code.manufacturer?.isGeneric ? '' : ` (${brandName})`;
  const description =
    locale === 'en'
      ? `OBD2 code ${upper}${titleSuffix}: ${code.title}. ${code.description ?? ''} Causes, symptoms and step-by-step fix.`.trim()
      : `Código OBD2 ${upper}${titleSuffix}: ${code.title}. ${code.description ?? ''} Causas, síntomas y solución paso a paso.`.trim();

  return {
    title: `${upper}${titleSuffix} — ${code.title}`,
    description,
    alternates: {
      canonical,
      languages: code.hasEnglishTranslation
        ? { es: esUrl, en: enUrl, 'x-default': esUrl }
        : { es: esUrl, 'x-default': esUrl },
    },
    robots: { index: code.seoIndexable, follow: true },
    openGraph: { title: `${upper}${titleSuffix} — ${code.title} | CARWEB`, description, type: 'article', locale: locale === 'en' ? 'en_US' : 'es_ES', url: canonical },
  };
}

export default async function CodeManufacturerPage({ params }: PageProps) {
  const { codeId, manufacturer } = await params;
  const locale = await getLocale();

  const code = await getCodeByCode(codeId, locale, manufacturer);
  if (!code || code.manufacturer?.isGeneric || (locale === 'en' && !code.hasEnglishTranslation)) notFound();

  const relatedCodes = await getRelatedCodes(code.code, locale);
  return <CodeDetailView code={code} relatedCodes={relatedCodes} locale={locale} />;
}
