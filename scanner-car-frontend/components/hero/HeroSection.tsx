'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import SearchBox from '@/components/SearchBox';
import { getDict } from '@/lib/i18n';
import { useLocale, useLocalizedHref } from '@/components/LocaleProvider';

const EXAMPLE_CODES = ['P0420', 'P0300', 'P0171', 'P0301', 'P0442'];

export default function HeroSection() {
  const t = getDict(useLocale()).home;
  const localizedHref = useLocalizedHref();
  const [bgErr, setBgErr] = useState(false);
  const [carErr, setCarErr] = useState(false);

  return (
    <section id="buscar" className="relative overflow-hidden">
      {/* ══ Fondo a sangre completa de toda la sección ══ */}
      {!bgErr && (
        <Image
          src="/assets/carweb/hero-background.webp"
          alt=""
          fill
          priority
          className="object-cover opacity-50"
          onError={() => setBgErr(true)}
        />
      )}
      <div className="absolute inset-0 cw-grid cw-grid-fade animate-grid opacity-30" />
      <div className="absolute inset-0 cw-radial" />

      {/* ══ Vehículo (composite completo) — sangra arriba/derecha ══
          La imagen YA trae etiquetas + panel del escáner.
          Sólo se difumina el borde izquierdo e inferior para fundirla. */}
      {!carErr ? (
        <div className="absolute top-4 right-0 w-[56%] max-w-[920px] hidden md:block pointer-events-none select-none z-[1]">
          <Image
            src="/assets/carweb/hero-car.webp"
            alt="Diagnóstico OBD2 holográfico"
            width={1536}
            height={1024}
            priority
            className="w-full h-auto"
            style={{
              WebkitMaskImage:
                'linear-gradient(to right, transparent 0%, #000 22%), linear-gradient(to bottom, #000 78%, transparent 100%)',
              WebkitMaskComposite: 'source-in',
              maskImage:
                'linear-gradient(to right, transparent 0%, #000 22%), linear-gradient(to bottom, #000 78%, transparent 100%)',
              maskComposite: 'intersect',
            }}
            onError={() => setCarErr(true)}
          />
        </div>
      ) : (
        <CarPlaceholder />
      )}

      {/* Degradados que funden fondo + carro hacia el texto y hacia abajo */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/85 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#020617] to-transparent" />
      <div className="absolute -top-32 right-0 w-[36rem] h-[36rem] bg-[#00d4ff]/10 rounded-full blur-[120px]" />

      {/* ══ Contenido (texto + buscador) ══ */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4 lg:pb-5">
        <motion.div
          className="max-w-xl lg:max-w-2xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          {/* Título */}
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.04] mb-3">
            <span className="text-white">{t.heroTitlePre}</span>
            <span className="holo-text text-glow-neon">{t.heroTitleHl}</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 mb-5 max-w-lg leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* Buscador */}
          <div className="max-w-xl">
            <SearchBox />
          </div>

          {/* Ejemplos */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <span className="text-sm text-slate-500">{t.heroPopular}</span>
            {EXAMPLE_CODES.map((c) => (
              <Link
                key={c}
                href={localizedHref(`/code/${c}`)}
                className="px-3 py-1 font-mono text-sm text-neon border border-neon/30 rounded-lg hover:bg-neon/10 hover:border-neon/50 transition-all"
              >
                {c}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CarPlaceholder() {
  return (
    <div className="absolute top-1/2 right-8 -translate-y-1/2 hidden md:block pointer-events-none z-[1]">
      <div className="glass-strong rounded-2xl p-6 text-center w-72" style={{ border: '1px solid #00d4ff30' }}>
        <p className="text-neon text-sm font-bold font-mono mb-1">hero-car.webp</p>
        <p className="text-slate-400 text-xs">
          Render del vehículo.<br />Colocar en <span className="text-neon">/public/assets/carweb/</span>
        </p>
      </div>
    </div>
  );
}
