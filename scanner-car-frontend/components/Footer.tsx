import Link from 'next/link';
import Image from 'next/image';
import type { Locale } from '@/lib/i18n';
import { getDict, withLocale } from '@/lib/i18n';

export default function Footer({ locale = 'es' }: { locale?: Locale }) {
  const t = getDict(locale);
  const L = (href: string) => withLocale(href, locale);

  const brandLine = locale === 'en' ? 'Smart Automotive Diagnostics' : 'Diagnóstico Automotriz Inteligente';
  const footnote =
    locale === 'en' ? 'Professional OBD2 trouble-code encyclopedia' : 'Enciclopedia profesional de códigos OBD2 en español';

  return (
    <footer className="relative mt-24 border-t border-neon/15 bg-[#040a18]">
      <div className="absolute inset-0 cw-grid cw-grid-fade opacity-40 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Image
              src="/assets/carweb/logo-carweb.webp"
              alt="CARWEB — Diagnóstico OBD2"
              width={400}
              height={105}
              className="h-10 w-auto mb-4"
            />
            <p className="text-slate-400 text-sm leading-relaxed">{t.footer.tagline}</p>
          </div>

          {/* Categorías */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{t.nav.categories}</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href={L('/category/P')} className="text-slate-400 hover:text-neon transition-colors">{t.categories.P}</Link></li>
              <li><Link href={L('/category/B')} className="text-slate-400 hover:text-neon transition-colors">{t.categories.B}</Link></li>
              <li><Link href={L('/category/C')} className="text-slate-400 hover:text-neon transition-colors">{t.categories.C}</Link></li>
              <li><Link href={L('/category/U')} className="text-slate-400 hover:text-neon transition-colors">{t.categories.U}</Link></li>
            </ul>
          </div>

          {/* Plataforma */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{t.footer.sections}</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href={L('/buscar')} className="text-slate-400 hover:text-neon transition-colors">{t.footer.search}</Link></li>
              <li><Link href={L('/diagnostico')} className="text-slate-400 hover:text-neon transition-colors">{t.footer.diagnostico}</Link></li>
              <li><Link href={L('/guias')} className="text-slate-400 hover:text-neon transition-colors">{t.footer.guides}</Link></li>
              <li><Link href={L('/blog')} className="text-slate-400 hover:text-neon transition-colors">{t.footer.blog}</Link></li>
              <li><Link href={L('/anunciarse')} className="text-slate-400 hover:text-neon transition-colors">{t.footer.advertise}</Link></li>
            </ul>
          </div>

          {/* Legal e información */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{t.footer.legal}</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href={L('/nosotros')} className="text-slate-400 hover:text-neon transition-colors">{t.footer.about}</Link></li>
              <li><Link href={L('/contacto')} className="text-slate-400 hover:text-neon transition-colors">{t.footer.contact}</Link></li>
              <li><Link href={L('/terminos')} className="text-slate-400 hover:text-neon transition-colors">{t.footer.terms}</Link></li>
              <li><Link href={L('/privacidad')} className="text-slate-400 hover:text-neon transition-colors">{t.footer.privacy}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700/40 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} CARWEB · {brandLine}
          </p>
          <p className="text-slate-600 text-xs">{footnote}</p>
        </div>
      </div>
    </footer>
  );
}
