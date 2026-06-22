'use client';

/* Banners publicitarios por posición (Amazon Associates, etc.).
   · Izquierda y derecha: rieles laterales fijos (independientes), visibles solo
     en pantallas muy anchas para no tapar el contenido.
   · Inferior: barra horizontal fija que ocupa el 15% del alto de la pantalla.
   REGLA: nunca se muestran en la página de inicio ('/' o '/en'). */

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getActiveBanners, type AdBanner, type AdBannerSlot } from '@/lib/api';

const HOME_PATHS = new Set(['/', '/en']);

export default function AdBanners() {
  const pathname = usePathname();
  const isHome = HOME_PATHS.has(pathname);
  const [banners, setBanners] = useState<AdBanner[]>([]);

  // Carga los banners activos una vez (salvo en la home, donde no se muestran).
  useEffect(() => {
    if (isHome) return;
    let alive = true;
    getActiveBanners().then((b) => { if (alive) setBanners(b); });
    return () => { alive = false; };
  }, [isHome]);

  // Primer banner activo de cada posición.
  const pick = (slot: AdBannerSlot) => banners.find((b) => b.slot === slot);
  const left = pick('LEFT');
  const right = pick('RIGHT');
  const bottom = pick('BOTTOM');

  // Reserva espacio inferior para que la barra fija no tape el contenido/footer.
  useEffect(() => {
    const show = !isHome && !!bottom;
    document.body.style.paddingBottom = show ? '15vh' : '';
    return () => { document.body.style.paddingBottom = ''; };
  }, [isHome, bottom]);

  if (isHome) return null;

  return (
    <>
      {left && <SideRail banner={left} side="left" />}
      {right && <SideRail banner={right} side="right" />}
      {bottom && <BottomBar banner={bottom} />}
    </>
  );
}

/* Enlace de afiliado (abre en pestaña nueva, marcado como patrocinado). */
function AdLink({ banner, className, imgClassName, width, height }: { banner: AdBanner; className?: string; imgClassName?: string; width: number; height: number }) {
  return (
    <a
      href={banner.link || '#'}
      target="_blank"
      rel="sponsored noopener noreferrer"
      aria-label={banner.title || 'Publicidad'}
      className={className}
    >
      {/* width/height intrínsecos reservan el aspecto y reducen CLS; lazy difiere la carga.
          eslint-disable-next-line @next/next/no-img-element */}
      <img src={banner.imageUrl} alt={banner.title || 'Publicidad'} width={width} height={height} loading="lazy" className={imgClassName} />
    </a>
  );
}

/* Riel lateral fijo (izquierdo o derecho). Oculto en pantallas estrechas
   (< 1536px) para no solaparse con el contenido centrado. */
function SideRail({ banner, side }: { banner: AdBanner; side: 'left' | 'right' }) {
  return (
    <aside
      className={`hidden 2xl:block fixed top-1/2 -translate-y-1/2 z-30 w-[160px] ${side === 'left' ? 'left-4' : 'right-4'}`}
      aria-hidden="false"
    >
      <div className="relative">
        <span className="absolute -top-4 left-0 text-[9px] uppercase tracking-wider text-slate-600">Publicidad</span>
        <AdLink
          banner={banner}
          width={160}
          height={600}
          className="block rounded-xl overflow-hidden border border-white/10 shadow-lg hover:border-white/25 transition-colors"
          imgClassName="w-full h-auto object-contain bg-[#040a18]"
        />
      </div>
    </aside>
  );
}

/* Barra horizontal fija inferior — ocupa el 15% del alto de la pantalla. */
function BottomBar({ banner }: { banner: AdBanner }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 h-[15vh] bg-[#040a18]/95 backdrop-blur border-t border-white/10 flex items-center justify-center px-4">
      <span className="absolute top-1 left-2 text-[9px] uppercase tracking-wider text-slate-600">Publicidad</span>
      <AdLink
        banner={banner}
        width={970}
        height={250}
        className="flex items-center h-full"
        imgClassName="h-full max-h-[15vh] w-auto max-w-full object-contain"
      />
    </div>
  );
}
