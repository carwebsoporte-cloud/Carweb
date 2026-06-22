import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getCodeByCode, getRelatedCodes, getCodeVariants, getAllCodes } from '@/lib/api';
import { getDict, normalizeLocale, withLocale, type Locale } from '@/lib/i18n';
import CodeDetailView from '@/components/code/CodeDetailView';

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const codes = await getAllCodes(1, 100);
    return codes.map((code) => ({ codeId: code.code }));
  } catch {
    return [];
  }
}

interface PageProps {
  params: Promise<{ codeId: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://carweb.app';

async function getLocale(): Promise<Locale> {
  return normalizeLocale((await headers()).get('x-locale'));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { codeId } = await params;
  const locale = await getLocale();
  const code = await getCodeByCode(codeId, locale);

  // Si no hay versión genérica, usar la primera variante OEM para el título.
  const title = code?.title ?? (await getCodeVariants(codeId))[0]?.title;
  if (!title) return { title: locale === 'en' ? 'Code not found' : 'Código no encontrado' };

  const upper = (code?.code ?? codeId).toUpperCase();
  const esUrl = `${SITE_URL}/code/${upper}`;
  const enUrl = `${SITE_URL}/en/code/${upper}`;
  const canonical = locale === 'en' ? enUrl : esUrl;

  const description =
    locale === 'en'
      ? `OBD2 code ${upper}: ${title}. ${code?.description ?? ''} Causes, detailed symptoms and a step-by-step fix.`.trim()
      : `Código OBD2 ${upper}: ${title}. ${code?.description ?? ''} Causas, síntomas detallados y solución paso a paso.`.trim();

  return {
    title: `${upper} — ${title}`,
    description,
    alternates: { canonical, languages: { es: esUrl, en: enUrl, 'x-default': esUrl } },
    openGraph: { title: `${upper} — ${title} | CARWEB`, description, type: 'article', locale: locale === 'en' ? 'en_US' : 'es_ES', url: canonical },
  };
}

export default async function CodeDetailPage({ params }: PageProps) {
  const { codeId } = await params;
  const locale = await getLocale();

  const code = await getCodeByCode(codeId, locale);

  // Caso normal: existe la versión genérica (o el backend cayó a ella).
  if (code) {
    const relatedCodes = await getRelatedCodes(code.code, locale);
    return <CodeDetailView code={code} relatedCodes={relatedCodes} locale={locale} />;
  }

  // Código OEM-only (sin genérico): desambiguar por marca.
  const variants = await getCodeVariants(codeId);
  if (variants.length === 0) notFound();

  return <ManufacturerPicker codeId={codeId.toUpperCase()} variants={variants} locale={locale} />;
}

function ManufacturerPicker({
  codeId,
  variants,
  locale,
}: {
  codeId: string;
  variants: { code: string; title: string; manufacturer: { slug: string; name: string; isGeneric: boolean } }[];
  locale: Locale;
}) {
  const t = getDict(locale).variants;
  const L = (href: string) => withLocale(href, locale);

  return (
    <section className="relative min-h-[70vh] py-16">
      <div className="absolute inset-0 cw-grid cw-grid-fade opacity-40" />
      <div className="absolute -top-24 right-0 w-[30rem] h-[30rem] bg-[#00d4ff]/10 rounded-full blur-[120px]" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold font-mono holo-text text-glow-neon mb-4">{codeId}</h1>
          <h2 className="text-2xl font-bold text-white mb-3">{t.pickTitle}</h2>
          <p className="text-slate-400 max-w-xl mx-auto">{t.pickSubTpl.replace('%s', codeId)}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {variants.map((v) => {
            const href = v.manufacturer.isGeneric ? L(`/code/${codeId}`) : L(`/code/${codeId}/${v.manufacturer.slug}`);
            return (
              <Link
                key={v.manufacturer.slug}
                href={href}
                className="glass rounded-2xl p-5 group hover:scale-[1.02] transition-all"
                style={{ borderColor: v.manufacturer.isGeneric ? '#00ff8844' : '#00d4ff33' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{v.manufacturer.isGeneric ? '🌐' : '🏭'}</span>
                  <span className="font-bold text-white text-lg">
                    {v.manufacturer.isGeneric ? t.pickGeneric : v.manufacturer.name}
                  </span>
                </div>
                <p className="text-slate-400 text-sm leading-snug line-clamp-2">
                  {v.manufacturer.isGeneric ? t.pickGenericSub : v.title}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-neon group-hover:gap-2 transition-all">
                  {codeId}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </span>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link href={L('/marcas')} className="text-slate-400 hover:text-neon transition-colors text-sm">
            {getDict(locale).brands.title} →
          </Link>
        </div>
      </div>
    </section>
  );
}
