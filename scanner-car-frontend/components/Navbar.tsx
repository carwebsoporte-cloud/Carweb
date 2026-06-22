'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLocale } from './LocaleProvider';
import LanguageSwitcher from './LanguageSwitcher';
import { getDict, withLocale, stripLocale } from '@/lib/i18n';

/* Íconos de navegación (heroicons-style, 24×24) */
const ICONS: Record<string, string> = {
  inicio: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  buscar: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
  categorias: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
  diagnostico: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26',
  guias: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  anunciarse: 'M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46',
  marcas: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12',
  vehiculo: 'M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z',
};

export default function Navbar() {
  const locale = useLocale();
  const t = getDict(locale);
  const L = (href: string) => withLocale(href, locale);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const pathname = usePathname();
  const basePath = stripLocale(pathname || '/');

  const CATEGORIES = [
    { code: 'P', label: t.categories.P, color: 'text-crit' },
    { code: 'B', label: t.categories.B, color: 'text-neon' },
    { code: 'C', label: t.categories.C, color: 'text-diag' },
    { code: 'U', label: t.categories.U, color: 'text-purple-400' },
  ];

  const NAV_LINKS = [
    { href: '/', label: t.nav.home, icon: 'inicio' },
    { href: '/buscar', label: t.nav.search, icon: 'buscar' },
    { href: '/marcas', label: t.brands.navLabel, icon: 'marcas' },
    { href: '/vehiculo', label: t.vehicle.navLabel, icon: 'vehiculo' },
    { href: '/diagnostico', label: t.nav.diagnostico, icon: 'diagnostico' },
    { href: '/guias', label: t.nav.guides, icon: 'guias' },
    { href: '/anunciarse', label: t.nav.advertise, icon: 'anunciarse' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) =>
    href === '/' ? basePath === '/' : basePath.startsWith(href);

  return (
    <nav
      aria-label="CARWEB"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-[#040a18]/85 backdrop-blur-xl border-neon/30 shadow-lg shadow-black/40'
          : 'bg-[#040a18]/40 backdrop-blur-md border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={L('/')} className="flex items-center group shrink-0" aria-label="CARWEB">
            <Image
              src="/assets/carweb/logo-carweb.webp"
              alt="CARWEB — Diagnóstico OBD2"
              width={400}
              height={105}
              priority
              className="h-10 sm:h-11 w-auto group-hover:scale-[1.03] transition-transform duration-300"
            />
          </Link>

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-0.5">
            <NavItem href={L('/')} label={t.nav.home} icon="inicio" active={isActive('/')} />
            <NavItem href={L('/buscar')} label={t.nav.search} icon="buscar" active={isActive('/buscar')} />

            {/* Categorías dropdown */}
            <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
              <button
                className={`px-3 py-2 text-sm rounded-lg transition-all flex items-center gap-1.5 ${
                  catOpen ? 'text-neon bg-white/5' : 'text-slate-300 hover:text-neon hover:bg-white/5'
                }`}
                aria-haspopup="true"
                aria-expanded={catOpen}
                onClick={() => setCatOpen((v) => !v)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.categorias} />
                </svg>
                {t.nav.categories}
                <svg className={`w-3 h-3 transition-transform ${catOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {catOpen && (
                <div className="absolute top-full left-0 pt-2 w-52">
                  <div className="glass-strong rounded-xl p-2 shadow-2xl shadow-black/50">
                    {CATEGORIES.map((c) => (
                      <Link
                        key={c.code}
                        href={L(`/category/${c.code}`)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                      >
                        <span className={`font-mono font-bold ${c.color}`}>{c.code}</span>
                        <span className="text-sm text-slate-300 group-hover:text-white">{c.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <NavItem href={L('/marcas')} label={t.brands.navLabel} icon="marcas" active={isActive('/marcas')} />
            <NavItem href={L('/vehiculo')} label={t.vehicle.navLabel} icon="vehiculo" active={isActive('/vehiculo')} />
            <NavItem href={L('/diagnostico')} label={t.nav.diagnostico} icon="diagnostico" active={isActive('/diagnostico')} />
            <NavItem href={L('/guias')} label={t.nav.guides} icon="guias" active={isActive('/guias')} />
            <NavItem href={L('/anunciarse')} label={t.nav.advertise} icon="anunciarse" active={isActive('/anunciarse')} />
          </div>

          {/* Acciones derecha */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher className="hidden sm:flex" />

            {/* Mobile button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-neon"
              aria-label={isMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div id="mobile-menu" className="lg:hidden bg-[#040a18]/95 backdrop-blur-xl border-t border-neon/20">
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={L(l.href)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive(l.href) ? 'text-neon bg-neon/10' : 'text-slate-300 hover:text-neon hover:bg-white/5'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[l.icon]} />
                </svg>
                {l.label}
              </Link>
            ))}
            <div className="px-4 pt-2 pb-1 text-xs uppercase tracking-wider text-slate-500">{t.nav.categories}</div>
            <div className="grid grid-cols-2 gap-2 px-2">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.code}
                  href={L(`/category/${c.code}`)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className={`font-mono font-bold ${c.color}`}>{c.code}</span>
                  <span className="text-sm text-slate-300">{c.label}</span>
                </Link>
              ))}
            </div>
            <div className="px-4 pt-3">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavItem({ href, label, icon, active }: { href: string; label: string; icon: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`relative px-3 py-2 text-sm rounded-lg transition-all flex items-center gap-1.5 ${
        active ? 'text-neon' : 'text-slate-300 hover:text-neon hover:bg-white/5'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[icon]} />
      </svg>
      {label}
      {active && (
        <span className="absolute -bottom-[1px] left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#00ff88]" />
      )}
    </Link>
  );
}
