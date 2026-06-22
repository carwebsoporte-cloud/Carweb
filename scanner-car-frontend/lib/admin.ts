// Cliente del panel administrativo (solo se usa en el navegador, con token)
import type { Advertisement, AdPlan, AdBanner, AdBannerSlot, BlogPost } from './api';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const TOKEN_KEY = 'carweb_admin_token';

export function saveToken(token: string) {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
}
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function clearToken() {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken() ?? ''}` };
}

export interface AdPayload {
  businessName: string;
  imageUrl: string;
  whatsapp?: string;
  phone?: string;
  link?: string;
  plan: AdPlan;
  active: boolean;
}

/** Login: devuelve el token o lanza error */
export async function adminLogin(username: string, password: string): Promise<string> {
  const res = await fetch(`${API}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Usuario o contraseña incorrectos');
  const data = await res.json();
  return data.token as string;
}

/** Error 401 → token expirado/ inválido */
class UnauthorizedError extends Error {}
export function isUnauthorized(e: unknown): boolean {
  return e instanceof UnauthorizedError;
}

async function handle<T>(res: Response): Promise<T> {
  if (res.status === 401) throw new UnauthorizedError('No autorizado');
  if (!res.ok) throw new Error('Error en la solicitud');
  return res.json() as Promise<T>;
}

export async function adminListAds(): Promise<Advertisement[]> {
  const res = await fetch(`${API}/admin/ads`, { headers: authHeaders(), cache: 'no-store' });
  return handle<Advertisement[]>(res);
}

export async function adminCreateAd(payload: AdPayload): Promise<Advertisement> {
  const res = await fetch(`${API}/admin/ads`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handle<Advertisement>(res);
}

export async function adminUpdateAd(id: number, payload: Partial<AdPayload>): Promise<Advertisement> {
  const res = await fetch(`${API}/admin/ads/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handle<Advertisement>(res);
}

export async function adminDeleteAd(id: number): Promise<void> {
  const res = await fetch(`${API}/admin/ads/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (res.status === 401) throw new UnauthorizedError('No autorizado');
  if (!res.ok) throw new Error('No se pudo eliminar');
}

// ── Banners publicitarios (posición LEFT/RIGHT/BOTTOM) ──────────────────────
export interface BannerPayload {
  title: string;
  slot: AdBannerSlot;
  imageUrl: string;
  link: string;
  active: boolean;
}

export async function adminListBanners(): Promise<AdBanner[]> {
  const res = await fetch(`${API}/admin/ad-banners`, { headers: authHeaders(), cache: 'no-store' });
  return handle<AdBanner[]>(res);
}

export async function adminCreateBanner(payload: BannerPayload): Promise<AdBanner> {
  const res = await fetch(`${API}/admin/ad-banners`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handle<AdBanner>(res);
}

export async function adminUpdateBanner(id: number, payload: Partial<BannerPayload>): Promise<AdBanner> {
  const res = await fetch(`${API}/admin/ad-banners/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handle<AdBanner>(res);
}

export async function adminDeleteBanner(id: number): Promise<void> {
  const res = await fetch(`${API}/admin/ad-banners/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (res.status === 401) throw new UnauthorizedError('No autorizado');
  if (!res.ok) throw new Error('No se pudo eliminar');
}

// ── Blog (artículos) ────────────────────────────────────────────────────────
export interface BlogPayload {
  slug?: string;
  tag: string;
  coverUrl: string;
  published: boolean;
  date?: string;
  titleEs: string;
  excerptEs: string;
  bodyEs: string;
  titleEn?: string;
  excerptEn?: string;
  bodyEn?: string;
}

export async function adminListPosts(): Promise<BlogPost[]> {
  const res = await fetch(`${API}/admin/blog`, { headers: authHeaders(), cache: 'no-store' });
  return handle<BlogPost[]>(res);
}

export async function adminCreatePost(payload: BlogPayload): Promise<BlogPost> {
  const res = await fetch(`${API}/admin/blog`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handle<BlogPost>(res);
}

export async function adminUpdatePost(id: number, payload: Partial<BlogPayload>): Promise<BlogPost> {
  const res = await fetch(`${API}/admin/blog/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handle<BlogPost>(res);
}

export async function adminDeletePost(id: number): Promise<void> {
  const res = await fetch(`${API}/admin/blog/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (res.status === 401) throw new UnauthorizedError('No autorizado');
  if (!res.ok) throw new Error('No se pudo eliminar');
}

/** Sube una imagen al backend y devuelve su URL pública */
export async function adminUploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  // OJO: no se pone Content-Type — el navegador agrega el boundary de multipart
  const res = await fetch(`${API}/admin/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken() ?? ''}` },
    body: fd,
  });
  if (res.status === 401) throw new UnauthorizedError('No autorizado');
  if (!res.ok) {
    const msg = await res.json().catch(() => null);
    throw new Error(msg?.message || 'No se pudo subir la imagen');
  }
  const data = await res.json();
  return data.url as string;
}
