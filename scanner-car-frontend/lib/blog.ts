// Helpers de presentación del blog. El contenido vive en la base de datos y se
// obtiene vía lib/api (getPublishedPosts / getPostBySlug). Aquí solo está la
// lógica para localizar, parsear el cuerpo y formatear fecha/tiempo de lectura.

import type { Locale } from './i18n';
import type { BlogPost } from './api';

/** Bloques que componen el cuerpo de un artículo ya parseado. */
export type BlogBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'ul'; items: string[] };

/** Versión de un artículo resuelta para un idioma. */
export interface LocalizedPost {
  slug: string;
  tag: string;
  coverUrl: string;
  date: string;
  title: string;
  excerpt: string;
  body: string;
}

/** Elige el contenido del idioma pedido; si falta el inglés, usa el español. */
export function localizePost(p: BlogPost, locale: Locale): LocalizedPost {
  const useEn = locale === 'en' && !!p.titleEn && p.titleEn.trim().length > 0;
  return {
    slug: p.slug,
    tag: p.tag,
    coverUrl: p.coverUrl,
    date: p.date,
    title: useEn ? (p.titleEn as string) : p.titleEs,
    excerpt: useEn ? (p.excerptEn || p.excerptEs) : p.excerptEs,
    body: useEn ? (p.bodyEn || p.bodyEs) : p.bodyEs,
  };
}

/** Convierte el texto con formato ligero en bloques renderizables.
 *  Reglas: "## " => subtítulo, "- " => viñeta, línea en blanco => nuevo párrafo. */
export function parseBlogBody(text: string): BlogBlock[] {
  const lines = (text || '').replace(/\r\n/g, '\n').split('\n');
  const blocks: BlogBlock[] = [];
  let para: string[] = [];
  let list: string[] = [];

  const flushPara = () => {
    if (para.length) { blocks.push({ type: 'p', text: para.join(' ').trim() }); para = []; }
  };
  const flushList = () => {
    if (list.length) { blocks.push({ type: 'ul', items: list.slice() }); list = []; }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushList(); flushPara(); continue; }
    if (line.startsWith('## ')) { flushList(); flushPara(); blocks.push({ type: 'h2', text: line.slice(3).trim() }); continue; }
    if (line.startsWith('- ')) { flushPara(); list.push(line.slice(2).trim()); continue; }
    flushList();
    para.push(line);
  }
  flushList();
  flushPara();
  return blocks;
}

/** Tiempo de lectura estimado (~200 palabras/min) en formato "X min". */
export function readingTime(text: string): string {
  const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min`;
}

/** Fecha legible según el idioma. Acepta ISO completo o YYYY-MM-DD. */
export function formatDate(iso: string, locale: Locale): string {
  const d = new Date(iso.length <= 10 ? iso + 'T00:00:00' : iso);
  return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}
