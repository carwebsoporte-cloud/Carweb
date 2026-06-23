import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { normalizeLocale, withLocale, type Locale } from '@/lib/i18n';
import { getPostBySlug } from '@/lib/api';
import { localizePost, parseBlogBody, readingTime, formatDate } from '@/lib/blog';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://carweb.app';

async function getLocale(): Promise<Locale> {
  return normalizeLocale((await headers()).get('x-locale'));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const locale = await getLocale();
  const c = localizePost(post, locale);
  const en = locale === 'en';
  const esUrl = `${SITE_URL}/blog/${slug}`;
  const enUrl = `${SITE_URL}/en/blog/${slug}`;
  return {
    title: `${c.title} | CARWEB`,
    description: c.excerpt,
    alternates: { canonical: en ? enUrl : esUrl, languages: { es: esUrl, en: enUrl, 'x-default': esUrl } },
    openGraph: { type: 'article', title: c.title, description: c.excerpt, images: c.coverUrl ? [c.coverUrl] : [], url: en ? enUrl : esUrl },
  };
}

const UI = {
  es: { home: 'Inicio', backToBlog: 'Volver al blog', searchCta: '¿Tienes un código de falla?', searchBtn: 'Buscar código OBD2', disclaimer: 'Contenido de referencia. Para reparaciones, consulta siempre a un mecánico certificado.' },
  en: { home: 'Home', backToBlog: 'Back to blog', searchCta: 'Do you have a fault code?', searchBtn: 'Search OBD2 code', disclaimer: 'Reference content. For repairs, always consult a certified mechanic.' },
} as const;

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const locale = await getLocale();
  const t = UI[locale];
  const c = localizePost(post, locale);
  const blocks = parseBlogBody(c.body);
  const L = (href: string) => withLocale(href, locale);

  // JSON-LD para SEO (artículo).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: c.title,
    description: c.excerpt,
    datePublished: post.date,
    dateModified: post.updatedAt || post.date,
    image: c.coverUrl ? `${SITE_URL}${c.coverUrl}` : undefined,
    author: { '@type': 'Organization', name: 'CARWEB' },
    publisher: { '@type': 'Organization', name: 'CARWEB', logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/carweb/logo-carweb.webp` } },
    mainEntityOfPage: `${SITE_URL}${locale === 'en' ? '/en' : ''}/blog/${slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <div className="relative border-b border-neon/15 bg-[#040a18]/60">
        <div className="absolute inset-0 cw-grid cw-grid-fade opacity-30" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm flex-wrap" aria-label="Breadcrumb">
            <Link href={L('/')} className="text-slate-400 hover:text-neon transition-colors">{t.home}</Link>
            <span className="text-slate-600">/</span>
            <Link href={L('/blog')} className="text-slate-400 hover:text-neon transition-colors">Blog</Link>
            <span className="text-slate-600">/</span>
            <span className="text-neon font-semibold truncate max-w-[200px]">{c.title}</span>
          </nav>
        </div>
      </div>

      <article className="relative py-12">
        <div className="absolute inset-0 cw-radial opacity-60 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <span className="px-2.5 py-1 rounded-full font-bold bg-neon/10 text-neon border border-neon/20">{c.tag}</span>
            <span>{formatDate(c.date, locale)}</span>
            <span>·</span>
            <span>{readingTime(c.body)}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 leading-tight">{c.title}</h1>
          <p className="text-slate-300 text-lg leading-relaxed border-l-4 border-neon/50 pl-4 mb-8">{c.excerpt}</p>

          {c.coverUrl && (
            <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden border border-white/10 bg-[#040a18] mb-10">
              <Image src={c.coverUrl} alt={c.title} fill sizes="(max-width: 768px) 100vw, 768px" unoptimized className="object-cover" />
            </div>
          )}

          {/* Cuerpo del artículo */}
          <div className="space-y-5">
            {blocks.map((block, i) => {
              if (block.type === 'h2') return <h2 key={i} className="text-2xl font-bold text-white pt-4">{block.text}</h2>;
              if (block.type === 'ul') return (
                <ul key={i} className="space-y-2.5">
                  {block.items.map((it, k) => (
                    <li key={k} className="flex items-start gap-3 text-slate-300">
                      <span className="w-1.5 h-1.5 mt-2.5 rounded-full bg-neon shrink-0" />
                      <span className="leading-relaxed">{it}</span>
                    </li>
                  ))}
                </ul>
              );
              return <p key={i} className="text-slate-300 text-lg leading-relaxed">{block.text}</p>;
            })}
          </div>

          <p className="text-slate-600 text-xs mt-10 border-t border-white/5 pt-5">{t.disclaimer}</p>

          {/* CTA buscador */}
          <div className="glass-strong rounded-2xl p-6 mt-8 text-center">
            <h3 className="text-white font-bold text-lg mb-4">{t.searchCta}</h3>
            <Link href={L('/buscar')} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#00a3c4] text-[#020617] font-bold rounded-xl hover:shadow-lg transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              {t.searchBtn}
            </Link>
          </div>

          {/* Back */}
          <div className="mt-10">
            <Link href={L('/blog')} className="inline-flex items-center text-slate-400 hover:text-neon transition-colors text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              {t.backToBlog}
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
