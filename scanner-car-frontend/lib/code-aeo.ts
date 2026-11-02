// Pure AEO helpers for code pages: an answer-first summary and an FAQ built
// deterministically from fields the API already returns. Nothing is invented
// or generated: parts whose data is missing are omitted. No framework imports
// so they can be unit tested with `node --test`.

import type { Faq } from './faq';

export type AeoLocale = 'es' | 'en';

export interface AeoCodeInput {
  // Code plus optional brand, e.g. "P0300" or "P0300 (Audi)".
  label: string;
  title: string;
  description?: string | null;
  severity?: string | null;
  causes: string[];
  symptoms: string[];
  solutions: string[];
}

export const SUMMARY_MAX_WORDS = 60;
const SUMMARY_MAX_CAUSES = 3;
const FAQ_MAX_ITEMS = 5;

type SeverityKey = 'critical' | 'moderate' | 'low';

function severityKey(severity?: string | null): SeverityKey | null {
  switch (severity) {
    case 'Crítica/No conducir': return 'critical';
    case 'Moderada': return 'moderate';
    case 'Baja': return 'low';
    default: return null;
  }
}

const COPY = {
  es: {
    summaryHeading: (label: string) => `¿Qué significa el código ${label}?`,
    means: (label: string, title: string) => `${label} significa «${title}».`,
    severity: {
      critical: 'Gravedad crítica: no se recomienda seguir conduciendo.',
      moderate: 'Gravedad moderada: puedes conducir con precaución hasta el taller.',
      low: 'Gravedad baja: puedes seguir conduciendo y programar una revisión.',
    } satisfies Record<SeverityKey, string>,
    summaryCauses: (list: string) => `Causas comunes: ${list}.`,
    and: 'y',
    faqMeaning: (label: string) => `¿Qué significa el código ${label}?`,
    faqCauses: (label: string) => `¿Cuáles son las causas más comunes del código ${label}?`,
    faqCausesAnswer: (label: string, list: string) => `Las causas más comunes del código ${label} son: ${list}.`,
    faqSymptoms: (label: string) => `¿Qué síntomas produce el código ${label}?`,
    faqSymptomsAnswer: (list: string) => `Los síntomas más comunes son: ${list}.`,
    faqDrive: (label: string) => `¿Puedo seguir conduciendo con el código ${label}?`,
    drive: {
      critical: 'No. Detén el vehículo en un lugar seguro: seguir conduciendo puede causar daños graves al motor o poner en riesgo tu seguridad.',
      moderate: 'Con precaución. Puedes manejar hasta el taller, pero no postergues la reparación: el problema puede empeorar y dañar otros componentes.',
      low: 'Sí. Puedes seguir manejando con normalidad, pero agenda una revisión próxima para no afectar las emisiones o el rendimiento.',
    } satisfies Record<SeverityKey, string>,
    faqFix: (label: string) => `¿Cómo se soluciona el código ${label}?`,
    steps: 'Pasos recomendados:',
  },
  en: {
    summaryHeading: (label: string) => `What does ${label} mean?`,
    means: (label: string, title: string) => `${label} means “${title}”.`,
    severity: {
      critical: 'Critical severity: do not keep driving.',
      moderate: 'Moderate severity: you can drive to a shop with caution.',
      low: 'Low severity: you can keep driving and schedule a check.',
    } satisfies Record<SeverityKey, string>,
    summaryCauses: (list: string) => `Common causes: ${list}.`,
    and: 'and',
    faqMeaning: (label: string) => `What does the ${label} code mean?`,
    faqCauses: (label: string) => `What are the most common causes of the ${label} code?`,
    faqCausesAnswer: (label: string, list: string) => `The most common causes of ${label} are: ${list}.`,
    faqSymptoms: (label: string) => `What symptoms does the ${label} code cause?`,
    faqSymptomsAnswer: (list: string) => `The most common symptoms are: ${list}.`,
    faqDrive: (label: string) => `Can I keep driving with the ${label} code?`,
    drive: {
      critical: 'No. Stop the vehicle in a safe place: continuing to drive may cause serious engine damage or put your safety at risk.',
      moderate: 'With caution. You can drive to the shop, but do not postpone the repair: the problem may worsen and damage other components.',
      low: 'Yes. You can keep driving normally, but schedule a check soon so emissions and performance are not affected.',
    } satisfies Record<SeverityKey, string>,
    faqFix: (label: string) => `How do I fix the ${label} code?`,
    steps: 'Recommended steps:',
  },
} as const;

