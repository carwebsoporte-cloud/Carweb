/* Plantilla compartida para páginas de contenido/legales (Nosotros, Términos,
   Privacidad): hero + secciones en tarjetas glass + enlace de regreso. */

import Link from 'next/link';
import { withLocale, type Locale } from '@/lib/i18n';

export interface LegalSection {
  heading: string;
  body?: string[];
  bullets?: string[];
}

export default function LegalLayout({
  locale,
  eyebrow,
  title,
  subtitle,
  updatedLabel,
  intro,
  sections,
  backLabel,
}: {
  locale: Locale;
  eyebrow: string;
  title: string;
  subtitle?: string;
  updatedLabel?: string;
  intro?: string;
  sections: LegalSection[];
  backLabel: string;
}) {
  const L = (href: string) => withLocale(href, locale);

  return (
    <>
      {/* Hero */}
      <section className="relative border-b border-neon/15 bg-[#040a18]/60 overflow-hidden">
        <div className="absolute inset-0 cw-grid cw-grid-fade opacity-30" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-neon text-xs font-bold uppercase tracking-wider bg-neon/10 border border-neon/20 mb-5">
            {eyebrow}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">{title}</h1>
          {subtitle && <p className="text-slate-400 text-lg leading-relaxed">{subtitle}</p>}
          {updatedLabel && <p className="text-slate-600 text-sm mt-4">{updatedLabel}</p>}
        </div>
      </section>

      <section className="relative py-14">
        <div className="absolute inset-0 cw-radial opacity-60 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {intro && <p className="text-slate-300 text-lg leading-relaxed border-l-4 border-neon/50 pl-4 mb-8">{intro}</p>}

          <div className="space-y-5">
            {sections.map((s, i) => (
              <div key={i} className="glass rounded-2xl p-6 sm:p-8">
                <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
                  <span className="text-neon font-mono text-sm">{String(i + 1).padStart(2, '0')}</span>
                  {s.heading}
                </h2>
                {s.body?.map((p, j) => (
                  <p key={j} className="text-slate-300 leading-relaxed mb-3 last:mb-0">{p}</p>
                ))}
                {s.bullets && (
                  <ul className="mt-3 space-y-2">
                    {s.bullets.map((b, k) => (
                      <li key={k} className="flex items-start gap-3 text-slate-300">
                        <span className="w-1.5 h-1.5 mt-2.5 rounded-full bg-neon shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Back */}
      <div className="pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={L('/')} className="inline-flex items-center text-slate-400 hover:text-neon transition-colors text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {backLabel}
          </Link>
        </div>
      </div>
    </>
  );
}
