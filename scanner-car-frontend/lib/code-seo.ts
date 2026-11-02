// Pure CTR helpers for code pages: <title> and meta description templates.
// No framework imports so they can be unit tested with `node --test`.

export type SeoLocale = 'es' | 'en';

export const TITLE_BRAND_SUFFIX = ' | CARWEB';
export const MAX_TITLE_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 155;

// Intent words appended to the code title, from most to least descriptive.
const TITLE_INTENT: Record<SeoLocale, { withTitle: string[]; alone: string[] }> = {
  es: {
    withTitle: ['Causas, Síntomas y Solución', 'Causas y Solución'],
    alone: ['Causas, Síntomas y Solución', 'Causas y Solución'],
  },
  en: {
    withTitle: ['Causes, Symptoms & Fix', 'Causes & Fix'],
    alone: ['Causes, Symptoms & How to Fix', 'Causes & Fix'],
  },
};

const DESCRIPTION_TAIL: Record<SeoLocale, (label: string) => string[]> = {
  es: (label) => [`${label}: causas, síntomas y solución paso a paso.`, 'Causas, síntomas y solución.'],
  en: (label) => [`${label}: causes, symptoms and how to fix.`, 'Causes, symptoms and fix.'],
};

const DESCRIPTION_LEAD_FALLBACK: Record<SeoLocale, (label: string, title: string) => string> = {
  es: (label, title) => `Código OBD2 ${label}: ${title}.`,
  en: (label, title) => `OBD2 code ${label}: ${title}.`,
};

export interface CodeTitleInput {
  locale: SeoLocale;
  // Code plus optional brand, e.g. "P0300" or "P0300 (Audi)".
  label: string;
  title: string;
}

// `title` omits the brand (the root layout template appends it); `ogTitle`
// carries it explicitly for Open Graph. The code title is worked in only when
// the whole title, brand included, fits in MAX_TITLE_LENGTH.
export function buildCodeTitle({ locale, label, title }: CodeTitleInput): { title: string; ogTitle: string } {
  const budget = MAX_TITLE_LENGTH - TITLE_BRAND_SUFFIX.length;
  const cleanTitle = title.trim();
  const intent = TITLE_INTENT[locale];
  const candidates = [
    ...(cleanTitle ? intent.withTitle.map((words) => `${label}: ${cleanTitle} — ${words}`) : []),
    ...intent.alone.map((words) => `${label}: ${words}`),
  ];
  const chosen = candidates.find((candidate) => candidate.length <= budget) ?? candidates[candidates.length - 1];
  return { title: chosen, ogTitle: `${chosen}${TITLE_BRAND_SUFFIX}` };
}

export interface CodeDescriptionInput {
  locale: SeoLocale;
  label: string;
  title: string;
  description?: string | null;
}

function cutAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(' ');
  const base = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
  return base.replace(/[\s.,;:!?-]+$/, '');
}

// Leads with what the code means (stored description, or the title when there
// is none) and ends with intent words, within MAX_DESCRIPTION_LENGTH.
export function buildCodeDescription({ locale, label, title, description }: CodeDescriptionInput): string {
  const stored = description?.trim();
  const lead = stored || DESCRIPTION_LEAD_FALLBACK[locale](label, title.trim());
  const tails = DESCRIPTION_TAIL[locale](label);

  for (const tail of tails) {
    const candidate = `${lead} ${tail}`;
    if (candidate.length <= MAX_DESCRIPTION_LENGTH) return candidate;
  }

  const shortTail = tails[tails.length - 1];
  const room = MAX_DESCRIPTION_LENGTH - shortTail.length - 2; // "…" + space
  return `${cutAtWord(lead, room)}… ${shortTail}`;
}
