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
  const esUrl = `${SITE_URL}/privacidad`;
  const enUrl = `${SITE_URL}/en/privacidad`;
  return {
    title: en ? 'Privacy Policy | CARWEB' : 'Política de Privacidad | CARWEB',
    description: en
      ? 'How CARWEB handles your data: cookies, advertising (Google AdSense, Amazon Associates), third-party services and your rights.'
      : 'Cómo CARWEB maneja tus datos: cookies, publicidad (Google AdSense, Amazon Associates), servicios de terceros y tus derechos.',
    alternates: { canonical: en ? enUrl : esUrl, languages: { es: esUrl, en: enUrl, 'x-default': esUrl } },
  };
}

const CONTENT: Record<Locale, { eyebrow: string; title: string; subtitle: string; updated: string; back: string; sections: LegalSection[] }> = {
  es: {
    eyebrow: 'Legal',
    title: 'Política de Privacidad',
    subtitle: 'Tu privacidad nos importa. Aquí te explicamos qué datos se recogen, cómo se usan y qué papel juegan los servicios de terceros.',
    updated: 'Última actualización: 19 de junio de 2026',
    back: 'Volver al inicio',
    sections: [
      { heading: 'Responsable y alcance', body: [
        'Esta política aplica al sitio CARWEB. Está pensada para ser clara y honesta: CARWEB es principalmente un sitio de consulta y no requiere que crees una cuenta ni que entregues datos personales para usarlo.',
      ] },
      { heading: '¿Qué datos recopilamos?', bullets: [
        'Datos de uso anónimos: páginas visitadas, búsquedas de códigos, tipo de dispositivo y navegador, con fines estadísticos.',
        'Datos que tú nos envías voluntariamente: si nos escribes por correo o WhatsApp, tratamos los datos que decidas compartir para responderte.',
        'No solicitamos ni almacenamos información sensible para navegar el sitio (no necesitas registrarte).',
      ] },
      { heading: 'Cookies y tecnologías similares', body: [
        'CARWEB y sus proveedores pueden usar cookies para recordar tus preferencias (por ejemplo, el idioma), medir el tráfico y mostrar publicidad relevante. Puedes configurar tu navegador para bloquear o eliminar cookies; algunas funciones podrían verse afectadas.',
      ] },
      { heading: 'Publicidad y terceros', body: [
        'Para mantener el sitio gratuito mostramos publicidad mediante terceros. Estos servicios pueden usar cookies e identificadores para mostrar anuncios y medir su rendimiento:',
      ], bullets: [
        'Google AdSense: puede mostrar anuncios personalizados según tu actividad de navegación. Consulta las políticas de privacidad de Google para más detalle.',
        'Amazon Associates: algunos banners son enlaces de afiliado que te redirigen a Amazon. Amazon puede usar cookies para atribuir compras; las realizadas en su sitio se rigen por la privacidad de Amazon.',
        'Anunciantes de repuestos: los enlaces a sus tiendas o WhatsApp te llevan a sitios externos con sus propias políticas.',
      ] },
      { heading: 'Servicios externos de datos', body: [
        'El decodificador de VIN y los llamados a revisión (recalls) usan datos públicos de la NHTSA (EE.UU.). Al consultar un VIN, este se envía a ese servicio para obtener la información del vehículo. No vinculamos ese dato a tu identidad.',
      ] },
      { heading: 'Cómo usamos los datos', bullets: [
        'Para operar y mejorar la plataforma y su contenido.',
        'Para entender qué códigos y secciones son más útiles (estadísticas agregadas).',
        'Para responder tus mensajes de contacto.',
        'No vendemos tus datos personales a terceros.',
      ] },
      { heading: 'Tus derechos', body: [
        `Puedes solicitar información sobre los datos que pudiéramos tener tuyos, o pedir su eliminación, escribiéndonos a ${EMAIL}. También puedes gestionar las cookies y la personalización de anuncios desde la configuración de tu navegador y de tu cuenta de Google.`,
      ] },
      { heading: 'Menores de edad', body: [
        'CARWEB es un sitio de información técnica de uso general y no está dirigido específicamente a menores de edad ni recopila datos de ellos de forma intencional.',
      ] },
      { heading: 'Cambios y contacto', body: [
        `Podemos actualizar esta política; publicaremos la versión vigente en esta página con su fecha. Para cualquier duda sobre privacidad, escríbenos a ${EMAIL}.`,
      ] },
    ],
  },
  en: {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    subtitle: 'Your privacy matters. Here we explain what data is collected, how it is used and the role of third-party services.',
    updated: 'Last updated: June 19, 2026',
    back: 'Back to home',
    sections: [
      { heading: 'Controller and scope', body: [
        'This policy applies to the CARWEB site. It is meant to be clear and honest: CARWEB is primarily a reference site and does not require you to create an account or provide personal data to use it.',
      ] },
      { heading: 'What data do we collect?', bullets: [
        'Anonymous usage data: pages visited, code searches, device and browser type, for statistical purposes.',
        'Data you voluntarily send us: if you write to us by email or WhatsApp, we process the data you choose to share in order to reply.',
        'We do not request or store sensitive information to browse the site (no sign-up needed).',
      ] },
      { heading: 'Cookies and similar technologies', body: [
        'CARWEB and its providers may use cookies to remember your preferences (for example, the language), measure traffic and show relevant advertising. You can configure your browser to block or delete cookies; some features may be affected.',
      ] },
      { heading: 'Advertising and third parties', body: [
        'To keep the site free we display advertising through third parties. These services may use cookies and identifiers to serve ads and measure their performance:',
      ], bullets: [
        'Google AdSense: may show personalized ads based on your browsing activity. See Google\'s privacy policies for more detail.',
        'Amazon Associates: some banners are affiliate links that redirect you to Amazon. Amazon may use cookies to attribute purchases; purchases made on its site are governed by Amazon\'s privacy policy.',
        'Parts advertisers: links to their stores or WhatsApp take you to external sites with their own policies.',
      ] },
      { heading: 'External data services', body: [
        'The VIN decoder and safety recalls use public data from NHTSA (USA). When you look up a VIN, it is sent to that service to retrieve the vehicle information. We do not link that data to your identity.',
      ] },
      { heading: 'How we use data', bullets: [
        'To operate and improve the platform and its content.',
        'To understand which codes and sections are most useful (aggregate statistics).',
        'To respond to your contact messages.',
        'We do not sell your personal data to third parties.',
      ] },
      { heading: 'Your rights', body: [
        `You can request information about any data we might hold about you, or ask for its deletion, by writing to ${EMAIL}. You can also manage cookies and ad personalization from your browser settings and your Google account.`,
      ] },
      { heading: 'Minors', body: [
        'CARWEB is a general-purpose technical information site and is not specifically directed at minors, nor does it intentionally collect their data.',
      ] },
      { heading: 'Changes and contact', body: [
        `We may update this policy; we will publish the current version on this page with its date. For any privacy questions, write to us at ${EMAIL}.`,
      ] },
    ],
  },
};

export default async function PrivacidadPage() {
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
