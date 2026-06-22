import Link from 'next/link';
import { OBDCode, getCategoryInfo } from '@/lib/types';
import { getDict, withLocale, type Locale } from '@/lib/i18n';
import SeverityBadge from '@/components/SeverityBadge';
import AffectedSystemVisual from '@/components/code/AffectedSystemVisual';
import CodeStructuredData from '@/components/code/CodeStructuredData';
import VendorAdSpace from '@/components/code/VendorAdSpace';

/* Vista de detalle de un código, compartida por la ruta genérica
   (/code/[codeId]) y la ruta por marca (/code/[codeId]/[manufacturer]). */

function getSeverityVisual(severity: string, t: ReturnType<typeof getDict>['code']) {
  switch (severity) {
    case 'Crítica/No conducir':
      return { color: '#ff4d4d', icon: '🚨', title: t.sevCriticalTitle, advice: t.sevCriticalAdvice };
    case 'Moderada':
      return { color: '#ff8c42', icon: '⚠️', title: t.sevModerateTitle, advice: t.sevModerateAdvice };
    default:
      return { color: '#00ff88', icon: '✅', title: t.sevLowTitle, advice: t.sevLowAdvice };
  }
}

function getRepairCostEstimate(code: string, locale: Locale): { min: string; max: string; note: string } {
  const prefix = code.substring(0, 3).toUpperCase();
  const categoryLetter = code[0].toUpperCase();
  const en = locale === 'en';

  if (code === 'P0420' || code === 'P0430') return { min: '$300', max: '$2,000', note: en ? 'Catalytic converter + diagnosis' : 'Catalizador + diagnóstico' };
  if (prefix === 'P03') return { min: '$50', max: '$300', note: en ? 'Spark plugs + coils' : 'Bujías + bobinas' };
  if (prefix === 'P01' || prefix === 'P02') return { min: '$80', max: '$600', note: en ? 'Sensors + injectors' : 'Sensores + inyectores' };
  if (prefix === 'P07') return { min: '$200', max: '$3,000', note: en ? 'Solenoids + transmission' : 'Solenoides + transmisión' };
  if (prefix === 'P0A' || prefix === 'P0B' || prefix === 'P0D') return { min: '$500', max: '$8,000', note: en ? 'HV electric system' : 'Sistema HV eléctrico' };
  if (categoryLetter === 'B') return { min: '$150', max: '$1,500', note: en ? 'SRS / body modules' : 'Módulos SRS / carrocería' };
  if (categoryLetter === 'C') return { min: '$100', max: '$800', note: en ? 'ABS / brake sensors' : 'Sensores ABS / frenos' };
  if (categoryLetter === 'U') return { min: '$80', max: '$1,200', note: en ? 'Communication modules' : 'Módulos de comunicación' };
  return { min: '$100', max: '$800', note: en ? 'Varies by diagnosis' : 'Varía según diagnóstico' };
}

const AdSlot = ({ label, tall = false }: { label: string; tall?: boolean }) => (
  <div className={`glass border-dashed rounded-xl flex items-center justify-center text-slate-600 text-xs text-center px-4 ${tall ? 'h-64' : 'h-24'}`}>
    {label}
  </div>
);