function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function clean(items: string[]): string[] {
  return items.map((item) => item.trim()).filter(Boolean);
}

function stripEnd(text: string): string {
  return text.trim().replace(/[\s.,;:!?]+$/, '');
}

function sentence(text: string): string {
  const trimmed = text.trim();
  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function firstSentence(text: string): string {
  const match = /^.*?[.!?](?=\s|$)/.exec(text.trim());
  return match ? match[0] : text.trim();
}

// Lowercases the first letter so an item reads inside a sentence, except when
// the first word is an acronym or code (e.g. "ECU defectuosa").
function lowerFirst(text: string): string {
  const firstWord = text.split(/\s+/)[0] ?? '';
  return /[A-ZÁÉÍÓÚÑ]/.test(firstWord.slice(1)) ? text : text.charAt(0).toLowerCase() + text.slice(1);
}

function joinList(items: string[], conjunction: string): string {
  const list = items.map(lowerFirst);
  if (list.length <= 1) return list.join('');
  return `${list.slice(0, -1).join(', ')} ${conjunction} ${list[list.length - 1]}`;
}

export function buildAnswerSummary(input: AeoCodeInput, locale: AeoLocale): { heading: string; text: string } | null {
  const title = stripEnd(input.title);
  if (!title) return null;
  const copy = COPY[locale];
  const meaning = copy.means(input.label, title);
  const description = input.description?.trim() ? sentence(input.description) : '';
  const sev = severityKey(input.severity);
  const causes = clean(input.causes);

  const descriptionOptions = description ? [description, sentence(firstSentence(description)), ''] : [''];
  for (const desc of descriptionOptions) {
    for (let n = Math.min(SUMMARY_MAX_CAUSES, causes.length); n >= 0; n--) {
      const text = [
        meaning,
        desc,
        sev ? copy.severity[sev] : '',
        n > 0 ? copy.summaryCauses(joinList(causes.slice(0, n), copy.and)) : '',
      ].filter(Boolean).join(' ');
      if (countWords(text) <= SUMMARY_MAX_WORDS) return { heading: copy.summaryHeading(input.label), text };
    }
  }
  return { heading: copy.summaryHeading(input.label), text: meaning };
}

export function buildCodeFaq(input: AeoCodeInput, locale: AeoLocale): Faq[] {
  const title = stripEnd(input.title);
  if (!title) return [];
  const copy = COPY[locale];
  const { label } = input;
  const faq: Faq[] = [];

  const description = input.description?.trim() ? sentence(input.description) : '';
  faq.push({ q: copy.faqMeaning(label), a: [copy.means(label, title), description].filter(Boolean).join(' ') });

  const causes = clean(input.causes).slice(0, FAQ_MAX_ITEMS);
  if (causes.length) {
    faq.push({ q: copy.faqCauses(label), a: copy.faqCausesAnswer(label, joinList(causes, copy.and)) });
  }

  const symptoms = clean(input.symptoms).slice(0, FAQ_MAX_ITEMS);
  if (symptoms.length) {
    faq.push({ q: copy.faqSymptoms(label), a: copy.faqSymptomsAnswer(joinList(symptoms, copy.and)) });
  }

  const sev = severityKey(input.severity);
  if (sev) faq.push({ q: copy.faqDrive(label), a: copy.drive[sev] });

  const solutions = clean(input.solutions).slice(0, FAQ_MAX_ITEMS);
  if (solutions.length) {
    const steps = solutions.map((step, i) => `${i + 1}. ${sentence(stripEnd(step))}`).join(' ');
    faq.push({ q: copy.faqFix(label), a: `${copy.steps} ${steps}` });
  }

  return faq;
}
