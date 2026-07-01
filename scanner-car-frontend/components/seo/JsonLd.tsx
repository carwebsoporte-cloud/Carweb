import {
  SITE_URL,
  SITE_NAME,
  SITE_LEGAL_NAME,
  LOGO_URL,
  SITE_DESCRIPTION,
  SOCIAL_LINKS,
  CONTACT,
} from '@/lib/site';

// IDs estables para enlazar entidades entre sí (entity graph → mejor GEO).
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

function jsonLd(schema: object) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function WebSiteJsonLd({ locale }: { locale: 'es' | 'en' }) {
  const searchUrl = locale === 'en' ? `${SITE_URL}/en/buscar` : `${SITE_URL}/buscar`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: locale === 'en' ? `${SITE_URL}/en` : SITE_URL,
    description: SITE_DESCRIPTION[locale],
    inLanguage: ['es', 'en'],
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${searchUrl}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
  return jsonLd(schema);
}

export function OrganizationJsonLd({ locale = 'es' }: { locale?: 'es' | 'en' } = {}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    legalName: SITE_LEGAL_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: LOGO_URL, width: 512, height: 512 },
    image: LOGO_URL,
    description: SITE_DESCRIPTION[locale],
    knowsLanguage: CONTACT.languages,
    areaServed: CONTACT.areaServed.map((c) => ({ '@type': 'Country', name: c })),
    contactPoint: {
      '@type': 'ContactPoint',
      email: CONTACT.email,
      telephone: CONTACT.phone,
      contactType: 'customer support',
      availableLanguage: ['Spanish', 'English'],
    },
    ...(SOCIAL_LINKS.length ? { sameAs: SOCIAL_LINKS } : {}),
  };
  return jsonLd(schema);
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { position: number; name: string; url: string }[];
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      item: item.url,
    })),
  };
  return jsonLd(schema);
}

export function CollectionPageJsonLd({
  name,
  description,
  url,
  locale = 'es',
}: {
  name: string;
  description: string;
  url: string;
  locale?: 'es' | 'en';
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    inLanguage: locale,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: {
      '@type': 'ItemList',
      name,
    },
  };
  return jsonLd(schema);
}

export function ArticleJsonLd({
  headline,
  description,
  url,
  datePublished,
  dateModified,
  image,
}: {
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    ...(image ? { image } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : datePublished ? { dateModified: datePublished } : {}),
    publisher: { '@id': ORG_ID },
  };
  return jsonLd(schema);
}

/** FAQPage reutilizable. Pasa pares pregunta/respuesta en texto plano. */
export function FaqJsonLd({ items }: { items: { q: string; a: string }[] }) {
  if (!items.length) return null;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  return jsonLd(schema);
}

/** ContactPage para /contacto. */
export function ContactPageJsonLd({ url, name, locale = 'es' }: { url: string; name: string; locale?: 'es' | 'en' }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name,
    url,
    inLanguage: locale,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
    mainEntity: {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: SITE_NAME,
      email: CONTACT.email,
      telephone: CONTACT.phone,
    },
  };
  return jsonLd(schema);
}
