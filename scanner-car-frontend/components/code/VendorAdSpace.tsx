/* Espacio de vendedores de repuestos — muestra anuncios activos (apilados por plan)
   con botones de WhatsApp y Llamar. Si no hay anuncios, estado gris deshabilitado.
   Server component (hace fetch de los anuncios activos). */

import Link from 'next/link';
import { getActiveAds, type Advertisement, type AdPlan } from '@/lib/api';

const PLAN_META: Record<AdPlan, { label: string; color: string }> = {
  PREMIUM: { label: 'Premium', color: '#ff8c42' },
  PRO: { label: 'Pro', color: '#00d4ff' },
  BASICO: { label: 'Básico', color: '#94a3b8' },
};

const WHATSAPP_PATH =
  'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z';

export default async function VendorAdSpace() {
  const ads = await getActiveAds();

  if (ads.length === 0) return <EmptyState />;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-neon" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="text-white font-bold text-lg">Vendedores de Repuestos</h3>
      </div>
      <div className="space-y-4">
        {ads.map((ad) => <AdCard key={ad.id} ad={ad} />)}
      </div>
    </div>
  );
}

function AdCard({ ad }: { ad: Advertisement }) {
  const meta = PLAN_META[ad.plan];
  return (
    <div className="glass rounded-2xl overflow-hidden" style={{ border: `1px solid ${meta.color}33` }}>
      {/* Imagen del anuncio (URL externa → <img>) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={ad.imageUrl} alt={ad.businessName} className="w-full h-44 object-cover bg-white/5" />

      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h4 className="text-white font-bold truncate">{ad.businessName}</h4>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: `${meta.color}22`, color: meta.color }}>
            {meta.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {ad.whatsapp ? (
            <a
              href={`https://wa.me/${ad.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-white text-sm transition-all hover:brightness-110"
              style={{ background: '#25D366' }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d={WHATSAPP_PATH} /></svg>
              WhatsApp
            </a>
          ) : <DisabledBtn label="WhatsApp" />}

          {ad.phone ? (
            <a
              href={`tel:+${ad.phone}`}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-[#020617] text-sm transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(to right, #00d4ff, #00a3c4)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Llamar
            </a>
          ) : <DisabledBtn label="Llamar" />}
        </div>

        {ad.link && (
          <a href={ad.link} target="_blank" rel="noopener noreferrer" className="block text-center text-xs text-neon mt-2 hover:underline">
            Visitar tienda →
          </a>
        )}
      </div>
    </div>
  );
}

/* Botón gris deshabilitado (sin acción) */
function DisabledBtn({ label }: { label: string }) {
  return (
    <span className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-slate-500 text-sm bg-slate-700/30 border border-slate-600/30 cursor-not-allowed select-none">
      {label}
    </span>
  );
}

/* Estado vacío — gris, botones deshabilitados, sin acción posible */
function EmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-600/40 bg-slate-700/10 p-6 text-center">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-slate-700/30">
        <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <p className="text-slate-400 font-semibold text-sm mb-1">Espacio para vendedores de repuestos</p>
      <p className="text-slate-500 text-xs mb-4">Aún no hay un anunciante en este espacio.</p>

      {/* Botones grises deshabilitados */}
      <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto mb-4">
        <DisabledBtn label="WhatsApp" />
        <DisabledBtn label="Llamar" />
      </div>

      <Link href="/anunciarse" className="inline-flex items-center gap-2 px-4 py-2 glass text-neon text-xs font-semibold rounded-lg hover:bg-neon/10 transition-colors">
        ¿Vendes repuestos? Anúnciate aquí
      </Link>
    </div>
  );
}
