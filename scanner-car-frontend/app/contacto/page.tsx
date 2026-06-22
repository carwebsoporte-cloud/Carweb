import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { normalizeLocale, withLocale, type Locale } from '@/lib/i18n';
import { WHATSAPP_URL, WHATSAPP_DISPLAY, EMAIL, mailto } from '@/lib/contact';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://carweb.app';

async function getLocale(): Promise<Locale> {
  return normalizeLocale((await headers()).get('x-locale'));
}

export async function generateMetadata(): Promise<Metadata> {
  const en = (await getLocale()) === 'en';
  const esUrl = `${SITE_URL}/contacto`;
  const enUrl = `${SITE_URL}/en/contacto`;
  return {
    title: en ? 'Contact | CARWEB' : 'Contacto | CARWEB',
    description: en
      ? 'Get in touch with the CARWEB team by WhatsApp or email. We are here to help with OBD2 questions, advertising and suggestions.'
      : 'Contáctanos por WhatsApp o correo. El equipo de CARWEB te ayuda con dudas sobre códigos OBD2, publicidad y sugerencias.',
    alternates: { canonical: en ? enUrl : esUrl, languages: { es: esUrl, en: enUrl, 'x-default': esUrl } },
  };
}

const C = {
  es: {
    eyebrow: 'Contacto',
    title: 'Hablemos',
    subtitle: 'Estamos para ayudarte. Escríbenos por el canal que prefieras y te respondemos lo antes posible.',
    waTitle: 'WhatsApp', waDesc: 'La forma más rápida de contactarnos. Respuesta en horario hábil.', waBtn: 'Escribir por WhatsApp',
    mailTitle: 'Correo electrónico', mailDesc: 'Ideal para consultas detalladas, publicidad o reportar un error.', mailBtn: 'Enviar correo',
    reasonsTitle: '¿En qué te podemos ayudar?',
    reasons: [
      { t: 'Dudas sobre un código OBD2', d: 'Si no encuentras un código o la información no es clara, cuéntanos y la revisamos.' },
      { t: 'Publicidad y alianzas', d: '¿Vendes repuestos o herramientas? Conoce cómo anunciarte en CARWEB.' },
      { t: 'Reportar un error', d: 'Si algo no funciona o un dato parece incorrecto, avísanos para corregirlo.' },
      { t: 'Sugerencias', d: 'Ideas para mejorar la plataforma o contenido que te gustaría ver.' },
    ],
    hoursTitle: 'Horario de atención',
    hours: 'Lunes a sábado, 8:00 a.m. – 6:00 p.m. (hora de Colombia). Los mensajes fuera de horario se responden el siguiente día hábil.',
    advertiseLead: '¿Quieres anunciar tu negocio?', advertiseLink: 'Mira las opciones para anunciarte →',
    back: 'Volver al inicio',
  },
  en: {
    eyebrow: 'Contact',
    title: "Let's talk",
    subtitle: 'We are here to help. Reach out through the channel you prefer and we will get back to you as soon as possible.',
    waTitle: 'WhatsApp', waDesc: 'The fastest way to reach us. Replies during business hours.', waBtn: 'Chat on WhatsApp',
    mailTitle: 'Email', mailDesc: 'Best for detailed questions, advertising or reporting an issue.', mailBtn: 'Send email',
    reasonsTitle: 'How can we help?',
    reasons: [
      { t: 'Questions about an OBD2 code', d: "If you can't find a code or the information is unclear, tell us and we'll review it." },
      { t: 'Advertising and partnerships', d: 'Do you sell parts or tools? Learn how to advertise on CARWEB.' },
      { t: 'Report an error', d: 'If something is broken or a detail looks wrong, let us know so we can fix it.' },
      { t: 'Suggestions', d: 'Ideas to improve the platform or content you would like to see.' },
    ],
    hoursTitle: 'Support hours',
    hours: 'Monday to Saturday, 8:00 a.m. – 6:00 p.m. (Colombia time). Messages outside these hours are answered the next business day.',
    advertiseLead: 'Want to advertise your business?', advertiseLink: 'See advertising options →',
    back: 'Back to home',
  },
} as const;

