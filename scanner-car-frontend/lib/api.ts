// Cliente HTTP para comunicarse con el backend NestJS

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

import { OBDCode, OBDCategory, CodeVariant, Manufacturer } from './types';
import type { Locale } from './i18n';

// Timeout para que un backend lento no cuelgue el render SSR ni al cliente.
const FETCH_TIMEOUT_MS = 8000;

/** fetch con AbortSignal de timeout; conserva las opciones de Next (next/cache). */
function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
}

// El backend devuelve español por defecto; solo se envía locale cuando es 'en'.
// El contenido editorial (título, descripción, síntomas…) llega ya traducido.
function localeQuery(locale: Locale | undefined, leading: '?' | '&'): string {
  return locale && locale !== 'es' ? `${leading}locale=${locale}` : '';
}

/**
 * Obtener todos los códigos OBD2 con paginación
 */
export async function getAllCodes(page: number = 1, limit: number = 50, locale?: Locale): Promise<OBDCode[]> {
  const url = `${API_BASE_URL}/codes?page=${page}&limit=${limit}${localeQuery(locale, '&')}`;

  const res = await apiFetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Error al obtener códigos');
  const data = await res.json();
  return data.data || [];
}

/**
 * Obtener todos los códigos OBD2 con paginación y metadatos (para sitemap)
 */
export async function getAllCodesPaged(page: number = 1, limit: number = 50, locale?: Locale): Promise<PagedCodes> {
  const empty: PagedCodes = { data: [], total: 0, page, limit, pages: 0 };
  const url = `${API_BASE_URL}/codes?page=${page}&limit=${limit}${localeQuery(locale, '&')}`;
  try {
    const res = await apiFetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return empty;
    const json = await res.json();
    return {
      data: json.data ?? [],
      total: json.total ?? 0,
      page: json.page ?? page,
      limit: json.limit ?? limit,
      pages: json.pages ?? 0,
    };
  } catch {
    return empty;
  }
}

/**
 * Obtener un código por su identificador (ej: P0420). Con `manufacturer` (slug)
 * devuelve la variante específica de esa marca (con fallback al genérico en el
 * backend). Sin marca devuelve la variante genérica SAE (o 404 si solo existe
 * como código OEM — usar getCodeVariants para desambiguar).
 */
