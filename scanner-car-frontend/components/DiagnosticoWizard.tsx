'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getDict, withLocale } from '@/lib/i18n';
import { useLocale } from '@/components/LocaleProvider';

/* ── Tipos ─────────────────────────────────────────────── */
interface CodeResult {
  id: number;
  code: string;
  title: string;
  severity: string;
  description?: string;
}

type Step = 1 | 2 | 3;

/* ── Metadatos de sistemas (etiquetas en el diccionario i18n) ── */
const SYSTEM_META = [
  { code: 'P', color: '#ff4d4d', iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { code: 'B', color: '#00d4ff', iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { code: 'C', color: '#00ff88', iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { code: 'U', color: '#a855f7', iconPath: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0' },
];

/* ── IDs de síntomas por sistema (etiquetas en el diccionario) ── */
const SYMPTOM_IDS: Record<string, string[]> = {
  P: ['check-engine', 'vibra', 'potencia', 'combustible', 'humo', 'arranque', 'ruido'],
  B: ['airbag', 'ac', 'ventanas', 'bocina', 'tablero-b'],
  C: ['abs-luz', 'estabilidad', 'frenos', 'direccion', 'suspension'],
  U: ['multiples', 'modulos', 'pantalla-u', 'escaner-u'],
};

/* ── Colores de severidad ───────────────────────────────── */
function sevColor(sev: string) {
  if (sev?.toLowerCase().includes('crít') || sev?.toLowerCase().includes('alta')) return '#ff4d4d';
  if (sev?.toLowerCase().includes('mod')) return '#ff8c42';
  return '#00ff88';
}

/* ── Animación de transición entre pasos ─────────────────── */
const stepVariants = {
  enter:  (dir: number) => ({ opacity: 0, x: dir > 0 ? 48 : -48 }),
  center: { opacity: 1, x: 0 },
  exit:   (dir: number) => ({ opacity: 0, x: dir > 0 ? -48 : 48 }),
};

/* ── Componente principal ──────────────────────────────── */
export default function DiagnosticoWizard() {
  const locale = useLocale();
  const t = getDict(locale).diagnostico;
  const L = (href: string) => withLocale(href, locale);

  const SYSTEMS = SYSTEM_META.map((m) => ({
    ...m,
    label: t.systems[m.code as 'P' | 'B' | 'C' | 'U'].label,
    desc: t.systems[m.code as 'P' | 'B' | 'C' | 'U'].desc,
  }));

  const [step,             setStep]             = useState<Step>(1);
  const [direction,        setDirection]        = useState(1);
  const [category,         setCategory]         = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [results,          setResults]          = useState<CodeResult[]>([]);
  const [loading,          setLoading]          = useState(false);
  const [fetchError,       setFetchError]       = useState(false);

  const systemInfo = SYSTEMS.find((s) => s.code === category);

  /* Navegar al paso siguiente */
  function goTo(target: Step) {
    setDirection(target > step ? 1 : -1);
    setStep(target);
  }

  /* Seleccionar sistema y avanzar */
  function selectSystem(code: string) {
    setCategory(code);
    setSelectedSymptoms([]);
    goTo(2);
  }

  /* Toggle síntoma */
  function toggleSymptom(id: string) {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  /* Fetch resultados y avanzar al paso 3 */
  async function runDiagnostic() {
    setLoading(true);
    setFetchError(false);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
      const localeQs = locale !== 'es' ? `&locale=${locale}` : '';
      const res = await fetch(`${base}/codes/category/${category}?page=1&limit=12${localeQs}`);
      if (!res.ok) throw new Error('fetch');
      const data = await res.json();
      setResults((data.data ?? []) as CodeResult[]);
    } catch {
      setFetchError(true);
      setResults([]);
    } finally {
      setLoading(false);
      goTo(3);
    }
  }

  /* Reiniciar wizard */
  function reset() {
    setDirection(-1);
    setStep(1);
    setCategory('');
    setSelectedSymptoms([]);
    setResults([]);
    setFetchError(false);
  }

  return (
    <div className="min-h-screen bg-[#020617]">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-10 px-4">
        <div className="absolute inset-0 cw-grid opacity-30" />
        <div className="absolute inset-0 cw-radial opacity-40" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-xs text-diag font-semibold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-diag animate-blink" />
            {t.eyebrow}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            <span className="holo-text">{t.titleHl}</span>{t.titleRest}
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* ── Barra de progreso ─────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 mb-8">
        <div className="flex items-center gap-2">
          {([1, 2, 3] as Step[]).map((n) => (
            <div key={n} className="flex items-center gap-2 flex-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300"
                style={{
                  background: step >= n ? (n === 3 ? '#00ff88' : '#00d4ff') : 'transparent',
                  border: `1px solid ${step >= n ? 'transparent' : '#ffffff20'}`,
                  color: step >= n ? '#020617' : '#64748b',
                }}
              >
                {n}
              </div>
              <span className={`text-xs hidden sm:block ${step >= n ? 'text-slate-300' : 'text-slate-600'}`}>
                {n === 1 ? t.stSystem : n === 2 ? t.stSymptoms : t.stResults}
              </span>
              {n < 3 && (
                <div className="flex-1 h-px mx-2" style={{ background: step > n ? '#00d4ff50' : '#ffffff10' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Pasos animados ───────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 pb-20 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: 'easeInOut' }}
            >
              <StepTitle title={t.q1Title} subtitle={t.q1Sub} />
              <div className="grid sm:grid-cols-2 gap-4">
                {SYSTEMS.map((sys) => (
                  <button
                    key={sys.code}
                    onClick={() => selectSystem(sys.code)}
                    className="glass rounded-2xl p-6 text-left group hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    style={{ borderColor: `${sys.color}33` }}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${sys.color}15`, border: `1px solid ${sys.color}30` }}
                      >
                        <svg className="w-7 h-7" fill="none" stroke={sys.color} strokeWidth={1.6} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d={sys.iconPath} />
                        </svg>
                      </div>
                      <div>
                        <p className="font-extrabold text-lg text-white leading-tight">{sys.label}</p>
                        <p className="font-mono text-xs mt-0.5" style={{ color: sys.color }}>
                          {t.codesTpl.replace('%s', sys.code)}
                        </p>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm">{sys.desc}</p>
                    <div
                      className="mt-4 text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                      style={{ color: sys.color }}
                    >
                      {t.select}
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: 'easeInOut' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => goTo(1)}
                  className="p-2 glass rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {systemInfo && (
                  <span
                    className="text-sm font-bold px-3 py-1 rounded-lg"
                    style={{ background: `${systemInfo.color}18`, color: systemInfo.color }}
                  >
                    {systemInfo.label}
                  </span>
                )}
              </div>

              <StepTitle title={t.q2Title} subtitle={t.q2Sub} />

              <div className="space-y-2 mb-8">
                {(SYMPTOM_IDS[category] ?? []).map((symId) => {
                  const checked = selectedSymptoms.includes(symId);
                  return (
                    <button
                      key={symId}
                      onClick={() => toggleSymptom(symId)}
                      className="w-full flex items-center gap-3 glass rounded-xl px-4 py-3.5 text-left transition-all"
                      style={{ borderColor: checked ? `${systemInfo?.color ?? '#00d4ff'}55` : undefined }}
                    >
                      <div
                        className="shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all"
                        style={{
                          background: checked ? (systemInfo?.color ?? '#00d4ff') : 'transparent',
                          border: `1.5px solid ${checked ? systemInfo?.color ?? '#00d4ff' : '#ffffff30'}`,
                        }}
                      >
                        {checked && (
                          <svg className="w-3 h-3" fill="none" stroke="#020617" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm ${checked ? 'text-white' : 'text-slate-300'}`}>
                        {t.symptoms[symId]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={runDiagnostic}
                disabled={loading}
                className="w-full py-4 font-bold text-[#020617] rounded-2xl transition-all hover:shadow-lg disabled:opacity-60"
                style={{ background: systemInfo ? `linear-gradient(135deg, ${systemInfo.color}, ${systemInfo.color}aa)` : undefined }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t.loadingBtn}
                  </span>
                ) : (
                  t.continueBtn
                )}
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: 'easeInOut' }}
            >
              {/* Cabecera resultados */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {fetchError ? t.noConnection : t.resultsFoundTpl.replace('%s', String(results.length))}
                  </h2>
                  {!fetchError && systemInfo && (
                    <p className="text-slate-400 text-sm mt-1">
                      {t.systemLabel} <span style={{ color: systemInfo.color }}>{systemInfo.label}</span>
                      {selectedSymptoms.length > 0 && ` · ${t.symptomsCountTpl.replace('%s', String(selectedSymptoms.length))}`}
                    </p>
                  )}
                </div>
                <button
                  onClick={reset}
                  className="glass px-4 py-2 rounded-xl text-sm text-slate-300 hover:text-white transition-colors"
                >
                  {t.reset}
                </button>
              </div>

              {/* Error de conexión */}
              {fetchError && (
                <div className="glass rounded-2xl p-8 text-center mb-6">
                  <p className="text-slate-400 mb-4">{t.noConnBody}</p>
                  <Link
                    href={L('/buscar')}
                    className="inline-block px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#00a3c4] text-[#020617] font-bold rounded-xl"
                  >
                    {t.goSearch}
                  </Link>
                </div>
              )}

              {/* Síntomas seleccionados */}
              {!fetchError && selectedSymptoms.length > 0 && (
                <div
                  className="glass rounded-xl p-4 mb-6"
                  style={{ borderColor: `${systemInfo?.color ?? '#00d4ff'}33` }}
                >
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-semibold">
                    {t.symptomsReported}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map((id) => (
                      <span
                        key={id}
                        className="text-xs px-2.5 py-1 rounded-lg font-medium"
                        style={{
                          background: `${systemInfo?.color ?? '#00d4ff'}18`,
                          color: systemInfo?.color ?? '#00d4ff',
                        }}
                      >
                        {t.symptoms[id]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Grid de resultados */}
              {!fetchError && results.length > 0 && (
                <>
                  <div className="grid sm:grid-cols-2 gap-3 mb-6">
                    {results.map((code, i) => (
                      <motion.div
                        key={code.code}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                      >
                        <Link
                          href={L(`/code/${code.code}`)}
                          className="glass rounded-xl p-4 block hover:border-neon/30 hover:scale-[1.01] transition-all"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="font-mono font-bold text-neon">{code.code}</span>
                            <span
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                              style={{
                                background: `${sevColor(code.severity)}18`,
                                color: sevColor(code.severity),
                              }}
                            >
                              {code.severity}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm leading-snug line-clamp-2">
                            {code.title}
                          </p>
                          <p className="text-neon text-xs mt-2 font-medium">
                            {t.viewFullDiag}
                          </p>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA ver todos */}
                  <div className="text-center">
                    <Link
                      href={L(`/category/${category}`)}
                      className="inline-flex items-center gap-2 glass px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition-all"
                    >
                      {t.viewAllTpl.replace('%s', category)}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </>
              )}

              {/* Sin resultados */}
              {!fetchError && results.length === 0 && (
                <div className="glass rounded-2xl p-10 text-center">
                  <p className="text-slate-400 mb-4">{t.noResults}</p>
                  <Link
                    href={L('/buscar')}
                    className="inline-block px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#00a3c4] text-[#020617] font-bold rounded-xl"
                  >
                    {t.searchManually}
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Subtítulo de paso ──────────────────────────────────── */
function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-white">{title}</h2>
      <p className="text-slate-400 mt-2 text-sm">{subtitle}</p>
    </div>
  );
}
