'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  getToken, clearToken, adminListAds, adminCreateAd, adminUpdateAd, adminDeleteAd,
  adminUploadImage, isUnauthorized, type AdPayload,
} from '@/lib/admin';
import type { Advertisement, AdPlan } from '@/lib/api';
import BannerManager from '@/components/admin/BannerManager';
import BlogManager from '@/components/admin/BlogManager';

const EMPTY: AdPayload = {
  businessName: '', imageUrl: '', whatsapp: '', phone: '', link: '', plan: 'BASICO', active: true,
};

const PLAN_META: Record<AdPlan, { label: string; color: string }> = {
  PREMIUM: { label: 'Premium', color: '#ff8c42' },
  PRO: { label: 'Pro', color: '#00d4ff' },
  BASICO: { label: 'Básico', color: '#94a3b8' },
};

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'vendors' | 'banners' | 'blog'>('vendors');
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [form, setForm] = useState<AdPayload>(EMPTY);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleAuthError = useCallback((e: unknown) => {
    if (isUnauthorized(e)) {
      clearToken();
      router.push('/admin/login');
      return true;
    }
    return false;
  }, [router]);

  const load = useCallback(async () => {
    try {
      setAds(await adminListAds());
    } catch (e) {
      if (!handleAuthError(e)) setError('Error cargando anuncios');
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    if (!getToken()) { router.push('/admin/login'); return; }
    load();
  }, [router, load]);

  function setField<K extends keyof AdPayload>(key: K, value: AdPayload[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const url = await adminUploadImage(file);
      setField('imageUrl', url);
    } catch (err) {
      if (!handleAuthError(err)) setError('No se pudo subir la imagen (máx. 6 MB, solo imágenes).');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function resetForm() {
    setForm(EMPTY);
    setEditingId(null);
  }

  function startEdit(ad: Advertisement) {
    setEditingId(ad.id);
    setForm({
      businessName: ad.businessName,
      imageUrl: ad.imageUrl,
      whatsapp: ad.whatsapp ?? '',
      phone: ad.phone ?? '',
      link: ad.link ?? '',
      plan: ad.plan,
      active: ad.active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.businessName.trim() || !form.imageUrl.trim()) {
      setError('Nombre del negocio e imagen son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) await adminUpdateAd(editingId, form);
      else await adminCreateAd(form);
      resetForm();
      await load();
    } catch (e) {
      if (!handleAuthError(e)) setError('No se pudo guardar el anuncio');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(ad: Advertisement) {
    try {
      await adminUpdateAd(ad.id, { active: !ad.active });
      await load();
    } catch (e) { handleAuthError(e); }
  }

  async function remove(ad: Advertisement) {
    if (!confirm(`¿Eliminar el anuncio de "${ad.businessName}"?`)) return;
    try {
      await adminDeleteAd(ad.id);
      if (editingId === ad.id) resetForm();
      await load();
    } catch (e) { handleAuthError(e); }
  }

  function logout() {
    clearToken();
    router.push('/admin/login');
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Panel de Anuncios</h1>
          <p className="text-slate-400 text-sm">Gestiona los espacios publicitarios del sitio.</p>
        </div>
        <button onClick={logout} className="glass px-4 py-2 rounded-xl text-sm text-slate-300 hover:text-white transition-colors">
          Cerrar sesión
        </button>
      </div>

      {/* Pestañas */}
      <div className="flex gap-2 mb-8 flex-wrap">
        <TabButton active={tab === 'vendors'} onClick={() => setTab('vendors')}>Vendedores de repuestos</TabButton>
        <TabButton active={tab === 'banners'} onClick={() => setTab('banners')}>Banners de publicidad</TabButton>
        <TabButton active={tab === 'blog'} onClick={() => setTab('blog')}>Blog</TabButton>
      </div>

      {tab === 'banners' && <BannerManager onAuthError={handleAuthError} />}
      {tab === 'blog' && <BlogManager onAuthError={handleAuthError} />}

      {tab === 'vendors' && (
        <>
      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-crit/10 border border-crit/30 text-crit text-sm">{error}</div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Formulario ── */}
        <form onSubmit={onSubmit} className="glass-strong rounded-2xl p-6 h-fit lg:sticky lg:top-6">
          <h2 className="text-lg font-bold text-white mb-4">
            {editingId ? 'Editar anuncio' : 'Nuevo anuncio'}
          </h2>

          <Field label="Nombre del negocio *">
            <input className={inputCls} value={form.businessName} onChange={(e) => setField('businessName', e.target.value)} placeholder="Repuestos El Motor" />
          </Field>

          <Field label="URL de la imagen *">
            <input className={inputCls} value={form.imageUrl} onChange={(e) => setField('imageUrl', e.target.value)} placeholder="https://...imagen.jpg" />
          </Field>

          {/* Subir archivo local → se guarda en el backend */}
          <div className="mb-4">
            <label className="block text-sm text-slate-300 mb-1">…o sube una imagen desde tu equipo</label>
            <input
              type="file"
              accept="image/*"
              onChange={onPickFile}
              disabled={uploading}
              className="block w-full text-sm text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-neon/20 file:text-neon file:font-semibold file:cursor-pointer hover:file:bg-neon/30 disabled:opacity-50"
            />
            {uploading && <p className="text-neon text-xs mt-1 animate-pulse">Subiendo imagen…</p>}
          </div>

          {/* Preview */}
          {form.imageUrl.trim() && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.imageUrl} alt="Vista previa" className="w-full h-32 object-cover rounded-xl mb-4 border border-white/10" />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="WhatsApp (con indicativo)">
              <input className={inputCls} value={form.whatsapp} onChange={(e) => setField('whatsapp', e.target.value)} placeholder="573001234567" />
            </Field>
            <Field label="Teléfono">
              <input className={inputCls} value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="573001234567" />
            </Field>
          </div>

          <Field label="Enlace (web/tienda, opcional)">
            <input className={inputCls} value={form.link} onChange={(e) => setField('link', e.target.value)} placeholder="https://mitienda.com" />
          </Field>

          <div className="grid grid-cols-2 gap-3 items-end">
            <Field label="Plan (define el orden)">
              <select className={inputCls} value={form.plan} onChange={(e) => setField('plan', e.target.value as AdPlan)}>
                <option value="PREMIUM">Premium (1º)</option>
                <option value="PRO">Pro (2º)</option>
                <option value="BASICO">Básico (3º)</option>
              </select>
            </Field>
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setField('active', e.target.checked)} className="w-4 h-4 accent-[#00d4ff]" />
              <span className="text-sm text-slate-300">Activo (visible)</span>
            </label>
          </div>

          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-[#00d4ff] to-[#00a3c4] text-[#020617] font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-60">
              {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear anuncio'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-4 py-3 glass rounded-xl text-slate-300 hover:text-white transition-colors">
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* ── Lista ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Anuncios ({ads.length})</h2>
          </div>

          {loading ? (
            <p className="text-slate-500 text-sm">Cargando…</p>
          ) : ads.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center text-slate-500 text-sm">
              Aún no hay anuncios. Crea el primero con el formulario.
            </div>
          ) : (
            <div className="space-y-3">
              {ads.map((ad) => (
                <div key={ad.id} className="glass rounded-2xl p-4 flex gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ad.imageUrl} alt={ad.businessName} className="w-20 h-20 object-cover rounded-xl border border-white/10 shrink-0 bg-white/5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-semibold truncate">{ad.businessName}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${PLAN_META[ad.plan].color}22`, color: PLAN_META[ad.plan].color }}>
                        {PLAN_META[ad.plan].label}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ad.active ? 'bg-diag/20 text-diag' : 'bg-slate-600/30 text-slate-400'}`}>
                        {ad.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1 truncate">
                      {ad.whatsapp ? `WA: ${ad.whatsapp}` : 'sin WhatsApp'} · {ad.phone ? `Tel: ${ad.phone}` : 'sin tel.'}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => startEdit(ad)} className="text-xs px-3 py-1.5 glass rounded-lg text-neon hover:bg-neon/10 transition-colors">Editar</button>
                      <button onClick={() => toggleActive(ad)} className="text-xs px-3 py-1.5 glass rounded-lg text-slate-300 hover:text-white transition-colors">
                        {ad.active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button onClick={() => remove(ad)} className="text-xs px-3 py-1.5 glass rounded-lg text-crit hover:bg-crit/10 transition-colors">Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2.5 bg-[#040a18]/80 text-white rounded-xl border border-white/10 focus:border-neon focus:outline-none placeholder-slate-600 text-sm';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-sm text-slate-300 mb-1">{label}</label>
      {children}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
        active ? 'bg-neon/20 text-neon border border-neon/40' : 'glass text-slate-300 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}