export default async function ContactoPage() {
  const locale = await getLocale();
  const t = C[locale];
  const L = (href: string) => withLocale(href, locale);

  return (
    <>
      {/* Hero */}
      <section className="relative border-b border-neon/15 bg-[#040a18]/60 overflow-hidden">
        <div className="absolute inset-0 cw-grid cw-grid-fade opacity-30" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-neon text-xs font-bold uppercase tracking-wider bg-neon/10 border border-neon/20 mb-5">
            {t.eyebrow}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">{t.title}</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">{t.subtitle}</p>
        </div>
      </section>

      <section className="relative py-14">
        <div className="absolute inset-0 cw-radial opacity-60 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          {/* Canales de contacto */}
          <div className="grid sm:grid-cols-2 gap-5">
            {/* WhatsApp */}
            <div className="glass-strong rounded-2xl p-7 flex flex-col" style={{ border: '1px solid #25D36633' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: '#25D36622' }}>
                <svg className="w-6 h-6" fill="#25D366" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.437-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.945c0 2.096.549 4.142 1.595 5.945L0 24l6.305-1.654a11.95 11.95 0 0 0 5.71 1.454h.005c6.585 0 11.946-5.359 11.949-11.945a11.9 11.9 0 0 0-3.503-8.461" /></svg>
              </div>
              <h2 className="text-white font-bold text-lg mb-1">{t.waTitle}</h2>
              <p className="text-slate-400 text-sm mb-4 flex-1">{t.waDesc}</p>
              <p className="text-white font-mono font-semibold mb-4">{WHATSAPP_DISPLAY}</p>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all hover:brightness-110" style={{ background: '#25D366' }}>
                {t.waBtn}
              </a>
            </div>

            {/* Email */}
            <div className="glass-strong rounded-2xl p-7 flex flex-col" style={{ border: '1px solid #00d4ff33' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: '#00d4ff22' }}>
                <svg className="w-6 h-6" fill="none" stroke="#00d4ff" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h2 className="text-white font-bold text-lg mb-1">{t.mailTitle}</h2>
              <p className="text-slate-400 text-sm mb-4 flex-1">{t.mailDesc}</p>
              <p className="text-white font-mono font-semibold mb-4 break-all">{EMAIL}</p>
              <a href={mailto('Consulta desde CARWEB')} className="inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[#020617] transition-all hover:brightness-110" style={{ background: 'linear-gradient(to right, #00d4ff, #00a3c4)' }}>
                {t.mailBtn}
              </a>
            </div>
          </div>

          {/* Motivos */}
          <div className="glass rounded-2xl p-7">
            <h2 className="text-white font-bold text-xl mb-5">{t.reasonsTitle}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {t.reasons.map((r) => (
                <div key={r.t} className="flex gap-3">
                  <span className="w-2 h-2 mt-2 rounded-full bg-neon shrink-0" />
                  <div>
                    <h3 className="text-white font-semibold text-sm">{r.t}</h3>
                    <p className="text-slate-400 text-sm">{r.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Horario */}
          <div className="glass rounded-2xl p-7">
            <h2 className="text-white font-bold text-xl mb-2">{t.hoursTitle}</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{t.hours}</p>
          </div>

          {/* CTA anunciarse */}
          <p className="text-center text-slate-400 text-sm">
            {t.advertiseLead}{' '}
            <Link href={L('/anunciarse')} className="text-neon hover:underline font-semibold">{t.advertiseLink}</Link>
          </p>
        </div>
      </section>

      {/* Back */}
      <div className="pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={L('/')} className="inline-flex items-center text-slate-400 hover:text-neon transition-colors text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t.back}
          </Link>
        </div>
      </div>
    </>
  );
}
