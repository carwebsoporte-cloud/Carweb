import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getDict, normalizeLocale, esToEnPath, type Locale } from '@/lib/i18n';
import VinDecoder from '@/components/VinDecoder';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://carweb.app';

async function getLocale(): Promise<Locale> {
  return normalizeLocale((await headers()).get('x-locale'));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDict(locale).vehicle;
  const esUrl = `${SITE_URL}/vehiculo`;
  const enPath = esToEnPath('/vehiculo');
  const enUrl = `${SITE_URL}/en${enPath}`;
  return {
    title: `${t.title} | CARWEB`,
    description: t.subtitle,
    alternates: { canonical: locale === 'en' ? enUrl : esUrl, languages: { es: esUrl, en: enUrl, 'x-default': esUrl } },
    openGraph: { title: `${t.title} | CARWEB`, description: t.subtitle, type: 'website', locale: locale === 'en' ? 'en_US' : 'es_ES', url: locale === 'en' ? enUrl : esUrl },
  };
}

export default async function VehiculoPage() {
  const t = getDict(await getLocale()).vehicle;

  return (
    <section className="relative min-h-[70vh] py-16">
      <div className="absolute inset-0 cw-grid cw-grid-fade opacity-40" />
      <div className="absolute -top-24 right-0 w-[30rem] h-[30rem] bg-[#00d4ff]/10 rounded-full blur-[120px]" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-neon text-sm font-semibold uppercase tracking-widest">{t.eyebrow}</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4">{t.title}</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>
        <VinDecoder />
      </div>
    </section>
  );
}
