import type { Metadata } from 'next';
import { headers } from 'next/headers';
import DiagnosticoWizard from '@/components/DiagnosticoWizard';
import { normalizeLocale, esToEnPath } from '@/lib/i18n';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.carweb.com.co';

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale((await headers()).get('x-locale'));
  const en = locale === 'en';
  const esUrl = `${SITE_URL}/diagnostico`;
  const enPath = esToEnPath('/diagnostico');
  const enUrl = `${SITE_URL}/en${enPath}`;
  const title = en ? 'Guided OBD2 Diagnosis | CARWEB' : 'Diagnóstico Guiado OBD2 | CARWEB';
  const description = en
    ? 'Step-by-step diagnostic tool: select the affected system and symptoms to identify the most likely OBD2 codes for your vehicle.'
    : 'Herramienta de diagnóstico paso a paso: selecciona el sistema afectado y los síntomas para identificar los códigos OBD2 más probables en tu vehículo.';
  return {
    title,
    description,
    alternates: { canonical: en ? enUrl : esUrl, languages: { es: esUrl, en: enUrl, 'x-default': esUrl } },
    openGraph: { title, description, type: 'website', locale: en ? 'en_US' : 'es_ES', url: en ? enUrl : esUrl },
    robots: { index: true, follow: true },
  };
}

export default function DiagnosticoPage() {
  return <DiagnosticoWizard />;
}
