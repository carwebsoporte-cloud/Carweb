import { headers } from 'next/headers';
import HeroSection from '@/components/hero/HeroSection';
import CategoryGrid from '@/components/CategoryGrid';
import HowItWorks from '@/components/HowItWorks';
import CodeCard from '@/components/CodeCard';
import RecentCodes from '@/components/RecentCodes';
import { getAllCodes, getCategories } from '@/lib/api';
import { OBDCode, OBDCategory } from '@/lib/types';
import { getDict, normalizeLocale } from '@/lib/i18n';
import { WebSiteJsonLd, OrganizationJsonLd } from '@/components/seo/JsonLd';

export default async function HomePage() {
  const locale = normalizeLocale((await headers()).get('x-locale'));
  const t = getDict(locale).home;
  let codes: OBDCode[] = [];
  let categories: OBDCategory[] = [];

  try {
    [codes, categories] = await Promise.all([
      getAllCodes(1, 12, locale),
      getCategories(),
    ]);
  } catch (error) {
    console.error('Error loading home data:', error);
  }

  const popular = codes.slice(0, 6);
  const recent = codes.slice(0, 12);

  return (
    <>
      <WebSiteJsonLd locale={locale} />
      <OrganizationJsonLd />
      {/* HERO */}
      <HeroSection />

      {/* CATEGORÍAS — carrusel full-bleed: usa todo el ancho de la pantalla
          (sin el contenedor max-w-7xl) para que no se corte a la izquierda. */}
      <section className="relative pt-0 pb-8">
        <CategoryGrid categories={categories} />
      </section>

      {/* CÓMO FUNCIONA — debajo, a todo el ancho */}
      <section className="relative pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HowItWorks />
        </div>
      </section>

      {/* RECIENTES */}
      <RecentCodes codes={recent} />

      {/* CÓDIGOS POPULARES */}
      {popular.length > 0 && (
        <section className="relative py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <span className="text-neon text-sm font-semibold uppercase tracking-widest">{t.popularEyebrow}</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">{t.popularTitle}</h2>
              <p className="text-slate-400 mt-2">{t.popularSub}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {popular.map((code, i) => (
                <CodeCard key={code.code} code={code} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
