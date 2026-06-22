'use client';

import Link from 'next/link';
import { useLocale } from '@/components/LocaleProvider';
import { getDict, withLocale } from '@/lib/i18n';

const CATEGORIES = [
  { code: 'P', color: '#ff8c42' },
  { code: 'B', color: '#00d4ff' },
  { code: 'C', color: '#00ff88' },
  { code: 'U', color: '#a78bfa' },
];

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const L = (href: string) => withLocale(href, locale);
  const en = locale === 'en';

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center py-16">
      <div className="absolute inset-0 cw-grid cw-grid-fade opacity-40" />
      <div className="absolute inset-0 cw-radial opacity-60" />
      <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-24 h-24 glass rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-12 h-12 text-crit" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
          {en ? 'Something Went Wrong' : 'Algo Salió Mal'}
        </h1>
        <p className="text-slate-400 max-w-md mx-auto mb-8">
          {en
            ? 'An unexpected error occurred. Please try again or search for an OBD2 code.'
            : 'Ocurrió un error inesperado. Intenta de nuevo o busca un código OBD2.'}
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#00a3c4] text-[#020617] font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-[#00d4ff]/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {en ? 'Try Again' : 'Reintentar'}
          </button>
          <Link href={L('/')} className="inline-flex items-center gap-2 px-6 py-3 glass text-white font-bold rounded-xl transition-all hover:bg-white/10">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {en ? 'Go Home' : 'Ir al Inicio'}
          </Link>
        </div>

        <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-3">
          {en ? 'Browse by Category' : 'Explora por Categoría'}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.code}
              href={L(`/category/${c.code}`)}
              className="px-4 py-2 glass rounded-full text-sm font-medium hover:border-neon/40 transition-all"
              style={{ color: c.color }}
            >
              {c.code} · {en ? (c.code === 'P' ? 'Powertrain' : c.code === 'B' ? 'Body' : c.code === 'C' ? 'Chassis' : 'Network') : (c.code === 'P' ? 'Motor' : c.code === 'B' ? 'Carrocería' : c.code === 'C' ? 'Chasis' : 'Red CAN')}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
