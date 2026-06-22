import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getManufacturers } from '@/lib/api';
import { getDict, normalizeLocale, withLocale, esToEnPath, type Locale } from '@/lib/i18n';
import { BreadcrumbJsonLd, CollectionPageJsonLd } from '@/components/seo/JsonLd';
import BrandLogo from '@/components/BrandLogo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://carweb.app';

async function getLocale(): Promise<Locale> {
  return normalizeLocale((await headers()).get('x-locale'));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDict(locale).brands;
  const esUrl = `${SITE_URL}/marcas`;
  const enPath = esToEnPath('/marcas');
  const enUrl = `${SITE_URL}/en${enPath}`;
  return {
    title: `${t.title} | CARWEB`,
    description: t.subtitle,
    alternates: { canonical: locale === 'en' ? enUrl : esUrl, languages: { es: esUrl, en: enUrl, 'x-default': esUrl } },
  };
}

export default async function MarcasPage() {
  const locale = await getLocale();
  const t = getDict(locale).brands;
  const L = (href: string) => withLocale(href, locale);
  const manufacturers = await getManufacturers();

  const canonicalUrl = locale === 'en' ? `${SITE_URL}/en${esToEnPath('/marcas')}` : `${SITE_URL}/marcas`;

  return (
    <section className="relative min-h-[70vh] py-16">
      <BreadcrumbJsonLd
        items={[
          { position: 1, name: getDict(locale).nav.home, url: locale === 'en' ? `${SITE_URL}/en` : SITE_URL },
          { position: 2, name: t.title, url: canonicalUrl },
        ]}
      />
      <CollectionPageJsonLd
        name={`${t.title} | CARWEB`}
        description={t.subtitle}
        url={canonicalUrl}
      />
      <div className="absolute inset-0 cw-grid cw-grid-fade opacity-40" />
      <div className="absolute -top-24 right-0 w-[30rem] h-[30rem] bg-[#00d4ff]/10 rounded-full blur-[120px]" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <span className="text-neon text-sm font-semibold uppercase tracking-widest">CARWEB</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4">{t.title}</h1>
          <p className="text-slate-400">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {manufacturers.map((m) => {
            const count = m._count?.codes ?? 0;
            const disabled = !m.isGeneric && count === 0;
            const inner = (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <BrandLogo slug={m.slug} name={m.name} isGeneric={m.isGeneric} size={44} />
                  <div className="min-w-0">
                    <p className="font-bold text-white leading-tight truncate">{m.name}</p>
                    {m.country && <p className="text-slate-500 text-xs">{m.country}</p>}
                  </div>
                </div>
                <p className="text-sm" style={{ color: m.isGeneric ? '#00ff88' : count > 0 ? '#00d4ff' : '#64748b' }}>
                  {m.isGeneric ? t.genericLabel : count > 0 ? t.codesCountTpl.replace('%s', String(count)) : t.noCodes}
                </p>
              </>
            );
            return disabled ? (
              <div key={m.slug} className="glass rounded-2xl p-5 opacity-60 cursor-not-allowed">{inner}</div>
            ) : (
              <Link
                key={m.slug}
                href={m.isGeneric ? L('/category/P') : L(`/marcas/${m.slug}`)}
                className="glass rounded-2xl p-5 hover:scale-[1.02] transition-all"
                style={{ borderColor: m.isGeneric ? '#00ff8844' : '#00d4ff33' }}
              >
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
