import { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getCodesByCategoryPaged } from '@/lib/api';
import { CATEGORIES, CategoryKey } from '@/lib/types';
import { getDict, normalizeLocale, withLocale, type Locale } from '@/lib/i18n';
import CodeCard from '@/components/CodeCard';
import Pagination from '@/components/Pagination';
import { BreadcrumbJsonLd, CollectionPageJsonLd } from '@/components/seo/JsonLd';

const PAGE_SIZE = 24;

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://carweb.app';

const CAT_COLOR: Record<string, string> = {
  P: '#ff8c42',
  B: '#00d4ff',
  C: '#00ff88',
  U: '#a78bfa',
};

async function getLocale(): Promise<Locale> {
  return normalizeLocale((await headers()).get('x-locale'));
}

// Nombre de categoría según idioma (las llaves de CATEGORIES son español).
function catLabel(cat: CategoryKey, locale: Locale): string {
  return getDict(locale).categories[cat];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = category.toUpperCase() as CategoryKey;
  const catInfo = CATEGORIES[cat];
  const locale = await getLocale();
  const t = getDict(locale).category;

  if (!catInfo) return { title: t.notFoundTitle };

  const label = catLabel(cat, locale);
  const esUrl = `${SITE_URL}/category/${cat}`;
  const enUrl = `${SITE_URL}/en/category/${cat}`;
  return {
    title: locale === 'en' ? `${label} Codes` : `Códigos ${label}`,
    description:
      locale === 'en'
        ? `Full list of ${label} OBD2 codes. Find diagnostics, causes and fixes for your vehicle faults on CARWEB.`
        : `Lista completa de códigos OBD2 de ${label}. Encuentra diagnósticos, causas y soluciones para fallas de tu vehículo en CARWEB.`,
    alternates: {
      canonical: locale === 'en' ? enUrl : esUrl,
      languages: { es: esUrl, en: enUrl, 'x-default': esUrl },
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category } = await params;
  const { page: pageParam } = await searchParams;
  const cat = category.toUpperCase() as CategoryKey;
  const catInfo = CATEGORIES[cat];
  const locale = await getLocale();
  const t = getDict(locale).category;
  const L = (href: string) => withLocale(href, locale);

  if (!catInfo) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">{t.notFoundTitle}</h1>
          <p className="text-slate-400 mb-6">{t.notFoundDesc}</p>
          <Link href={L('/')} className="text-neon hover:underline">{t.backHome}</Link>
        </div>
      </div>
    );
  }

  const label = catLabel(cat, locale);
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const { data: codes, total, pages } = await getCodesByCategoryPaged(cat, currentPage, PAGE_SIZE, locale);
  const color = CAT_COLOR[cat] ?? '#00d4ff';

  const canonicalUrl = locale === 'en' ? `${SITE_URL}/en/category/${cat}` : `${SITE_URL}/category/${cat}`;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { position: 1, name: getDict(locale).nav.home, url: locale === 'en' ? `${SITE_URL}/en` : SITE_URL },
          { position: 2, name: label, url: canonicalUrl },
        ]}
      />
      <CollectionPageJsonLd
        name={`${t.codesIn} ${label}`}
        description={
          locale === 'en'
            ? `Full list of ${label} OBD2 codes on CARWEB.`
            : `Lista completa de códigos OBD2 de ${label} en CARWEB.`
        }
        url={canonicalUrl}
      />
      {/* Header */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 cw-grid cw-grid-fade opacity-40" />
        <div className="absolute -top-24 right-0 w-[28rem] h-[28rem] rounded-full blur-[120px] opacity-20" style={{ background: color }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm mb-6" aria-label="Breadcrumb">
            <Link href={L('/')} className="text-slate-400 hover:text-neon transition-colors">{getDict(locale).nav.home}</Link>
            <span className="text-slate-600">/</span>
            <span className="font-medium" style={{ color }}>{label}</span>
          </nav>

          <div className="inline-flex items-center gap-3 px-4 py-2 glass rounded-full mb-5">
            <span className="font-mono text-2xl font-extrabold" style={{ color }}>{cat}</span>
            <span className="text-slate-300 text-sm">{label}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t.codesIn} {label}</h1>
          <p className="text-slate-400 max-w-2xl">
            <span className="font-semibold" style={{ color }}>{total}</span> {t.codesSuffix}
            {pages > 1 && <> {t.page} {currentPage} {t.of} {pages}.</>} {t.selectOne}
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {codes.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {codes.map((code, i) => (
                  <CodeCard key={code.code} code={code} index={i} />
                ))}
              </div>
              <Pagination basePath={L(`/category/${cat}`)} page={currentPage} pages={pages} />
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t.noCodesTitle}</h3>
              <p className="text-slate-400 mb-6">{t.noCodesDesc}</p>
              <Link href={L('/')} className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#00a3c4] text-[#020617] font-semibold rounded-xl transition-colors">
                {t.backHome}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Otras categorías */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-white mb-6">{t.otherCategories}</h2>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(CATEGORIES) as CategoryKey[])
              .filter((key) => key !== cat)
              .map((key) => {
                const c = CAT_COLOR[key];
                return (
                  <Link
                    key={key}
                    href={L(`/category/${key}`)}
                    className="px-4 py-2 glass rounded-full text-sm font-medium hover:border-neon/40 transition-all"
                    style={{ color: c }}
                  >
                    {catLabel(key, locale)}
                  </Link>
                );
              })}
          </div>
        </div>
      </section>
    </>
  );
}
