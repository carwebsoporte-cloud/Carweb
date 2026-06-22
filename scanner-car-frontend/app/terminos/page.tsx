import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { normalizeLocale, type Locale } from '@/lib/i18n';
import LegalLayout, { type LegalSection } from '@/components/LegalLayout';
import { EMAIL } from '@/lib/contact';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://carweb.app';

async function getLocale(): Promise<Locale> {
  return normalizeLocale((await headers()).get('x-locale'));
}

export async function generateMetadata(): Promise<Metadata> {
  const en = (await getLocale()) === 'en';
  const esUrl = `${SITE_URL}/terminos`;
  const enUrl = `${SITE_URL}/en/terminos`;
  return {
    title: en ? 'Terms & Conditions | CARWEB' : 'Términos y Condiciones | CARWEB',
    description: en
      ? 'Terms and conditions for using CARWEB: how the platform works, advertising and Amazon affiliate links, and disclaimers.'
      : 'Términos y condiciones de uso de CARWEB: cómo funciona la plataforma, la publicidad y los enlaces de afiliado de Amazon, y las limitaciones de responsabilidad.',
    alternates: { canonical: en ? enUrl : esUrl, languages: { es: esUrl, en: enUrl, 'x-default': esUrl } },
  };
}

const CONTENT: Record<Locale, { eyebrow: string; title: string; subtitle: string; updated: string; back: string; sections: LegalSection[] }> = {
  es: {
    eyebrow: 'Legal',
    title: 'Términos y Condiciones',
    subtitle: 'Al usar CARWEB aceptas estas condiciones. Te explicamos cómo funciona la plataforma y qué puedes esperar de ella.',
    updated: 'Última actualización: 19 de junio de 2026',
    back: 'Volver al inicio',
    sections: [
      { heading: 'Aceptación de los términos', body: [
        'CARWEB ("el sitio", "nosotros") es una plataforma informativa sobre códigos de diagnóstico OBD2. Al acceder y usar el sitio, aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo, te pedimos no utilizar la plataforma.',
      ] },
      { heading: '¿Cómo funciona la plataforma?', body: [
        'CARWEB te permite buscar códigos de falla OBD2 (P, B, C y U) y consultar su significado, síntomas, causas probables y posibles soluciones. También ofrece un diagnóstico guiado por síntomas, guías técnicas, búsqueda por marca y un decodificador de VIN.',
        'Todo el contenido tiene carácter informativo y educativo. CARWEB no realiza diagnósticos mecánicos reales sobre tu vehículo ni ejecuta reparaciones: es una herramienta de consulta para ayudarte a entender una falla.',
      ] },
      { heading: 'Uso de la información (descargo de responsabilidad)', body: [
        'La información se basa en estándares del sector (como SAE J2012) y fuentes públicas, y puede contener imprecisiones o no aplicar exactamente a tu vehículo, año o fabricante.',
        'CARWEB no se hace responsable de daños, pérdidas o gastos derivados de decisiones tomadas con base en el contenido del sitio. Antes de cualquier reparación —especialmente de seguridad (frenos, airbags, dirección)— consulta siempre a un mecánico certificado. Las estimaciones de costos son orientativas y varían según región y taller.',
      ] },
      { heading: 'Publicidad y enlaces de afiliados (Amazon)', body: [
        'CARWEB es gratuito y se financia, en parte, mediante publicidad. El sitio muestra banners y espacios publicitarios en sus páginas (excepto en la página de inicio).',
        'Algunos de estos anuncios son enlaces de afiliados. En particular, CARWEB participa en el programa de afiliados de Amazon (Amazon Associates): al hacer clic en ciertos banners serás redirigido a Amazon u otras tiendas asociadas. Si realizas una compra a través de esos enlaces, CARWEB puede recibir una comisión, sin que ello represente ningún costo adicional para ti.',
        'Los productos, precios y disponibilidad mostrados en esas tiendas son responsabilidad del comercio correspondiente (por ejemplo, Amazon), no de CARWEB. No garantizamos ni respaldamos ningún producto anunciado; tu relación de compra es directamente con la tienda de destino.',
      ] },
      { heading: 'Espacios para vendedores de repuestos', body: [
        'CARWEB ofrece espacios publicitarios a vendedores de repuestos y servicios. La aparición de un anunciante no implica recomendación ni garantía por parte de CARWEB sobre la calidad de sus productos o servicios. Cualquier transacción se realiza directamente entre el usuario y el anunciante.',
      ] },
      { heading: 'Propiedad intelectual', body: [
        'La marca CARWEB, el diseño del sitio y la organización editorial del contenido son propiedad de CARWEB. Puedes consultar y compartir enlaces a las páginas, pero no reproducir masivamente el contenido con fines comerciales sin autorización.',
      ] },
      { heading: 'Cambios en los términos', body: [
        'Podemos actualizar estos Términos y Condiciones en cualquier momento. La versión vigente es la publicada en esta página, con su fecha de actualización. El uso continuado del sitio implica la aceptación de los cambios.',
      ] },
      { heading: 'Contacto', body: [
        `Si tienes preguntas sobre estos términos, escríbenos a ${EMAIL}.`,
      ] },
    ],
  },
  en: {
    eyebrow: 'Legal',
    title: 'Terms & Conditions',
    subtitle: 'By using CARWEB you accept these terms. Here we explain how the platform works and what you can expect from it.',
    updated: 'Last updated: June 19, 2026',
    back: 'Back to home',
    sections: [
      { heading: 'Acceptance of terms', body: [
        'CARWEB ("the site", "we") is an informational platform about OBD2 diagnostic trouble codes. By accessing and using the site, you accept these Terms & Conditions in full. If you do not agree, please do not use the platform.',
      ] },
      { heading: 'How the platform works', body: [
        'CARWEB lets you look up OBD2 fault codes (P, B, C and U) and review their meaning, symptoms, probable causes and possible fixes. It also offers a symptom-based guided diagnosis, technical guides, search by brand and a VIN decoder.',
        'All content is informational and educational. CARWEB does not perform actual mechanical diagnostics on your vehicle nor carry out repairs: it is a reference tool to help you understand a fault.',
      ] },
      { heading: 'Use of information (disclaimer)', body: [
        'The information is based on industry standards (such as SAE J2012) and public sources, and may contain inaccuracies or not apply exactly to your vehicle, year or manufacturer.',
        'CARWEB is not liable for any damage, loss or expense arising from decisions made based on the site content. Before any repair —especially safety-related ones (brakes, airbags, steering)— always consult a certified mechanic. Cost estimates are indicative and vary by region and shop.',
      ] },
      { heading: 'Advertising and affiliate links (Amazon)', body: [
        'CARWEB is free and is funded, in part, through advertising. The site displays banners and advertising spaces on its pages (except the home page).',
        'Some of these ads are affiliate links. In particular, CARWEB participates in the Amazon affiliate program (Amazon Associates): clicking certain banners will redirect you to Amazon or other partner stores. If you make a purchase through those links, CARWEB may earn a commission, at no additional cost to you.',
        'The products, prices and availability shown in those stores are the responsibility of the relevant retailer (for example, Amazon), not CARWEB. We do not guarantee or endorse any advertised product; your purchase relationship is directly with the destination store.',
      ] },
      { heading: 'Parts seller spaces', body: [
        'CARWEB offers advertising spaces to parts and service sellers. The presence of an advertiser does not imply a recommendation or warranty by CARWEB regarding the quality of its products or services. Any transaction is carried out directly between the user and the advertiser.',
      ] },
      { heading: 'Intellectual property', body: [
        'The CARWEB brand, the site design and the editorial organization of the content are the property of CARWEB. You may browse and share links to the pages, but not massively reproduce the content for commercial purposes without authorization.',
      ] },
      { heading: 'Changes to the terms', body: [
        'We may update these Terms & Conditions at any time. The version in force is the one published on this page, with its update date. Continued use of the site implies acceptance of the changes.',
      ] },
      { heading: 'Contact', body: [
        `If you have questions about these terms, write to us at ${EMAIL}.`,
      ] },
    ],
  },
};

export default async function TerminosPage() {
  const locale = await getLocale();
  const c = CONTENT[locale];
  return (
    <LegalLayout
      locale={locale}
      eyebrow={c.eyebrow}
      title={c.title}
      subtitle={c.subtitle}
      updatedLabel={c.updated}
      sections={c.sections}
      backLabel={c.back}
    />
  );
}