export async function getCodeByCode(code: string, locale?: Locale, manufacturer?: string): Promise<OBDCode | null> {
  const params = new URLSearchParams();
  if (locale && locale !== 'es') params.set('locale', locale);
  if (manufacturer) params.set('manufacturer', manufacturer);
  const qs = params.toString();
  const res = await apiFetch(`${API_BASE_URL}/codes/${code}${qs ? `?${qs}` : ''}`, {
    next: { revalidate: 3600 },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Error al obtener código');
  return res.json();
}

/**
 * Variantes de un código por fabricante (genérico SAE + OEM). Vacío si el
 * código no existe en ninguna marca.
 */
export async function getCodeVariants(code: string): Promise<CodeVariant[]> {
  try {
    const res = await apiFetch(`${API_BASE_URL}/codes/${code}/variants`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/**
 * Todos los fabricantes (genérico SAE primero) con su conteo de códigos.
 */
export async function getManufacturers(): Promise<Manufacturer[]> {
  try {
    const res = await apiFetch(`${API_BASE_URL}/manufacturers`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export interface ManufacturerCodes {
  manufacturer: Manufacturer | null;
  data: OBDCode[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Códigos de un fabricante (paginado). manufacturer = null si el slug no existe.
 */
export async function getManufacturerCodes(slug: string, page: number = 1, limit: number = 60, locale?: Locale): Promise<ManufacturerCodes> {
  const empty: ManufacturerCodes = { manufacturer: null, data: [], total: 0, page, limit, pages: 0 };
  try {
    const res = await apiFetch(`${API_BASE_URL}/manufacturers/${slug}/codes?page=${page}&limit=${limit}${localeQuery(locale, '&')}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return empty;
    return res.json();
  } catch {
    return empty;
  }
}

/**
 * Buscar códigos para autocomplete (máx 5 resultados)
 */
export async function searchCodes(query: string, locale?: Locale): Promise<OBDCode[]> {
  if (query.length < 2) return [];

  const res = await apiFetch(`${API_BASE_URL}/codes/search?q=${encodeURIComponent(query)}${localeQuery(locale, '&')}`, {
    cache: 'no-store'
  });

  if (!res.ok) return [];
  return res.json();
}

/**
 * Buscar códigos — resultados completos para la página /buscar
 */
export async function searchCodesFull(query: string, limit: number = 50, locale?: Locale): Promise<OBDCode[]> {
  if (query.trim().length < 2) return [];

  const res = await apiFetch(
    `${API_BASE_URL}/codes/search?q=${encodeURIComponent(query)}&limit=${limit}${localeQuery(locale, '&')}`,
    { cache: 'no-store' }
  );

  if (!res.ok) return [];
  return res.json();
}

/**
 * Buscar códigos por síntoma (ej: "ralentí inestable"). Mín. 3 caracteres.
 */
export async function searchBySymptom(query: string, limit: number = 12, locale?: Locale): Promise<OBDCode[]> {
  if (query.trim().length < 3) return [];
  const res = await apiFetch(
    `${API_BASE_URL}/codes/by-symptom?q=${encodeURIComponent(query)}&limit=${limit}${localeQuery(locale, '&')}`,
    { cache: 'no-store' },
  );
  if (!res.ok) return [];
  return res.json();
}

/**
 * Obtener códigos por categoría (P, B, C, U) con paginación
 */
export async function getCodesByCategory(category: string, page: number = 1, limit: number = 50, locale?: Locale): Promise<OBDCode[]> {
  const res = await apiFetch(`${API_BASE_URL}/codes/category/${category}?page=${page}&limit=${limit}${localeQuery(locale, '&')}`, {
    next: { revalidate: 3600 }
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export interface PagedCodes {
  data: OBDCode[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Obtener códigos por categoría con metadata de paginación (data, total, page, pages)
 */
export async function getCodesByCategoryPaged(category: string, page: number = 1, limit: number = 24, locale?: Locale): Promise<PagedCodes> {
  const empty: PagedCodes = { data: [], total: 0, page, limit, pages: 0 };
  const res = await apiFetch(`${API_BASE_URL}/codes/category/${category}?page=${page}&limit=${limit}${localeQuery(locale, '&')}`, {
    next: { revalidate: 3600 }
  });

  if (!res.ok) return empty;
  const json = await res.json();
  return {
    data: json.data ?? [],
    total: json.total ?? 0,
    page: json.page ?? page,
    limit: json.limit ?? limit,
    pages: json.pages ?? 0,
  };
}

/**
 * Obtener códigos relacionados
 */
export async function getRelatedCodes(code: string, locale?: Locale): Promise<OBDCode[]> {
  const res = await apiFetch(`${API_BASE_URL}/codes/${code}/related${localeQuery(locale, '?')}`, {
    next: { revalidate: 3600 }
  });

  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : data.data || [];
}

/**
 * Obtener todas las categorías desde la BD
 */
export async function getCategories(): Promise<OBDCategory[]> {
  const res = await apiFetch(`${API_BASE_URL}/categories`, {
    next: { revalidate: 3600 }
  });

  if (!res.ok) return [];
  return res.json();
}

export type AdPlan = 'PREMIUM' | 'PRO' | 'BASICO';

export interface Advertisement {
  id: number;
  businessName: string;
  imageUrl: string;
  whatsapp: string | null;
  phone: string | null;
  link: string | null;
  plan: AdPlan;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Anuncios activos de vendedores (ordenados por plan: Premium → Pro → Básico)
 */
export async function getActiveAds(): Promise<Advertisement[]> {
  try {
    const res = await apiFetch(`${API_BASE_URL}/ads`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// ── Banners publicitarios por posición (Amazon Associates, etc.) ────────────
export type AdBannerSlot = 'LEFT' | 'RIGHT' | 'BOTTOM';

export interface AdBanner {
  id: number;
  title: string;
  slot: AdBannerSlot;
  imageUrl: string;
  link: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Banners activos (todas las posiciones). El frontend elige cuál pintar por
 * posición y NUNCA los muestra en la página de inicio.
 */
export async function getActiveBanners(): Promise<AdBanner[]> {
  try {
    const res = await apiFetch(`${API_BASE_URL}/ad-banners`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// ── Blog (artículos gestionados desde el panel admin) ───────────────────────
export interface BlogPost {
  id: number;
  slug: string;
  tag: string;
  coverUrl: string;
  published: boolean;
  date: string;
  titleEs: string;
  excerptEs: string;
  bodyEs: string;
  titleEn: string | null;
  excerptEn: string | null;
  bodyEn: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Artículos publicados (más recientes primero). */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  try {
    const res = await apiFetch(`${API_BASE_URL}/blog`, { next: { revalidate: 600 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/** Un artículo publicado por slug (null si no existe o no está publicado). */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const res = await apiFetch(`${API_BASE_URL}/blog/${encodeURIComponent(slug)}`, { next: { revalidate: 600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export interface PlatformStats {
  codes: number;
  symptoms: number;
  causes: number;
  solutions: number;
}

// ── Fase 4: enriquecimiento por vehículo (NHTSA vía backend) ────────────────

export interface DecodedVin {
  valid: boolean;
  vin: string;
  error?: string;
  make?: string | null;
  model?: string | null;
  year?: string | null;
  manufacturer?: string | null;
  vehicleType?: string | null;
  bodyClass?: string | null;
  trim?: string | null;
  engineCylinders?: string | null;
  displacementL?: number | null;
  engineModel?: string | null;
  fuelType?: string | null;
  driveType?: string | null;
  transmission?: string | null;
  plantCountry?: string | null;
  errorText?: string | null;
}

export interface RecallItem {
  campaign: string | null;
  component: string | null;
  summary: string | null;
  consequence: string | null;
  remedy: string | null;
  date: string | null;
}

/** Decodifica un VIN vía el backend (NHTSA vPIC). */
export async function decodeVin(vin: string): Promise<DecodedVin | null> {
  try {
    const res = await apiFetch(`${API_BASE_URL}/vehicle/vin/${encodeURIComponent(vin.trim())}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/** Llamados a revisión (recalls NHTSA) por marca/modelo/año. */
export async function getVehicleRecalls(make: string, model: string, year: string): Promise<{ count: number; results: RecallItem[] }> {
  try {
    const res = await apiFetch(
      `${API_BASE_URL}/vehicle/recalls?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${encodeURIComponent(year)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return { count: 0, results: [] };
    return res.json();
  } catch {
    return { count: 0, results: [] };
  }
}

/**
 * Obtener métricas globales de la plataforma
 */
export async function getStats(): Promise<PlatformStats> {
  try {
    const res = await apiFetch(`${API_BASE_URL}/stats`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) throw new Error('stats');
    return res.json();
  } catch {
    return { codes: 438, symptoms: 1050, causes: 980, solutions: 875 };
  }
}
