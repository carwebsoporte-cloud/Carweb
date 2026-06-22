'use client';

import { createContext, useContext } from 'react';
import type { Locale } from '@/lib/i18n';
import { DEFAULT_LOCALE, withLocale as withLocaleHref } from '@/lib/i18n';

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

/** Idioma actual para Client Components. */
export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** Prefija una ruta con el idioma actual (atajo para Client Components). */
export function useLocalizedHref(): (href: string) => string {
  const locale = useContext(LocaleContext);
  return (href: string) => withLocaleHref(href, locale);
}