export default function CodeDetailView({
  code,
  relatedCodes,
  locale,
}: {
  code: OBDCode;
  relatedCodes: OBDCode[];
  locale: Locale;
}) {
  const dict = getDict(locale);
  const t = dict.code;
  const tv = dict.variants;
  const L = (href: string) => withLocale(href, locale);

  const category = getCategoryInfo(code.code);
  const sev = getSeverityVisual(code.severity, t);
  const costEstimate = getRepairCostEstimate(code.code, locale);

  const isOem = !!code.manufacturer && code.manufacturer.isGeneric === false;
  const others = code.otherManufacturers ?? [];
  // Enlace a la variante de una marca (o al genérico si isGeneric).
  const variantHref = (slug: string, generic: boolean) => (generic ? L(`/code/${code.code}`) : L(`/code/${code.code}/${slug}`));

  const searchQuery = encodeURIComponent(`codigo OBD2 ${code.code} ${code.title} reparacion`);
  const youtubeUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
  const googleImagesUrl = `https://www.google.com/search?q=${encodeURIComponent(`${code.code} sensor automotriz componente`)}&tbm=isch`;
  const manualSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${code.code} repair manual PDF service guide`)}`;

  return (
    <>
      <CodeStructuredData code={code} severityAdvice={sev.advice} locale={locale} />

      {/* Breadcrumb */}
      <div className="relative border-b border-neon/15 bg-[#040a18]/60">
        <div className="absolute inset-0 cw-grid cw-grid-fade opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm flex-wrap" aria-label="Breadcrumb">
            <Link href={L('/')} className="text-slate-400 hover:text-neon transition-colors">{t.home}</Link>
            <span className="text-slate-600">/</span>
            <Link href={L(`/category/${code.code[0]}`)} className="text-slate-400 hover:text-neon transition-colors">{category.name}</Link>
            {isOem && code.manufacturer && (
              <>
                <span className="text-slate-600">/</span>
                <Link href={L(`/marcas/${code.manufacturer.slug}`)} className="text-slate-400 hover:text-neon transition-colors">{code.manufacturer.name}</Link>
              </>
            )}
            <span className="text-slate-600">/</span>
            <span className="text-neon font-mono font-semibold">{code.code}</span>
          </nav>
        </div>
      </div>

      <section className="relative py-10">
        <div className="absolute inset-0 cw-radial opacity-60 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── COLUMNA PRINCIPAL ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Hero del código */}
              <div className="glass-strong rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl opacity-20" style={{ background: sev.color }} />
                <div className="relative">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                    <div>
                      <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-white mb-1">
                        <span className="font-mono holo-text text-glow-neon">{code.code}</span>
                        <span className="block text-2xl sm:text-3xl font-bold text-white mt-1">{code.title}</span>
                      </h1>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 glass rounded-full text-slate-300 text-sm">
                          {code.category?.icon} {category.name}
                        </span>
                        {isOem && code.manufacturer && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold" style={{ background: '#00d4ff18', color: '#00d4ff', border: '1px solid #00d4ff44' }}>
                            🏭 {tv.oemTagPrefix} {code.manufacturer.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <SeverityBadge severity={code.severity} size="lg" />
                  </div>

                  {code.description && (
                    <p className="text-slate-300 text-lg leading-relaxed border-l-4 border-neon/50 pl-4">
                      {code.description}
                    </p>
                  )}

                  {/* Compatibilidad */}
                  {Array.isArray(code.vehicleCompat) && code.vehicleCompat.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="text-slate-500 text-sm self-center">{t.compatibleWith}</span>
                      {code.vehicleCompat.map((vc) => (
                        <span
                          key={vc.id}
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${
                            vc.vehicleType.type === 'EV'
                              ? 'border-[#00ff88]/40 text-[#00ff88] bg-[#00ff88]/10'
                              : vc.vehicleType.type === 'HYBRID'
                              ? 'border-teal-400/40 text-teal-300 bg-teal-400/10'
                              : 'border-slate-500/40 text-slate-300 bg-white/5'
                          }`}
                        >
                          {vc.vehicleType.type === 'ICE' ? t.gasDiesel : vc.vehicleType.type === 'EV' ? t.electric : t.hybrid}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Banner de variantes por marca */}
              {others.length > 0 && (
                <div className="glass rounded-2xl p-5" style={{ borderColor: '#00d4ff33', boxShadow: '0 0 24px #00d4ff10' }}>
                  <p className="text-sm text-slate-300 mb-3">
                    <span className="text-[#00d4ff] font-semibold">{isOem ? tv.otherBrands : tv.alsoDefinedBy}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {others.map((m) => (
                      <Link
                        key={m.slug}
                        href={variantHref(m.slug, m.isGeneric)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-slate-200 hover:border-[#00d4ff]/50 hover:text-white transition-colors"
                      >
                        {m.isGeneric ? `🌐 ${tv.viewGeneric}` : `🏭 ${m.name}`}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Alerta de severidad */}
              <div className="glass rounded-2xl p-5" style={{ borderColor: `${sev.color}40`, boxShadow: `0 0 24px ${sev.color}15` }}>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{sev.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg mb-1" style={{ color: sev.color }}>{sev.title}</h3>
                    <p className="text-slate-300">{sev.advice}</p>
                  </div>
                </div>
              </div>

              <AffectedSystemVisual code={code.code} />
              <VendorAdSpace />
              <AdSlot label={t.adSlot} />

              {/* Síntomas */}
              {Array.isArray(code.symptoms) && code.symptoms.length > 0 && (
                <div className="glass rounded-2xl p-8">
                  <SectionHeader color="#ff8c42" title={t.symptomsTitle} sub={t.symptomsSub} icon="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  <ul className="space-y-3">
                    {code.symptoms.map((s) => (
                      <li key={s.id} className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-3">
                        <span className="w-5 h-5 mt-0.5 shrink-0 rounded-full flex items-center justify-center" style={{ background: '#ff8c4222' }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-warn" />
                        </span>
                        <span className="text-slate-200">{s.symptom}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Causas */}
              {Array.isArray(code.causes) && code.causes.length > 0 && (
                <div className="glass rounded-2xl p-8">
                  <SectionHeader color="#ff4d4d" title={t.causesTitle} sub={t.causesSub} icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  <ul className="space-y-3">
                    {code.causes.map((c, i) => (
                      <li key={c.id} className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-3">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 text-crit" style={{ background: '#ff4d4d22' }}>{i + 1}</span>
                        <span className="text-slate-200">{c.cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <AdSlot label={t.adSlot} />

              {/* Soluciones */}
              {Array.isArray(code.solutions) && code.solutions.length > 0 && (
                <div className="glass rounded-2xl p-8" style={{ borderColor: 'rgba(0,255,136,0.2)' }}>
                  <SectionHeader color="#00ff88" title={t.solutionsTitle} sub={t.solutionsSub} icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  <ol className="space-y-4">
                    {code.solutions.map((s, i) => (
                      <li key={s.id} className="flex items-start gap-4 bg-white/[0.03] border border-white/5 rounded-xl p-4">
                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-diag" style={{ background: '#00ff8822' }}>{i + 1}</span>
                        <span className="text-slate-200 leading-relaxed">{s.solution}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-6 p-4 rounded-xl" style={{ background: '#ff8c4210', border: '1px solid #ff8c4233' }}>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 shrink-0 mt-0.5 text-warn" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-slate-300 text-sm">
                        <strong className="text-warn">{t.note}</strong> {t.noteBody}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Costo estimado */}
              <div className="glass rounded-2xl p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{t.costTitle}</h3>
                    <p className="text-slate-500 text-xs">{t.costSub}</p>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="text-3xl sm:text-4xl font-bold text-diag">{costEstimate.min}</span>
                    <span className="text-slate-500 mb-1.5">—</span>
                    <span className="text-3xl sm:text-4xl font-bold text-crit">{costEstimate.max}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <p className="text-slate-400">{costEstimate.note}</p>
                  <p className="text-slate-600">* {t.diagOnly}</p>
                </div>
              </div>

              <AdSlot label={t.adSlot} />
            </div>

            {/* ── SIDEBAR ── */}
            <div className="space-y-5">
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">{t.quickInfo}</h3>
                <div className="space-y-3 text-sm">
                  <Row label={t.codeLabel}><span className="text-neon font-mono font-bold text-lg">{code.code}</span></Row>
                  <Row label={t.categoryLabel}><span className="text-white text-right">{category.shortName}</span></Row>
                  {code.manufacturer && (
                    <Row label={locale === 'en' ? 'Manufacturer' : 'Fabricante'}><span className="text-white text-right">{code.manufacturer.isGeneric ? tv.genericTag : code.manufacturer.name}</span></Row>
                  )}
                  <Row label={t.severityLabel}><SeverityBadge severity={code.severity} size="sm" /></Row>
                  <Row label={t.symptomsCount}><span className="text-white font-semibold">{code.symptoms?.length || 0}</span></Row>
                  <Row label={t.causesCount}><span className="text-white font-semibold">{code.causes?.length || 0}</span></Row>
                  <Row label={t.solutionSteps} last><span className="text-white font-semibold">{code.solutions?.length || 0}</span></Row>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-1">{t.resourcesTitle}</h3>
                <p className="text-slate-400 text-sm mb-4">{t.resourcesSub}</p>
                <div className="space-y-3">
                  <ResourceRow href={youtubeUrl} color="#ff4d4d" title={t.videoTitle} sub={t.videoSub} icon="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" filled />
                  <ResourceRow href={googleImagesUrl} color="#00d4ff" title={t.componentTitle} sub={t.componentSub} icon="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  <ResourceRow href={manualSearchUrl} color="#00ff88" title={t.manualTitle} sub={t.manualSub} icon="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </div>
              </div>

              <div className="glass-strong rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-1">{t.otherCodeTitle}</h3>
                <p className="text-slate-400 text-sm mb-4">{t.otherCodeSub}</p>
                <form action={L('/buscar')} method="GET">
                  <div className="flex">
                    <input type="text" name="q" placeholder={t.searchPlaceholder} className="flex-1 px-4 py-3 bg-[#040a18]/80 text-white rounded-l-xl border border-white/10 focus:border-neon focus:outline-none placeholder-slate-600 uppercase" />
                    <button type="submit" className="px-4 py-3 bg-gradient-to-r from-[#00d4ff] to-[#00a3c4] text-[#020617] rounded-r-xl transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </button>
                  </div>
                </form>
              </div>

              <AdSlot label={t.adSidebar} tall />

              {relatedCodes.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">{t.relatedTitle}</h3>
                  <div className="space-y-2">
                    {relatedCodes.map((related) => (
                      <Link key={related.code} href={L(`/code/${related.code}`)} className="block p-3 bg-white/[0.03] border border-white/5 rounded-xl hover:border-neon/30 transition-colors group">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <span className="text-neon font-mono font-semibold text-sm">{related.code}</span>
                            <p className="text-slate-400 text-xs truncate mt-0.5">{related.title.length > 45 ? related.title.substring(0, 45) + '…' : related.title}</p>
                          </div>
                          <svg className="w-4 h-4 text-slate-600 group-hover:text-neon shrink-0 ml-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={L('/')} className="inline-flex items-center text-slate-400 hover:text-neon transition-colors text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t.backToSearch}
          </Link>
        </div>
      </div>
    </>
  );
}

/* ── Subcomponentes ── */

function SectionHeader({ color, title, sub, icon }: { color: string; title: string; sub: string; icon: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}1a`, border: `1px solid ${color}33` }}>
        <svg className="w-6 h-6" fill="none" stroke={color} strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-slate-400 text-sm">{sub}</p>
      </div>
    </div>
  );
}

function Row({ label, children, last = false }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-2 ${last ? '' : 'border-b border-white/5'}`}>
      <span className="text-slate-400">{label}</span>
      {children}
    </div>
  );
}

function ResourceRow({ href, color, title, sub, icon, filled = false }: { href: string; color: string; title: string; sub: string; icon: string; filled?: boolean }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 p-3 rounded-xl transition-all duration-300" style={{ background: `${color}10`, border: `1px solid ${color}22` }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" style={{ background: color, boxShadow: `0 0 18px ${color}55` }}>
        <svg className="w-5 h-5 text-[#020617]" fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'} strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-white font-semibold text-sm leading-tight">{title}</p>
        <p className="text-xs mt-0.5" style={{ color }}>{sub} →</p>
      </div>
    </a>
  );
}
