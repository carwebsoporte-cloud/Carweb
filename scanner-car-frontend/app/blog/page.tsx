import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { headers } from 'next/headers';
import { normalizeLocale, withLocale, type Locale } from '@/lib/i18n';
import { getPublishedPosts } from '@/lib/api';
import { localizePost, readingTime, formatDate } from '@/lib/blog';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.carweb.com.co';

async function getLocale(): Promise<Locale> {
  return normalizeLocale((await headers()).get('x-locale'));
}

export async function generateMetadata(): Promise<Metadata> {
  const en = (await getLocale()) === 'en';
  const esUrl = `${SITE_URL}/blog`;
  const enUrl = `${SITE_URL}/en/blog`;
  return {
    title: en ? 'Blog | CARWEB — OBD2 Diagnostics' : 'Blog | CARWEB — Diagnóstico OBD2',
    description: en
      ? 'Articles, guides and tips about OBD2 fault codes, automotive diagnostics and vehicle maintenance.'
      : 'Artículos, guías y consejos sobre códigos OBD2, diagnóstico automotriz y mantenimiento del vehículo.',
    alternates: { canonical: en ? enUrl : esUrl, languages: { es: esUrl, en: enUrl, 'x-default': esUrl } },
  };
}

const UI = {
  es: { eyebrow: 'Blog', title: 'Aprende sobre diagnóstico', subtitle: 'Artículos, guías y consejos para entender los códigos OBD2 y cuidar tu vehículo.', read: 'Leer artículo', back: 'Volver al inicio', empty: 'Aún no hay artículos publicados. Vuelve pronto.' },
  en: { eyebrow: 'Blog', title: 'Learn about diagnostics', subtitle: 'Articles, guides and tips to understand OBD2 codes and take care of your vehicle.', read: 'Read article', back: 'Back to home', empty: 'No articles published yet. Check back soon.' },
} as const;

export default async function BlogPage() {
  const locale = await getLocale();
  const t = UI[locale];
  const L = (href: string) => withLocale(href, locale);
  const posts = (await getPublishedPosts()).map((p) => localizePost(p, locale));

  return (
    <>
      {/* Hero */}
      <section className="relative border-b border-neon/15 bg-[#040a18]/60 overflow-hidden">
        <div className="absolute inset-0 cw-grid cw-grid-fade opacity-30" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-neon text-xs font-bold uppercase tracking-wider bg-neon/10 border border-neon/20 mb-5">
            {t.eyebrow}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">{t.title}</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">{t.subtitle}</p>
        </div>
      </section>

      <section className="relative py-14">
        <div className="absolute inset-0 cw-radial opacity-60 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center text-slate-400">{t.empty}</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link key={post.slug} href={L(`/blog/${post.slug}`)} className="group glass rounded-2xl overflow-hidden flex flex-col hover:border-neon/30 transition-colors border border-white/10">
                  <div className="relative h-40 overflow-hidden bg-[#040a18]">
                    {post.coverUrl && <Image src={post.coverUrl} alt={post.title} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-300" />}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#040a18]/80 text-neon border border-neon/30">{post.tag}</span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <span>{formatDate(post.date, locale)}</span>
                      <span>·</span>
                      <span>{readingTime(post.body)}</span>
                    </div>
                    <h2 className="text-white font-bold text-lg leading-snug mb-2 group-hover:text-neon transition-colors">{post.title}</h2>
                    <p className="text-slate-400 text-sm leading-relaxed flex-1">{post.excerpt}</p>
                    <span className="inline-flex items-center gap-1 text-neon text-sm font-semibold mt-4">
                      {t.read}
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Back */}
      <div className="pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={L('/')} className="inline-flex items-center text-slate-400 hover:text-neon transition-colors text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t.back}
          </Link>
        </div>
      </div>
    </>
  );
}
