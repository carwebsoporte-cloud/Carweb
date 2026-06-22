'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { OBDCategory } from '@/lib/types';
import { getDict, withLocale } from '@/lib/i18n';
import { useLocale } from '@/components/LocaleProvider';

const META: Record<string, { color: string; glow: string; img: string }> = {
  P: { color: '#ff4d4d', glow: 'rgba(255,77,77,0.35)',  img: '/assets/carweb/cat-motor.webp' },
  B: { color: '#00d4ff', glow: 'rgba(0,212,255,0.35)',  img: '/assets/carweb/cat-carroceria.webp' },
  C: { color: '#00ff88', glow: 'rgba(0,255,136,0.35)', img: '/assets/carweb/cat-chasis.webp' },
  U: { color: '#a78bfa', glow: 'rgba(167,139,250,0.35)', img: '/assets/carweb/cat-red.webp' },
};

const ORDER = ['P', 'B', 'C', 'U'] as const;

export default function CategoryGrid({ categories }: { categories: OBDCategory[] }) {
  const locale = useLocale();
  const t = getDict(locale);
  const SUBS: Record<string, string> = { P: t.home.catSubP, B: t.home.catSubB, C: t.home.catSubC, U: t.home.catSubU };

  const countByCode: Record<string, number> = {};
  for (const cat of categories) countByCode[cat.code] = cat._count?.codes ?? 0;

  const cards = ORDER.map((code) => ({
    code,
    count: countByCode[code] ?? 0,
    name: t.categories[code],
    sub: SUBS[code],
    locale,
    viewCodes: t.home.catViewCodes,
    codesSuffix: t.home.catCodesSuffix,
    ...META[code],
  }));
  // Triplicamos para que en pantallas anchas siempre haya tarjetas y el loop sea fluido
  const loop = [...cards, ...cards, ...cards];

  const trackRef = useRef<HTMLDivElement>(null);
  const downRef = useRef(false);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const capturedRef = useRef(false);
  const dragStart = useRef({ x: 0, scroll: 0 });
  const reduceRef = useRef(false);

  /* Detectar prefers-reduced-motion */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduceRef.current = mq.matches;
    const h = () => { reduceRef.current = mq.matches; };
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  /* Posición inicial en el primer tercio (permite arrastrar en ambos sentidos) */
  useEffect(() => {
    const el = trackRef.current;
    if (el) el.scrollLeft = el.scrollWidth / 3;
  }, []);

  /* Loop infinito normalizando al tercio central */
  const normalize = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const third = el.scrollWidth / 3;
    if (el.scrollLeft <= third * 0.5) el.scrollLeft += third;
    else if (el.scrollLeft >= third * 2) el.scrollLeft -= third;
  }, []);

  /* Auto-scroll continuo (rAF) */
  useEffect(() => {
    let raf = 0;
    const step = () => {
      const el = trackRef.current;
      if (el && !draggingRef.current && !reduceRef.current) {
        el.scrollLeft += 0.6;
        normalize();
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [normalize]);

  /* ── Arrastre con cursor ──
     NO capturamos el puntero en pointerdown (rompería el clic en el enlace).
     Sólo capturamos cuando el movimiento supera el umbral (arrastre real). */
  const onPointerDown = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el) return;
    downRef.current = true;
    draggingRef.current = true; // pausa el auto-scroll mientras se sostiene
    movedRef.current = false;
    capturedRef.current = false;
    dragStart.current = { x: e.clientX, scroll: el.scrollLeft };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!downRef.current) return;
    const el = trackRef.current;
    if (!el) return;
    const dx = e.clientX - dragStart.current.x;
    if (Math.abs(dx) > 5) {
      movedRef.current = true;
      if (!capturedRef.current) {
        el.setPointerCapture?.(e.pointerId);
        capturedRef.current = true;
      }
    }
    if (movedRef.current) el.scrollLeft = dragStart.current.scroll - dx;
  };
  const endDrag = (e?: React.PointerEvent) => {
    if (!downRef.current) return;
    downRef.current = false;
    draggingRef.current = false;
    if (capturedRef.current && e) {
      trackRef.current?.releasePointerCapture?.(e.pointerId);
    }
    capturedRef.current = false;
    normalize();
  };
  /* Evita navegar si el usuario estaba arrastrando */
  const onClickCapture = (e: React.MouseEvent) => {
    if (movedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      movedRef.current = false;
    }
  };

  return (
    <div>
      {/* Carrusel a todo el ancho, arrastrable */}
      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-20 z-10 bg-gradient-to-r from-[#020617] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-20 z-10 bg-gradient-to-l from-[#020617] to-transparent" />

        <div
          ref={trackRef}
          className="flex gap-5 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none py-1"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
          onClickCapture={onClickCapture}
        >
          {loop.map((card, i) => (
            <div key={`${card.code}-${i}`} className="w-[300px] sm:w-[340px] shrink-0">
              <CategoryCard {...card} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryCard({
  code, name, sub, color, glow, img, count, locale, viewCodes, codesSuffix,
}: {
  code: string; name: string; sub: string; color: string; glow: string; img: string; count: number;
  locale: 'es' | 'en'; viewCodes: string; codesSuffix: string;
}) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <Link
      href={withLocale(`/category/${code}`, locale)}
      draggable={false}
      className="group relative block rounded-2xl overflow-hidden h-[380px] transition-all duration-300 hover:-translate-y-1"
      style={{ border: `1px solid ${color}22` }}
    >
      {!imgErr ? (
        <Image
          src={img}
          alt={name}
          fill
          draggable={false}
          sizes="340px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgErr(true)}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: `${color}10` }} />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/55 to-transparent" />
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: `inset 0 0 0 1px ${color}66, inset 0 -70px 90px -40px ${glow}` }}
      />

      <div className="absolute top-4 left-4 z-10">
        <div
          className="w-12 h-12 flex items-center justify-center font-mono text-xl font-black"
          style={{
            color,
            background: `${color}22`,
            border: `1.5px solid ${color}`,
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            boxShadow: `0 0 18px ${color}55`,
          }}
        >
          {code}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 z-10">
        <h3 className="text-white font-bold text-xl leading-tight">{name}</h3>
        <p className="text-slate-300 text-sm mt-1 leading-snug line-clamp-2">{sub}</p>
        <div
          className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all group-hover:gap-3"
          style={{ background: `${color}1a`, color }}
        >
          {count > 0 ? `${count}+ ${codesSuffix}` : viewCodes}
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
