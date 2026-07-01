import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getCodeByCode, getRelatedCodes } from '@/lib/api';
import { normalizeLocale, type Locale } from '@/lib/i18n';
import CodeDetailView from '@/components/code/CodeDetailView';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ codeId: string; manufacturer: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.carweb.com.co';

async function getLocale(): Promise<Locale> {
  return normalizeLocale((await headers()).get('x-locale'));
}

// Canónica según el fabricante REAL del código devuelto: si el backend cayó al
// genérico (la marca no define este código), apuntamos a la URL genérica para
// no generar contenido duplicado.
function canonicalPaths(upper: string, manufacturerSlug: string, isGeneric: boolean) {
  const suffix = isGeneric ? `/code/${upper}` : `/code/${upper}/${manufacturerSlug}`;
  return { es: `${SITE_URL}${suffix}`, en: `${SITE_URL}/en${suffix}` };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { codeId, manufacturer } = await params;
  const locale = await getLocale();
  const code = await getCodeByCode(codeId, locale, manufacturer);
  if (!code) return { title: locale === 'en' ? 'Code not found' : 'Código no encontrado' };

  const upper = code.code.toUpperCase();
  const brandName = code.manufacturer?.name ?? manufacturer;
  const { es: esUrl, en: enUrl } = canonicalPaths(upper, code.manufacturer?.slug ?? manufacturer, !!code.manufacturer?.isGeneric);
  const canonical = locale === 'en' ? enUrl : esUrl;

  const titleSuffix = code.manufacturer?.isGeneric ? '' : ` (${brandName})`;
  const description =
    locale === 'en'
      ? `OBD2 code ${upper}${titleSuffix}: ${code.title}. ${code.description ?? ''} Causes, symptoms and step-by-step fix.`.trim()
      : `Código OBD2 ${upper}${titleSuffix}: ${code.title}. ${code.description ?? ''} Causas, síntomas y solución paso a paso.`.trim();

  return {
    title: `${upper}${titleSuffix} — ${code.title}`,
    description,
    alternates: { canonical, languages: { es: esUrl, en: enUrl, 'x-default': esUrl } },
    openGraph: { title: `${upper}${titleSuffix} — ${code.title} | CARWEB`, description, type: 'article', locale: locale === 'en' ? 'en_US' : 'es_ES', url: canonical },
  };
}

export default async function CodeManufacturerPage({ params }: PageProps) {
  const { codeId, manufacturer } = await params;
  const locale = await getLocale();

  const code = await getCodeByCode(codeId, locale, manufacturer);
  if (!code) notFound();

  const relatedCodes = await getRelatedCodes(code.code, locale);
  return <CodeDetailView code={code} relatedCodes={relatedCodes} locale={locale} />;
}
