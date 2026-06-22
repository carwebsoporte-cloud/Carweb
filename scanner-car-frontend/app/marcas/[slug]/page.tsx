import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getManufacturerCodes } from '@/lib/api';
import { getDict, normalizeLocale, withLocale, esToEnPath, type Locale } from '@/lib/i18n';
import CodeCard from '@/components/CodeCard';
import Pagination from '@/components/Pagination';
import BrandLogo from '@/components/BrandLogo';
import { BreadcrumbJsonLd, CollectionPageJsonLd } from '@/components/seo/JsonLd';

const PAGE_SIZE = 24;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://carweb.app';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function getLocale(): Promise<Locale> {
  return normalizeLocale((await headers()).get('x-locale'));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const t = getDict(locale).brands;
  const res = await getManufacturerCodes(slug, 1, 1, locale);
  if (!res.manufacturer) return { title: t.title };

  const name = res.manufacturer.name;
  const esUrl = `${SITE_URL}/marcas/${slug}`;
  const enPath = esToEnPath(`/marcas/${slug}`);
  const enUrl = `${SITE_URL}/en${enPath}`;
  return {
    title: `${t.brandCodesTpl.replace('%s', name)} | CARWEB`,
    description:
      locale === 'en'
        ? `Manufacturer-specific OBD2 fault codes for ${name}. Diagnostics, causes and step-by-step fixes on CARWEB.`
        : `Códigos de falla OBD2 específicos de ${name}. Diagnósticos, causas y soluciones paso a paso en CARWEB.`,
    alternates: { canonical: locale === 'en' ? enUrl : esUrl, languages: { es: esUrl, en: enUrl, 'x-default': esUrl } },
  };
}

export default async function BrandCodesPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const locale = await getLocale();
  const t = getDict(locale).brands;
  const L = (href: string) => withLocale(href, locale);

  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const res = await getManufacturerCodes(slug, currentPage, PAGE_SIZE, locale);
  if (!res.manufacturer) notFound();

  const { manufacturer: m, data: codes, total, pages } = res;
  const isGeneric = m!.isGeneric;
  const canonicalUrl = locale === 'en' ? `${SITE_URL}/en${esToEnPath(`/marcas/${slug}`)}` : `${SITE_URL}/marcas/${slug}`;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { position: 1, name: getDict(locale).nav.home, url: locale === 'en' ? `${SITE_URL}/en` : SITE_URL },
          { position: 2, name: getDict(locale).brands.title, url: locale === 'en' ? `${SITE_URL}/en/brands` : `${SITE_URL}/marcas` },
          { position: 3, name: m!.name, url: canonicalUrl },
        ]}
      />
      <CollectionPageJsonLd
        name={t.brandCodesTpl.replace('%s', m!.name)}
        description={
          locale === 'en'
            ? `Manufacturer-specific OBD2 fault codes for ${m!.name}.`
            : `Códigos de falla OBD2 específicos de ${m!.name}.`
        }
        url={canonicalUrl}
      />
      <section className="relative py-14 overflow-hidden">
        <div className="absolute inset-0 cw-grid cw-grid-fade opacity-40" />
        <div className="absolute -top-24 right-0 w-[28rem] h-[28rem] rounded-full blur-[120px] opacity-20 bg-[#00d4ff]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm mb-6" aria-label="Breadcrumb">
            <Link href={L('/')} className="text-slate-400 hover:text-neon transition-colors">{getDict(locale).nav.home}</Link>
            <span className="text-slate-600">/</span>
            <Link href={L('/marcas')} className="text-slate-400 hover:text-neon transition-colors">{t.title}</Link>
            <span className="text-slate-600">/</span>
            <span className="text-[#00d4ff] font-medium">{m!.name}</span>
          </nav>

          <div className="inline-flex items-center gap-3 px-4 py-2 glass rounded-full mb-5">
            <BrandLogo slug={m!.slug} name={m!.name} isGeneric={isGeneric} size={36} />
            <span className="text-slate-200 font-semibold">{m!.name}</span>
            {m!.country && <span className="text-slate-500 text-sm">· {m!.country}</span>}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{t.brandCodesTpl.replace('%s', m!.name)}</h1>
          <p className="text-slate-400 max-w-2xl">
            <span className="font-semibold text-[#00d4ff]">{total}</span> {t.codesCountTpl.replace('%s', '').trim()}
            {pages > 1 && <> · {getDict(locale).category.page} {currentPage} {getDict(locale).category.of} {pages}</>}. {t.selectOne}
          </p>
        </div>
      </section>

      <section className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {codes.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {codes.map((code, i) => (
                  <CodeCard key={code.code} code={code} index={i} manufacturerSlug={isGeneric ? undefined : slug} />
                ))}
              </div>
              <Pagination basePath={L(`/marcas/${slug}`)} page={currentPage} pages={pages} />
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-slate-400 mb-6">{t.noCodes}</p>
              <Link href={L('/marcas')} className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#00a3c4] text-[#020617] font-semibold rounded-xl transition-colors">
                {t.backToBrands}
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
