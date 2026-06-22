'use client';

/* Gestor de banners publicitarios (Amazon Associates, etc.) para el panel admin.
   Cada posición (izquierda / derecha / inferior) es independiente: se crea un
   banner por posición con su imagen y su URL de destino. */

import { useCallback, useEffect, useState } from 'react';
import {
  adminListBanners, adminCreateBanner, adminUpdateBanner, adminDeleteBanner,
  adminUploadImage, type BannerPayload,
} from '@/lib/admin';
import type { AdBanner, AdBannerSlot } from '@/lib/api';

const SLOT_META: Record<AdBannerSlot, { label: string; hint: string; color: string }> = {
  LEFT: { label: 'Panel izquierdo', hint: 'Riel lateral izquierdo (pantallas anchas)', color: '#00d4ff' },
  RIGHT: { label: 'Panel derecho', hint: 'Riel lateral derecho (pantallas anchas)', color: '#a78bfa' },
  BOTTOM: { label: 'Banner inferior', hint: 'Barra horizontal fija (15% del alto)', color: '#ff8c42' },
};

const EMPTY: BannerPayload = { title: '', slot: 'LEFT', imageUrl: '', link: '', active: true };

const inputCls = 'w-full px-3 py-2.5 bg-[#040a18]/80 text-white rounded-xl border border-white/10 focus:border-neon focus:outline-none placeholder-slate-600 text-sm';

export default function BannerManager({ onAuthError }: { onAuthError: (e: unknown) => boolean }) {
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [form, setForm] = useState<BannerPayload>(EMPTY);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setBanners(await adminListBanners());
    } catch (e) {
      if (!onAuthError(e)) setError('Error cargando banners');
    } finally {
      setLoading(false);
    }
  }, [onAuthError]);

  useEffect(() => { load(); }, [load]);

  function setField<K extends keyof BannerPayload>(key: K, value: BannerPayload[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function resetForm() {
    setForm(EMPTY);
    setEditingId(null);
  }

  function startEdit(b: AdBanner) {
    setEditingId(b.id);
    setForm({ title: b.title, slot: b.slot, imageUrl: b.imageUrl, link: b.link, active: b.active });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      if (!onAuthError(err)) setError('No se pudo subir la imagen (máx. 6 MB, solo imágenes).');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.imageUrl.trim() || !form.link.trim()) {
      setError('La imagen y la URL de destino son obligatorias.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) await adminUpdateBanner(editingId, form);
      else await adminCreateBanner(form);
      resetForm();
      await load();
    } catch (e) {
      if (!onAuthError(e)) setError('No se pudo guardar el banner');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(b: AdBanner) {
    try {
      await adminUpdateBanner(b.id, { active: !b.active });
      await load();
    } catch (e) { onAuthError(e); }
  }

  async function remove(b: AdBanner) {
    if (!confirm(`¿Eliminar el banner "${b.title || SLOT_META[b.slot].label}"?`)) return;
    try {
      await adminDeleteBanner(b.id);
      if (editingId === b.id) resetForm();
      await load();
    } catch (e) { onAuthError(e); }
  }

  return (
    <div>
      <div className="mb-6 px-4 py-3 rounded-xl bg-neon/5 border border-neon/20 text-slate-300 text-sm">
        Estos banners aparecen en todas las páginas <strong className="text-white">excepto en la de inicio</strong>.
        Crea un banner por posición; al hacer clic, la imagen redirige a la URL que indiques.
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-crit/10 border border-crit/30 text-crit text-sm">{error}</div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Formulario ── */}
        <form onSubmit={onSubmit} className="glass-strong rounded-2xl p-6 h-fit lg:sticky lg:top-6">
          <h2 className="text-lg font-bold text-white mb-4">
            {editingId ? 'Editar banner' : 'Nuevo banner'}
          </h2>

          <Field label="Posición *">
            <select className={inputCls} value={form.slot} onChange={(e) => setField('slot', e.target.value as AdBannerSlot)}>
              <option value="LEFT">Panel izquierdo</option>
              <option value="RIGHT">Panel derecho</option>
              <option value="BOTTOM">Banner inferior (horizontal)</option>
            </select>
            <p className="text-slate-500 text-xs mt-1">{SLOT_META[form.slot].hint}</p>
          </Field>

          <Field label="Nombre interno (opcional)">
            <input className={inputCls} value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Ej: Amazon - escáner OBD2" />
          </Field>

          <Field label="URL de la imagen *">
            <input className={inputCls} value={form.imageUrl} onChange={(e) => setField('imageUrl', e.target.value)} placeholder="https://...imagen.jpg" />
          </Field>

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

          {form.imageUrl.trim() && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.imageUrl} alt="Vista previa" className="w-full h-32 object-contain rounded-xl mb-4 border border-white/10 bg-[#040a18]" />
          )}

          <Field label="URL de destino * (al hacer clic)">
            <input className={inputCls} value={form.link} onChange={(e) => setField('link', e.target.value)} placeholder="https://www.amazon.com/dp/..." />
          </Field>

          <label className="flex items-center gap-2 mb-4 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={(e) => setField('active', e.target.checked)} className="w-4 h-4 accent-[#00d4ff]" />
            <span className="text-sm text-slate-300">Activo (visible)</span>
          </label>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-[#00d4ff] to-[#00a3c4] text-[#020617] font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-60">
              {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear banner'}
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
          <h2 className="text-lg font-bold text-white mb-4">Banners ({banners.length})</h2>

          {loading ? (
            <p className="text-slate-500 text-sm">Cargando…</p>
          ) : banners.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center text-slate-500 text-sm">
              Aún no hay banners. Crea el primero con el formulario.
            </div>
          ) : (
            <div className="space-y-3">
              {banners.map((b) => {
                const meta = SLOT_META[b.slot];
                return (
                  <div key={b.id} className="glass rounded-2xl p-4 flex gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.imageUrl} alt={b.title} className="w-20 h-20 object-contain rounded-xl border border-white/10 shrink-0 bg-[#040a18]" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-semibold truncate">{b.title || meta.label}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${meta.color}22`, color: meta.color }}>
                          {meta.label}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.active ? 'bg-diag/20 text-diag' : 'bg-slate-600/30 text-slate-400'}`}>
                          {b.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs mt-1 truncate">{b.link}</p>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => startEdit(b)} className="text-xs px-3 py-1.5 glass rounded-lg text-neon hover:bg-neon/10 transition-colors">Editar</button>
                        <button onClick={() => toggleActive(b)} className="text-xs px-3 py-1.5 glass rounded-lg text-slate-300 hover:text-white transition-colors">
                          {b.active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button onClick={() => remove(b)} className="text-xs px-3 py-1.5 glass rounded-lg text-crit hover:bg-crit/10 transition-colors">Eliminar</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-sm text-slate-300 mb-1">{label}</label>
      {children}
    </div>
  );
}
