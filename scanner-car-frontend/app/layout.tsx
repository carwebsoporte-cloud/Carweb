import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import AdBanners from '@/components/AdBanners';
import MotionProvider from '@/components/MotionProvider';
import { LocaleProvider } from '@/components/LocaleProvider';
import Analytics from '@/components/Analytics';
import { normalizeLocale } from '@/lib/i18n';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://carweb.app';

const META = {
  es: {
    title: 'CARWEB — Diagnóstico Automotriz Inteligente | Enciclopedia OBD2',
    description:
      'CARWEB es la enciclopedia profesional de códigos OBD2 en español. Encuentra cualquier código de falla, comprende la avería, identifica las causas y descubre la solución paso a paso.',
    ogTitle: 'CARWEB — Diagnóstico Automotriz Inteligente',
    ogDescription: 'La enciclopedia profesional de códigos OBD2 en español.',
    ogLocale: 'es_ES',
  },
  en: {
    title: 'CARWEB — Smart Automotive Diagnostics | OBD2 Encyclopedia',
    description:
      'CARWEB is the professional OBD2 trouble-code encyclopedia. Find any fault code, understand the failure, identify the causes and discover the step-by-step fix.',
    ogTitle: 'CARWEB — Smart Automotive Diagnostics',
    ogDescription: 'The professional OBD2 trouble-code encyclopedia.',
    ogLocale: 'en_US',
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale((await headers()).get('x-locale'));
  const m = META[locale];
  const url = locale === 'en' ? `${SITE_URL}/en` : SITE_URL;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: m.title, template: '%s | CARWEB' },
    description: m.description,
    authors: [{ name: 'CARWEB' }],
    creator: 'CARWEB',
    applicationName: 'CARWEB',
    robots: 'index, follow',
    alternates: {
      canonical: url,
      languages: { es: SITE_URL, en: `${SITE_URL}/en`, 'x-default': SITE_URL },
    },
    openGraph: {
      type: 'website',
      locale: m.ogLocale,
      siteName: 'CARWEB',
      title: m.ogTitle,
      description: m.ogDescription,
      url,
      images: [{ url: '/assets/carweb/logo-carweb.webp', width: 1200, height: 630, alt: 'CARWEB' }],
    },
    twitter: { card: 'summary_large_image', title: m.ogTitle, description: m.ogDescription, images: ['/assets/carweb/logo-carweb.webp'] },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = normalizeLocale((await headers()).get('x-locale'));
  const skipLabel = locale === 'en' ? 'Skip to content' : 'Saltar al contenido';

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} bg-cw-900 min-h-screen antialiased`}>
        <LocaleProvider locale={locale}>
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-neon focus:text-[#020617] focus:rounded-lg focus:font-semibold"
          >
            {skipLabel}
          </a>
          <MotionProvider>
            <Navbar />
            <main id="contenido" className="pt-16">
              {children}
            </main>
            <Footer locale={locale} />
            <WhatsAppButton />
            <AdBanners />
          </MotionProvider>
          <Analytics />
        </LocaleProvider>
      </body>
    </html>
  );
}
