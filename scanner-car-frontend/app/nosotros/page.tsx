import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { normalizeLocale, type Locale } from '@/lib/i18n';
import LegalLayout, { type LegalSection } from '@/components/LegalLayout';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://carweb.app';

async function getLocale(): Promise<Locale> {
  return normalizeLocale((await headers()).get('x-locale'));
}

export async function generateMetadata(): Promise<Metadata> {
  const en = (await getLocale()) === 'en';
  const esUrl = `${SITE_URL}/nosotros`;
  const enUrl = `${SITE_URL}/en/nosotros`;
  return {
    title: en ? 'About Us | CARWEB' : 'Sobre Nosotros | CARWEB',
    description: en
      ? 'CARWEB is the professional OBD2 trouble-code encyclopedia. Learn who we are, our mission and how the project works.'
      : 'CARWEB es la enciclopedia profesional de códigos OBD2. Conoce quiénes somos, nuestra misión y cómo funciona el proyecto.',
    alternates: { canonical: en ? enUrl : esUrl, languages: { es: esUrl, en: enUrl, 'x-default': esUrl } },
  };
}

const CONTENT: Record<Locale, { eyebrow: string; title: string; subtitle: string; intro: string; back: string; sections: LegalSection[] }> = {
  es: {
    eyebrow: 'Sobre Nosotros',
    title: 'Quiénes somos',
    subtitle: 'CARWEB es la enciclopedia digital de códigos de falla OBD2 pensada para conductores, mecánicos y entusiastas del automóvil.',
    intro: 'Creemos que entender una falla de tu vehículo no debería costar una visita al taller solo para "saber qué pasa". Por eso construimos una plataforma clara, gratuita y en español donde cualquier persona puede buscar su código OBD2 y comprender qué significa, por qué ocurre y cómo solucionarlo.',
    back: 'Volver al inicio',
    sections: [
      { heading: '¿Qué es CARWEB?', body: [
        'CARWEB es una base de datos de códigos de diagnóstico OBD2 (los famosos "DTC" que aparecen cuando se enciende la luz Check Engine). Cada código incluye una explicación de la avería, sus síntomas más comunes, las causas probables y una guía de solución paso a paso.',
        'Además del buscador, ofrecemos un diagnóstico guiado por síntomas, guías técnicas, búsqueda por marca de vehículo y un decodificador de VIN con información oficial de recalls.',
      ] },
      { heading: 'Nuestra misión', body: [
        'Democratizar el conocimiento del diagnóstico automotriz. Queremos que cualquier conductor llegue al taller sabiendo de qué le hablan, evite reparaciones innecesarias y tome decisiones informadas sobre su vehículo.',
      ] },
      { heading: '¿Qué te ofrecemos?', bullets: [
        'Buscador de códigos OBD2 (P, B, C y U) con explicación, síntomas, causas y soluciones.',
        'Diagnóstico guiado: describe el síntoma y te mostramos los códigos más probables.',
        'Guías de diagnóstico para entender cómo funciona el sistema OBD2.',
        'Búsqueda por marca y decodificador de VIN con recalls oficiales.',
        'Contenido disponible en español e inglés.',
      ] },
      { heading: '¿Cómo se sostiene el proyecto?', body: [
        'CARWEB es de acceso gratuito. Para mantener la plataforma y seguir ampliando la base de datos, el sitio muestra publicidad. Parte de esos anuncios son enlaces de afiliados: al hacer clic en algunos banners serás dirigido a Amazon u otras tiendas, y si realizas una compra podemos recibir una pequeña comisión sin costo adicional para ti.',
        'Esto nos permite mantener el contenido gratuito y libre de muros de pago. También ofrecemos espacios publicitarios a vendedores de repuestos para conectar a los usuarios con quienes pueden ayudarles a reparar su vehículo.',
      ] },
      { heading: 'Nuestro compromiso con la calidad', body: [
        'La información de CARWEB es de referencia y se basa en estándares del sector (como SAE J2012) y fuentes públicas. No reemplaza el criterio de un mecánico certificado: ante una reparación, especialmente de seguridad, recomendamos siempre acudir a un profesional.',
        'Trabajamos continuamente para corregir errores y ampliar la cobertura. Si encuentras un dato incorrecto, escríbenos y lo revisamos.',
      ] },
    ],
  },
  en: {
    eyebrow: 'About Us',
    title: 'Who we are',
    subtitle: 'CARWEB is the digital encyclopedia of OBD2 trouble codes built for drivers, mechanics and car enthusiasts.',
    intro: 'We believe understanding a fault in your vehicle should not require a trip to the shop just to "find out what is going on". That is why we built a clear, free platform where anyone can look up their OBD2 code and understand what it means, why it happens and how to fix it.',
    back: 'Back to home',
    sections: [
      { heading: 'What is CARWEB?', body: [
        'CARWEB is a database of OBD2 diagnostic trouble codes (the "DTCs" that appear when the Check Engine light turns on). Each code includes an explanation of the failure, its most common symptoms, the probable causes and a step-by-step fix guide.',
        'Beyond the search engine, we offer a symptom-based guided diagnosis, technical guides, search by vehicle brand and a VIN decoder with official recall information.',
      ] },
      { heading: 'Our mission', body: [
        'To democratize automotive diagnostic knowledge. We want every driver to arrive at the shop knowing what is being discussed, avoid unnecessary repairs and make informed decisions about their vehicle.',
      ] },
      { heading: 'What we offer', bullets: [
        'OBD2 code search (P, B, C and U) with explanation, symptoms, causes and fixes.',
        'Guided diagnosis: describe the symptom and we show the most likely codes.',
        'Diagnostic guides to understand how the OBD2 system works.',
        'Search by brand and a VIN decoder with official recalls.',
        'Content available in Spanish and English.',
      ] },
      { heading: 'How is the project funded?', body: [
        'CARWEB is free to access. To keep the platform running and to keep expanding the database, the site displays advertising. Some of those ads are affiliate links: clicking certain banners will take you to Amazon or other stores, and if you make a purchase we may earn a small commission at no extra cost to you.',
        'This lets us keep the content free and paywall-free. We also offer advertising spaces to parts sellers to connect users with those who can help them repair their vehicle.',
      ] },
      { heading: 'Our commitment to quality', body: [
        'CARWEB information is for reference and is based on industry standards (such as SAE J2012) and public sources. It does not replace the judgment of a certified mechanic: for any repair, especially safety-related ones, we always recommend consulting a professional.',
        'We work continuously to correct errors and expand coverage. If you find an incorrect detail, write to us and we will review it.',
      ] },
    ],
  },
};

export default async function NosotrosPage() {
  const locale = await getLocale();
  const c = CONTENT[locale];
  return (
    <LegalLayout
      locale={locale}
      eyebrow={c.eyebrow}
      title={c.title}
      subtitle={c.subtitle}
      intro={c.intro}
      sections={c.sections}
      backLabel={c.back}
    />
  );
}
