import { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import SearchBox from '@/components/SearchBox';
import CodeCard from '@/components/CodeCard';
import { searchCodesFull, searchBySymptom } from '@/lib/api';
import { OBDCode } from '@/lib/types';
import { getDict, normalizeLocale, withLocale, esToEnPath, type Locale } from '@/lib/i18n';

interface PageProps {
  searchParams: Promise<{ q?: string; modo?: string }>;
}

async function getLocale(): Promise<Locale> {
  return normalizeLocale((await headers()).get('x-locale'));
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.carweb.com.co';

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = (q ?? '').trim();
  const locale = await getLocale();
  const t = getDict(locale).search;
  const enPath = locale === 'en' ? esToEnPath('/buscar') : '/buscar';
  const canonical = `${SITE_URL}${locale === 'en' ? '/en' : ''}${enPath}`;
  return {
    title: query ? `${t.metaResultsPrefix} "${query}"` : t.metaSearch,
    description: query ? `${t.metaResultsPrefix} "${query}" · CARWEB.` : t.metaDescDefault,
    robots: query ? 'noindex, follow' : 'index, follow',
    alternates: { canonical },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q, modo: modoRaw } = await searchParams;
  const query = (q ?? '').trim();
  const locale = await getLocale();
  const t = getDict(locale).search;
  const L = (href: string) => withLocale(href, locale);
  const isSymptom = modoRaw === 'sintoma';
  const minLen = isSymptom ? 3 : 2;

  let results: OBDCode[] = [];
  if (query.length >= minLen) {
    try {
      results = isSymptom ? await searchBySymptom(query, 24, locale) : await searchCodesFull(query, 60, locale);
    } catch {
      results = [];
    }
  }

  const toggleHref = (m: 'codigo' | 'sintoma') => `${L('/buscar')}?modo=${m}${query ? `&q=${encodeURIComponent(query)}` : ''}`;

  return (
    <section className="relative min-h-[70vh] py-16">
      <div className="absolute inset-0 cw-grid cw-grid-fade opacity-40" />
      <div className="absolute -top-24 right-0 w-[30rem] h-[30rem] bg-[#00d4ff]/10 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <span className="text-neon text-sm font-semibold uppercase tracking-widest">{t.eyebrow}</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-6">
            {query ? <>{t.titleResultsPrefix} <span className="holo-text font-mono">{query}</span></> : isSymptom ? t.symptomTitle : t.titleSearch}
          </h1>

          {/* Toggle de modo */}
          <div className="inline-flex items-center rounded-xl border border-white/10 overflow-hidden mb-6 text-sm font-semibold">
            <Link href={toggleHref('codigo')} className={`px-4 py-2 transition-colors ${!isSymptom ? 'bg-neon text-[#020617]' : 'text-slate-300 hover:text-neon hover:bg-white/5'}`}>
              {t.byCode}
            </Link>
            <Link href={toggleHref('sintoma')} className={`px-4 py-2 transition-colors ${isSymptom ? 'bg-neon text-[#020617]' : 'text-slate-300 hover:text-neon hover:bg-white/5'}`}>
              {t.bySymptom}
            </Link>
          </div>

          {/* Buscador según el modo */}
          {isSymptom ? (
            <form action={L('/buscar')} method="GET" className="relative">
              <input type="hidden" name="modo" value="sintoma" />
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00d4ff] to-[#00ff88] rounded-2xl blur-md opacity-30 group-focus-within:opacity-60 transition-opacity duration-300" />
                <div className="relative flex items-center glass-strong rounded-2xl overflow-hidden">
                  <div className="pl-5 text-neon" aria-hidden="true">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>
                  </div>
                  <input type="text" name="q" defaultValue={query} placeholder={t.symptomPlaceholder} autoComplete="off" aria-label={t.symptomTitle} className="flex-1 px-4 py-4 bg-transparent text-white placeholder-slate-500 focus:outline-none" />
                  <button type="submit" className="m-1.5 px-6 py-2.5 bg-gradient-to-r from-[#00d4ff] to-[#00a3c4] text-[#020617] font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-[#00d4ff]/40 shrink-0">
                    {getDict(locale).searchBox.button}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <SearchBox />
          )}
        </div>

        {/* Estados */}
        {query.length < minLen ? (
          isSymptom ? (
            <SymptomHint locale={locale} />
          ) : (
            <EmptyState title={t.hintTitle} desc={t.hintDesc} />
          )
        ) : results.length === 0 ? (
          <EmptyState
            title={`${t.noResultsTitle} "${query}"`}
            desc={isSymptom ? t.symptomNoResults : t.noResultsDesc}
            showCategories={!isSymptom}
            locale={locale}
          />
        ) : (
          <>
            <p className="text-slate-400 text-sm mb-6">
              <span className="text-white font-semibold">{results.length}</span> {t.resultsSuffix}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map((code, i) => (
                <CodeCard key={code.code} code={code} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function SymptomHint({ locale }: { locale: Locale }) {
  const t = getDict(locale).search;
  return (
    <div className="text-center py-12 max-w-lg mx-auto">
      <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{t.symptomHintTitle}</h3>
      <p className="text-slate-400 mb-6">{t.symptomHintDesc}</p>
      <p className="text-slate-500 text-sm mb-3">{t.symptomExamplesLabel}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {t.symptomExamples.map((ex) => (
          <Link
            key={ex}
            href={`${withLocale('/buscar', locale)}?modo=sintoma&q=${encodeURIComponent(ex)}`}
            className="px-3 py-1.5 glass rounded-full text-sm text-slate-300 hover:text-neon hover:border-neon/40 transition-all"
          >
            {ex}
          </Link>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ title, desc, showCategories = false, locale = 'es' }: { title: string; desc: string; showCategories?: boolean; locale?: Locale }) {
  const t = getDict(locale).search;
  const cats = [
    { code: 'P', label: t.catMotor, color: '#ff8c42' },
    { code: 'B', label: t.catBody, color: '#00d4ff' },
    { code: 'C', label: t.catChassis, color: '#00ff88' },
    { code: 'U', label: t.catNetwork, color: '#a78bfa' },
  ];
  return (
    <div className="text-center py-16 max-w-lg mx-auto">
      <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{desc}</p>

      {showCategories && (
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {cats.map((c) => (
            <Link
              key={c.code}
              href={withLocale(`/category/${c.code}`, locale)}
              className="px-4 py-2 glass rounded-full text-sm font-medium hover:border-neon/40 transition-all"
              style={{ color: c.color }}
            >
              {c.code} · {c.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
