import { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { normalizeLocale, withLocale, esToEnPath, type Locale } from '@/lib/i18n';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://carweb.app';
const EMAIL = 'jorge.ramtroz1989@gmail.com';

async function getLocale(): Promise<Locale> {
  return normalizeLocale((await headers()).get('x-locale'));
}

export async function generateMetadata(): Promise<Metadata> {
  const en = (await getLocale()) === 'en';
  const esUrl = `${SITE_URL}/anunciarse`;
  const enPath = esToEnPath('/anunciarse');
  const enUrl = `${SITE_URL}/en${enPath}`;
  const title = en ? 'Advertise as a Parts Seller | CARWEB' : 'Anúnciate como Vendedor de Repuestos | CARWEB';
  const description = en
    ? 'Reach drivers who already know exactly which part they need. List your store on CARWEB and increase your sales.'
    : 'Llega a conductores que ya saben exactamente qué repuesto necesitan. Publica tu tienda en CARWEB y aumenta tus ventas.';
  return {
    title,
    description,
    alternates: { canonical: en ? enUrl : esUrl, languages: { es: esUrl, en: enUrl, 'x-default': esUrl } },
  };
}

const C = {
  es: {
    eyebrow: 'Programa para Vendedores de Repuestos',
    titleTop: 'Llega al cliente', titleBottom: 'en el momento exacto',
    heroBody: 'Los usuarios de CARWEB ya escanearon su auto y saben el código de falla. Cuando abren la página de ese código, ya están listos para comprar el repuesto. Tu negocio aparece justo ahí.',
    seePlans: 'Ver planes y precios', contactEmail: 'Contactar por email',
    stats: [
      { value: '181+', label: 'Códigos OBD2 activos', sub: 'Creciendo a 580+' },
      { value: '4', label: 'Categorías cubiertas', sub: 'P · B · C · U' },
      { value: '100%', label: 'Usuarios con intención de compra', sub: 'Ya saben qué repuesto necesitan' },
      { value: '0', label: 'Competidores en tu espacio', sub: 'Hasta agotar lugares por código' },
    ],
    hiwTitle: '¿Cómo funciona?', hiwSub: 'Publicidad de alta intención — no interrumpes, eres la solución',
    hiw: [
      { title: 'El conductor escanea su auto', desc: 'Obtiene un código de falla (ej: P0420) y lo busca en CARWEB para entender qué necesita reparar.' },
      { title: 'Ve tu negocio en el sidebar', desc: 'En la página de ese código aparece tu espacio: logo, nombre y enlace directo. El usuario ya sabe que necesita el sensor — tú eres su opción.' },
      { title: 'El cliente llega a tu tienda', desc: 'Con un solo clic va directo a tu catálogo o WhatsApp. Sin intermediarios. Sin comisión por venta.' },
    ],
    plansTitle: 'Planes y Precios', plansSub: 'Sin contrato de permanencia — cancela cuando quieras',
    period: '/mes COP', mostPopular: 'MÁS POPULAR', hire: 'Contratar plan',
    customLead: '¿Tienes un negocio grande o necesitas algo personalizado? ', customLink: 'Escríbenos y armamos un plan a tu medida.',
    plans: [
      { id: 'basico', name: 'Básico', price: '$29.000', description: 'Para talleres y vendedores pequeños que quieren empezar a crecer online.',
        features: ['Espacio en 1 categoría (P, B, C o U)', 'Hasta 50 páginas de códigos', 'Logo + nombre de tu negocio', 'Enlace directo a tu tienda o WhatsApp', 'Badge "Vendedor Verificado"'],
        notIncluded: ['Múltiples categorías', 'Espacio destacado (posición #1)', 'Soporte prioritario'] },
      { id: 'pro', name: 'Pro', price: '$79.000', description: 'Para distribuidores con catálogo amplio que quieren visibilidad en toda la plataforma.',
        features: ['Espacio en todas las categorías (P, B, C, U)', 'Páginas ilimitadas de códigos', 'Logo + nombre + descripción corta', 'Enlace directo a tu tienda o WhatsApp', 'Badge dorado "Proveedor Verificado Pro"', 'Posición destacada (top del espacio)', 'Soporte prioritario por WhatsApp'],
        notIncluded: ['Integración de catálogo de productos'] },
      { id: 'premium', name: 'Premium', price: '$149.000', description: 'Para cadenas de distribución que quieren máxima exposición y personalización.',
        features: ['Todo lo incluido en Pro', 'Integración de catálogo (hasta 20 productos)', 'Espacio exclusivo por código — sin competidores', 'Banner personalizado con tu marca', 'Reporte mensual de clics e impresiones', 'Gestor de cuenta dedicado'],
        notIncluded: [] },
    ],
    whyTitle: '¿Por qué anunciarse en CARWEB?', whySub: 'No es publicidad masiva — es publicidad quirúrgica',
    why: [
      { title: 'Intención de compra máxima', desc: 'El usuario ya tiene el código de falla en mano. No está explorando — está buscando dónde comprar el repuesto ahora mismo.' },
      { title: 'Cero comisión por venta', desc: 'Pagas la suscripción mensual fija. No importa cuánto vendas — no te cobramos porcentaje ni comisión.' },
      { title: 'Audiencia sin intermediarios', desc: 'Enlace directo a tu tienda, catálogo o WhatsApp. El cliente llega a ti sin pasar por marketplace ni pagar comisión.' },
      { title: 'Activación en 24 horas', desc: 'Sin procesos largos. Confirmas el pago, nos mandas tu logo y enlace, y en menos de un día hábil tu espacio está activo.' },
    ],
    faqTitle: 'Preguntas Frecuentes',
    faqs: [
      { q: '¿Cómo aparece mi negocio en las páginas de códigos?', a: 'Tu logo, nombre y enlace aparecen en el sidebar de cada página de código relevante a tu categoría. Los usuarios que llegaron buscando ese código de falla ven tu anuncio en el momento exacto en que necesitan el repuesto.' },
      { q: '¿Puedo elegir en qué códigos específicos aparecer?', a: 'En los planes Básico y Pro apareces en todos los códigos de tu categoría. En el plan Premium puedes seleccionar códigos específicos y tener exclusividad en esas páginas.' },
      { q: '¿Cuánto tiempo tarda en activarse mi espacio?', a: 'Una vez confirmado el pago, tu espacio se activa en menos de 24 horas hábiles.' },
      { q: '¿Puedo cancelar cuando quiera?', a: 'Sí. Las suscripciones son mensuales sin contrato de permanencia. Cancelas antes de tu próximo ciclo y no se genera ningún cargo adicional.' },
      { q: '¿Qué necesito para registrarme?', a: 'Solo el nombre de tu negocio, logo (PNG/SVG), enlace a tu tienda o WhatsApp, y el pago mensual. Nosotros nos encargamos de configurar todo.' },
    ],
    ctaTitle: '¿Listo para empezar?', ctaBody1: 'Los primeros ', ctaBodyBold: '10 vendedores', ctaBody2: ' que se registren obtienen el primer mes gratis. Los espacios son limitados por categoría.',
    chooseplan: 'Elegir mi plan', haveQuestion: 'Tengo una pregunta', back: 'Volver al buscador',
  },
  en: {
    eyebrow: 'Parts Sellers Program',
    titleTop: 'Reach the customer', titleBottom: 'at the exact moment',
    heroBody: 'CARWEB users have already scanned their car and know the fault code. When they open that code page, they are already ready to buy the part. Your business appears right there.',
    seePlans: 'See plans and pricing', contactEmail: 'Contact by email',
    stats: [
      { value: '181+', label: 'Active OBD2 codes', sub: 'Growing to 580+' },
      { value: '4', label: 'Categories covered', sub: 'P · B · C · U' },
      { value: '100%', label: 'Users with purchase intent', sub: 'They already know which part they need' },
      { value: '0', label: 'Competitors in your space', sub: 'Until slots per code run out' },
    ],
    hiwTitle: 'How does it work?', hiwSub: 'High-intent advertising — you do not interrupt, you are the solution',
    hiw: [
      { title: 'The driver scans their car', desc: 'They get a fault code (e.g. P0420) and search it on CARWEB to understand what they need to fix.' },
      { title: 'They see your business in the sidebar', desc: 'On that code page your space appears: logo, name and direct link. The user already knows they need the sensor — you are their option.' },
      { title: 'The customer reaches your store', desc: 'With a single click they go straight to your catalog or WhatsApp. No middlemen. No sales commission.' },
    ],
    plansTitle: 'Plans and Pricing', plansSub: 'No lock-in contract — cancel anytime',
    period: '/mo COP', mostPopular: 'MOST POPULAR', hire: 'Get the',
    customLead: 'Do you have a large business or need something custom? ', customLink: 'Write to us and we will build a plan that fits.',
    plans: [
      { id: 'basico', name: 'Basic', price: '$29,000', description: 'For small shops and sellers who want to start growing online.',
        features: ['Space in 1 category (P, B, C or U)', 'Up to 50 code pages', 'Your business logo + name', 'Direct link to your store or WhatsApp', '"Verified Seller" badge'],
        notIncluded: ['Multiple categories', 'Featured space (position #1)', 'Priority support'] },
      { id: 'pro', name: 'Pro', price: '$79,000', description: 'For distributors with a broad catalog who want visibility across the whole platform.',
        features: ['Space in all categories (P, B, C, U)', 'Unlimited code pages', 'Logo + name + short description', 'Direct link to your store or WhatsApp', 'Gold "Verified Pro Supplier" badge', 'Featured position (top of the space)', 'Priority WhatsApp support'],
        notIncluded: ['Product catalog integration'] },
      { id: 'premium', name: 'Premium', price: '$149,000', description: 'For distribution chains that want maximum exposure and customization.',
        features: ['Everything in Pro', 'Catalog integration (up to 20 products)', 'Exclusive space per code — no competitors', 'Custom banner with your brand', 'Monthly clicks and impressions report', 'Dedicated account manager'],
        notIncluded: [] },
    ],
    whyTitle: 'Why advertise on CARWEB?', whySub: 'It is not mass advertising — it is surgical advertising',
    why: [
      { title: 'Maximum purchase intent', desc: 'The user already has the fault code in hand. They are not browsing — they are looking for where to buy the part right now.' },
      { title: 'Zero sales commission', desc: 'You pay a fixed monthly subscription. No matter how much you sell — we charge no percentage or commission.' },
      { title: 'Audience without middlemen', desc: 'Direct link to your store, catalog or WhatsApp. The customer reaches you without going through a marketplace or paying commission.' },
      { title: 'Activation in 24 hours', desc: 'No long processes. You confirm payment, send us your logo and link, and in less than one business day your space is live.' },
    ],
    faqTitle: 'Frequently Asked Questions',
    faqs: [
      { q: 'How does my business appear on the code pages?', a: 'Your logo, name and link appear in the sidebar of every code page relevant to your category. Users who arrived searching for that fault code see your ad at the exact moment they need the part.' },
      { q: 'Can I choose which specific codes to appear on?', a: 'On the Basic and Pro plans you appear on all codes in your category. On the Premium plan you can select specific codes and have exclusivity on those pages.' },
      { q: 'How long does it take to activate my space?', a: 'Once payment is confirmed, your space is activated in less than 24 business hours.' },
      { q: 'Can I cancel anytime?', a: 'Yes. Subscriptions are monthly with no lock-in contract. Cancel before your next cycle and no additional charge is made.' },
      { q: 'What do I need to sign up?', a: 'Just your business name, logo (PNG/SVG), a link to your store or WhatsApp, and the monthly payment. We take care of setting everything up.' },
    ],
    ctaTitle: 'Ready to start?', ctaBody1: 'The first ', ctaBodyBold: '10 sellers', ctaBody2: ' who sign up get the first month free. Spaces are limited per category.',
    chooseplan: 'Choose my plan', haveQuestion: 'I have a question', back: 'Back to search',
  },
} as const;

const PLAN_STYLE: Record<string, { color: string; badgeColor: string; buttonClass: string; highlight?: boolean }> = {
  basico: { color: 'border-slate-600/50', badgeColor: 'bg-slate-700/60 text-slate-300', buttonClass: 'bg-slate-700 hover:bg-slate-600 text-white' },
  pro: { color: 'border-sky-500/50', badgeColor: 'bg-sky-500/20 text-sky-300', buttonClass: 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white shadow-lg shadow-sky-500/25', highlight: true },
  premium: { color: 'border-yellow-500/40', badgeColor: 'bg-yellow-500/20 text-yellow-300', buttonClass: 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white shadow-lg shadow-yellow-500/20' },
};

const WHY_STYLE = [
  { icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
];

const HIW_STYLE = [
  { wrap: 'bg-sky-500/20 border-sky-500/30', icon: 'text-sky-400', path: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
  { wrap: 'bg-yellow-500/20 border-yellow-500/30', icon: 'text-yellow-400', path: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
  { wrap: 'bg-green-500/20 border-green-500/30', icon: 'text-green-400', path: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
];

export default async function AnunciarePage() {
  const locale = await getLocale();
  const t = C[locale];
  const L = (href: string) => withLocale(href, locale);
  const mailto = (subject: string) => `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-300 text-sm font-medium mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {t.eyebrow}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">{t.titleTop}</span>
            <br />
            <span className="bg-gradient-to-r from-sky-400 to-yellow-400 bg-clip-text text-transparent">{t.titleBottom}</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">{t.heroBody}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#planes" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/25">
              {t.seePlans}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </a>
            <a href={mailto('Quiero anunciarme en CARWEB')} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-slate-300 font-semibold rounded-xl transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              {t.contactEmail}
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-slate-800/30 border-y border-slate-700/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {t.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-sky-400 to-yellow-400 bg-clip-text text-transparent mb-1">{stat.value}</div>
                <p className="text-white font-semibold text-sm mb-0.5">{stat.label}</p>
                <p className="text-slate-500 text-xs">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">{t.hiwTitle}</h2>
            <p className="text-slate-400">{t.hiwSub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.hiw.map((item, i) => (
              <div key={i} className="relative">
                <div className={`w-14 h-14 border rounded-2xl flex items-center justify-center mb-5 ${HIW_STYLE[i].wrap}`}>
                  <svg className={`w-7 h-7 ${HIW_STYLE[i].icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={HIW_STYLE[i].path} />
                  </svg>
                </div>
                <span className="absolute top-0 right-0 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-slate-400 text-sm font-bold">{i + 1}</span>
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planes */}
      <section id="planes" className="py-20 bg-slate-800/30 border-y border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">{t.plansTitle}</h2>
            <p className="text-slate-400">{t.plansSub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {t.plans.map((plan) => {
              const st = PLAN_STYLE[plan.id];
              return (
                <div key={plan.id} className={`relative bg-slate-800/60 backdrop-blur-sm rounded-2xl border-2 p-7 flex flex-col ${st.color} ${st.highlight ? 'shadow-xl shadow-sky-500/10' : ''}`}>
                  {st.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-sky-500 to-sky-600 rounded-full text-white text-xs font-bold shadow-lg shadow-sky-500/30 whitespace-nowrap">
                      {t.mostPopular}
                    </div>
                  )}
                  <div className={`self-start px-3 py-1 rounded-full text-xs font-semibold mb-4 ${st.badgeColor}`}>{plan.name}</div>
                  <div className="mb-2">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-slate-400 text-sm">{t.period}</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">{plan.description}</p>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        <span className="text-slate-200">{f}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <svg className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        <span className="text-slate-500 line-through">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a href={mailto(`Quiero el plan ${plan.name} en CARWEB`)} className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 text-center block ${st.buttonClass}`}>
                    {t.hire} {plan.name}
                  </a>
                </div>
              );
            })}
          </div>
          <p className="text-center text-slate-500 text-sm mt-8">
            {t.customLead}
            <a href={mailto('Plan personalizado CARWEB')} className="text-sky-400 hover:underline">{t.customLink}</a>
          </p>
        </div>
      </section>

      {/* Por qué CARWEB */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">{t.whyTitle}</h2>
            <p className="text-slate-400">{t.whySub}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {t.why.map((item, i) => (
              <div key={i} className="flex gap-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${WHY_STYLE[i].color}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={WHY_STYLE[i].icon} /></svg>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-slate-800/30 border-t border-slate-700/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">{t.faqTitle}</h2>
          </div>
          <div className="space-y-4">
            {t.faqs.map((faq) => (
              <div key={faq.q} className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-6">
                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-sky-500/10 to-yellow-500/10 rounded-3xl border border-sky-500/20 p-12">
            <h2 className="text-3xl font-bold text-white mb-4">{t.ctaTitle}</h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              {t.ctaBody1}<strong className="text-white">{t.ctaBodyBold}</strong>{t.ctaBody2}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#planes" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/25">
                {t.chooseplan}
              </a>
              <a href={mailto('Consulta sobre publicidad en CARWEB')} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 text-slate-300 font-semibold rounded-xl transition-all">
                {t.haveQuestion}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Back */}
      <div className="pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={L('/')} className="inline-flex items-center text-slate-400 hover:text-sky-400 transition-colors text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t.back}
          </Link>
        </div>
      </div>
    </>
  );
}
