// Bloque de preguntas frecuentes visible y accesible.
// Usa <details>/<summary> nativos: funciona sin JavaScript, es navegable por
// teclado y los buscadores leen el texto directamente (AEO). El JSON-LD
// FAQPage se inyecta aparte (ver FaqJsonLd) con el mismo contenido.

import type { Locale } from '@/lib/i18n';
import type { Faq } from '@/lib/faq';

const HEADING: Record<Locale, { eyebrow: string; title: string }> = {
  es: { eyebrow: 'Preguntas frecuentes', title: 'Resolvemos tus dudas sobre los códigos OBD2' },
  en: { eyebrow: 'Frequently asked questions', title: 'Your questions about OBD2 codes, answered' },
};

export default function FaqSection({
  items,
  locale,
  title,
  eyebrow,
}: {
  items: Faq[];
  locale: Locale;
  title?: string;
  eyebrow?: string;
}) {
  if (!items.length) return null;
  const h = HEADING[locale];

  return (
    <section className="relative py-14" aria-labelledby="faq-heading">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="text-neon text-sm font-semibold uppercase tracking-widest">{eyebrow ?? h.eyebrow}</span>
          <h2 id="faq-heading" className="text-3xl sm:text-4xl font-bold text-white mt-2">{title ?? h.title}</h2>
        </div>

        <div className="space-y-3">
          {items.map((f, i) => (
            <details key={i} className="group glass rounded-2xl px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-white font-semibold text-base sm:text-lg marker:content-none">
                <span>{f.q}</span>
                <svg
                  className="w-5 h-5 shrink-0 text-neon transition-transform duration-300 group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
