import Link from 'next/link';
import { headers } from 'next/headers';
import { normalizeLocale, withLocale } from '@/lib/i18n';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://carweb.app';

const CATEGORIES = [
  { code: 'P', color: '#ff8c42' },
  { code: 'B', color: '#00d4ff' },
  { code: 'C', color: '#00ff88' },
  { code: 'U', color: '#a78bfa' },
];

export default async function NotFound() {
  const locale = normalizeLocale((await headers()).get('x-locale'));
  const L = (href: string) => withLocale(href, locale);
  const en = locale === 'en';

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center py-16">
      <div className="absolute inset-0 cw-grid cw-grid-fade opacity-40" />
      <div className="absolute inset-0 cw-radial opacity-60" />
      <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-24 h-24 glass rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-12 h-12 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-6xl sm:text-7xl font-extrabold holo-text text-glow-neon mb-2">404</h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-4">
          {en ? 'Page Not Found' : 'Página No Encontrada'}
        </h2>
        <p className="text-slate-400 max-w-md mx-auto mb-6">
          {en
            ? 'The page you are looking for does not exist or has been moved. Try searching for an OBD2 code instead.'
            : 'La página que buscas no existe o ha sido movida. Prueba buscando un código OBD2.'}
        </p>

        <div className="max-w-sm mx-auto mb-8">
          <form action={L('/buscar')} method="GET" className="flex">
            <input
              type="text"
              name="q"
              placeholder={en ? 'Search OBD2 code...' : 'Buscar código OBD2...'}
              className="flex-1 px-4 py-3 bg-[#040a18]/80 text-white rounded-l-xl border border-white/10 focus:border-neon focus:outline-none placeholder-slate-600 uppercase text-sm"
            />
            <button
              type="submit"
              className="px-4 py-3 bg-gradient-to-r from-[#00d4ff] to-[#00a3c4] text-[#020617] font-bold rounded-r-xl text-sm"
            >
              {en ? 'Search' : 'Buscar'}
            </button>
          </form>
        </div>

        <div className="space-y-3">
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">
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

        <div className="mt-8">
          <Link href={L('/')} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#00a3c4] text-[#020617] font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-[#00d4ff]/30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {en ? 'Go Home' : 'Ir al Inicio'}
          </Link>
        </div>
      </div>
    </section>
  );
}
