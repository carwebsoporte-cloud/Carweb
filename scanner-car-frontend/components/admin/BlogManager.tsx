'use client';

/* Gestor del blog para el panel admin: crear, editar y eliminar artículos.
   Contenido bilingüe (español base + inglés opcional). El cuerpo usa formato
   ligero: "## " subtítulo, "- " viñeta, línea en blanco = párrafo. */

import { useCallback, useEffect, useState } from 'react';
import {
  adminListPosts, adminCreatePost, adminUpdatePost, adminDeletePost,
  adminUploadImage, type BlogPayload,
} from '@/lib/admin';
import type { BlogPost } from '@/lib/api';

const EMPTY: BlogPayload = {
  slug: '', tag: 'OBD2', coverUrl: '', published: true, date: '',
  titleEs: '', excerptEs: '', bodyEs: '', titleEn: '', excerptEn: '', bodyEn: '',
};

const inputCls = 'w-full px-3 py-2.5 bg-[#040a18]/80 text-white rounded-xl border border-white/10 focus:border-neon focus:outline-none placeholder-slate-600 text-sm';
const areaCls = inputCls + ' font-mono leading-relaxed';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function BlogManager({ onAuthError }: { onAuthError: (e: unknown) => boolean }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [form, setForm] = useState<BlogPayload>(EMPTY);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setPosts(await adminListPosts());
    } catch (e) {
      if (!onAuthError(e)) setError('Error cargando artículos');
    } finally {
      setLoading(false);
    }
  }, [onAuthError]);

  useEffect(() => { load(); }, [load]);

  function setField<K extends keyof BlogPayload>(key: K, value: BlogPayload[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function resetForm() {
    setForm({ ...EMPTY, date: todayISO() });
    setEditingId(null);
    setLang('es');
  }

  function startEdit(p: BlogPost) {
    setEditingId(p.id);
    setForm({
      slug: p.slug, tag: p.tag, coverUrl: p.coverUrl, published: p.published,
      date: p.date ? p.date.slice(0, 10) : '',
      titleEs: p.titleEs, excerptEs: p.excerptEs, bodyEs: p.bodyEs,
      titleEn: p.titleEn ?? '', excerptEn: p.excerptEn ?? '', bodyEn: p.bodyEn ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      setField('coverUrl', await adminUploadImage(file));
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
    if (!form.titleEs.trim() || !form.bodyEs.trim()) {
      setError('El título y el contenido en español son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      const payload: BlogPayload = { ...form, date: form.date || todayISO() };
      if (editingId) await adminUpdatePost(editingId, payload);
      else await adminCreatePost(payload);
      resetForm();
      await load();
    } catch (e) {
      if (!onAuthError(e)) setError('No se pudo guardar el artículo');
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(p: BlogPost) {
    try {
      await adminUpdatePost(p.id, { published: !p.published });
      await load();
    } catch (e) { onAuthError(e); }
  }

  async function remove(p: BlogPost) {
    if (!confirm(`¿Eliminar el artículo "${p.titleEs}"?`)) return;
    try {
      await adminDeletePost(p.id);
      if (editingId === p.id) resetForm();
      await load();
    } catch (e) { onAuthError(e); }
  }

  const isEs = lang === 'es';

  return (
    <div>
      <div className="mb-6 px-4 py-3 rounded-xl bg-neon/5 border border-neon/20 text-slate-300 text-sm">
        Escribe el artículo en español (obligatorio) y, si quieres, en inglés (opcional; si lo dejas vacío se usa el español).
        En el contenido puedes usar <code className="text-neon">## Subtítulo</code>, <code className="text-neon">- viñeta</code> y dejar una línea en blanco para separar párrafos.
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-crit/10 border border-crit/30 text-crit text-sm">{error}</div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Formulario ── */}
        <form onSubmit={onSubmit} className="glass-strong rounded-2xl p-6 h-fit">
          <h2 className="text-lg font-bold text-white mb-4">
            {editingId ? 'Editar artículo' : 'Nuevo artículo'}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Etiqueta (tag)">
              <input className={inputCls} value={form.tag} onChange={(e) => setField('tag', e.target.value)} placeholder="OBD2" />
            </Field>
            <Field label="Fecha de publicación">
              <input type="date" className={inputCls} value={form.date} onChange={(e) => setField('date', e.target.value)} />
            </Field>
          </div>

          <Field label="Slug (URL — se genera solo si lo dejas vacío)">
            <input className={inputCls} value={form.slug} onChange={(e) => setField('slug', e.target.value)} placeholder="mi-articulo-obd2" />
          </Field>

          <Field label="Imagen de portada (URL)">
            <input className={inputCls} value={form.coverUrl} onChange={(e) => setField('coverUrl', e.target.value)} placeholder="https://...imagen.webp" />
          </Field>
          <div className="mb-4">
            <label className="block text-sm text-slate-300 mb-1">…o sube una imagen desde tu equipo</label>
            <input type="file" accept="image/*" onChange={onPickFile} disabled={uploading}
              className="block w-full text-sm text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-neon/20 file:text-neon file:font-semibold file:cursor-pointer hover:file:bg-neon/30 disabled:opacity-50" />
            {uploading && <p className="text-neon text-xs mt-1 animate-pulse">Subiendo imagen…</p>}
          </div>
          {form.coverUrl.trim() && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.coverUrl} alt="Portada" className="w-full h-32 object-cover rounded-xl mb-4 border border-white/10 bg-[#040a18]" />
          )}

          {/* Selector de idioma */}
          <div className="flex gap-2 mb-4">
            <LangBtn active={isEs} onClick={() => setLang('es')}>Español *</LangBtn>
            <LangBtn active={!isEs} onClick={() => setLang('en')}>English (opcional)</LangBtn>
          </div>

          {isEs ? (
            <>
              <Field label="Título *">
                <input className={inputCls} value={form.titleEs} onChange={(e) => setField('titleEs', e.target.value)} placeholder="Título del artículo" />
              </Field>
              <Field label="Resumen / extracto *">
                <textarea className={inputCls} rows={2} value={form.excerptEs} onChange={(e) => setField('excerptEs', e.target.value)} placeholder="Frase corta que se ve en la tarjeta del blog." />
              </Field>
              <Field label="Contenido *">
                <textarea className={areaCls} rows={14} value={form.bodyEs} onChange={(e) => setField('bodyEs', e.target.value)} placeholder={'Párrafo de introducción.\n\n## Subtítulo\n\n- Punto uno\n- Punto dos'} />
              </Field>
            </>
          ) : (
            <>
              <Field label="Title (EN)">
                <input className={inputCls} value={form.titleEn} onChange={(e) => setField('titleEn', e.target.value)} placeholder="Article title (leave empty to use Spanish)" />
              </Field>
              <Field label="Excerpt (EN)">
                <textarea className={inputCls} rows={2} value={form.excerptEn} onChange={(e) => setField('excerptEn', e.target.value)} placeholder="Short summary shown on the blog card." />
              </Field>
              <Field label="Body (EN)">
                <textarea className={areaCls} rows={14} value={form.bodyEn} onChange={(e) => setField('bodyEn', e.target.value)} placeholder={'Intro paragraph.\n\n## Subtitle\n\n- Point one\n- Point two'} />
              </Field>
            </>
          )}

          <label className="flex items-center gap-2 mb-4 cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={(e) => setField('published', e.target.checked)} className="w-4 h-4 accent-[#00d4ff]" />
            <span className="text-sm text-slate-300">Publicado (visible en el sitio)</span>
          </label>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-[#00d4ff] to-[#00a3c4] text-[#020617] font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-60">
              {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear artículo'}
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
          <h2 className="text-lg font-bold text-white mb-4">Artículos ({posts.length})</h2>

          {loading ? (
            <p className="text-slate-500 text-sm">Cargando…</p>
          ) : posts.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center text-slate-500 text-sm">
              Aún no hay artículos. Crea el primero con el formulario.
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((p) => (
                <div key={p.id} className="glass rounded-2xl p-4 flex gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.coverUrl} alt={p.titleEs} className="w-20 h-20 object-cover rounded-xl border border-white/10 shrink-0 bg-[#040a18]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-semibold truncate">{p.titleEs}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neon/15 text-neon">{p.tag}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.published ? 'bg-diag/20 text-diag' : 'bg-slate-600/30 text-slate-400'}`}>
                        {p.published ? 'Publicado' : 'Borrador'}
                      </span>
                      {p.titleEn ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300">EN</span> : null}
                    </div>
                    <p className="text-slate-500 text-xs mt-1 truncate">/blog/{p.slug}</p>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => startEdit(p)} className="text-xs px-3 py-1.5 glass rounded-lg text-neon hover:bg-neon/10 transition-colors">Editar</button>
                      <button onClick={() => togglePublished(p)} className="text-xs px-3 py-1.5 glass rounded-lg text-slate-300 hover:text-white transition-colors">
                        {p.published ? 'Despublicar' : 'Publicar'}
                      </button>
                      <button onClick={() => remove(p)} className="text-xs px-3 py-1.5 glass rounded-lg text-crit hover:bg-crit/10 transition-colors">Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
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

function LangBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${active ? 'bg-neon/20 text-neon border border-neon/40' : 'glass text-slate-300 hover:text-white'}`}>
      {children}
    </button>
  );
}
