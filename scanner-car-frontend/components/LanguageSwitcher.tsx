'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from './LocaleProvider';
import { LOCALES, type Locale, stripLocale, withLocale } from '@/lib/i18n';

const LABELS: Record<Locale, string> = { es: 'ES', en: 'EN' };

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  // pathname siempre llega en su forma "real" (sin /en, porque el middleware
  // reescribe). Para construir el destino del otro idioma partimos de la ruta
  // base en español y le aplicamos withLocale.
  const basePath = stripLocale(pathname || '/');

  function switchTo(target: Locale) {
    if (target === locale) return;
    // Fija la preferencia por 1 año para desactivar la auto-detección.
    document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=31536000; samesite=lax`;
    router.push(withLocale(basePath, target));
    router.refresh();
  }

  return (
    <div className={`flex items-center rounded-lg border border-white/10 overflow-hidden text-xs font-semibold ${className}`} role="group" aria-label="Language">
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => switchTo(l)}
          aria-pressed={l === locale}
          className={`px-2.5 py-1.5 transition-colors ${
            l === locale ? 'bg-neon text-[#020617]' : 'text-slate-300 hover:text-neon hover:bg-white/5'
          }`}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
