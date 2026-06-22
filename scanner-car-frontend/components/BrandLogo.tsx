'use client';

import Image from 'next/image';
import { useState } from 'react';

/* Logo de una marca de vehículo. Muestra el PNG autoalojado en
   /public/logos/<slug>.png sobre una placa blanca (para que los
   logos oscuros se vean bien en el tema oscuro). Si el logo no
   existe o falla la carga, cae a un monograma con la inicial; el
   fabricante genérico (SAE) usa el icono 🌐. */
export default function BrandLogo({
  slug,
  name,
  isGeneric = false,
  size = 40,
}: {
  slug: string;
  name: string;
  isGeneric?: boolean;
  size?: number;
}) {
  const [error, setError] = useState(false);
  const box = { width: size, height: size } as const;

  if (isGeneric) {
    return (
      <span className="inline-flex items-center justify-center rounded-lg bg-white/10 border border-white/10 shrink-0" style={box}>
        <span style={{ fontSize: size * 0.55, lineHeight: 1 }}>🌐</span>
      </span>
    );
  }

  if (error) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-slate-200 to-slate-400 text-slate-700 font-bold shrink-0"
        style={{ ...box, fontSize: size * 0.45 }}
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center rounded-lg bg-white shrink-0 overflow-hidden" style={box}>
      <span className="relative" style={{ width: size - 10, height: size - 10 }}>
        <Image
          src={`/logos/${slug}.png`}
          alt={`${name} logo`}
          fill
          sizes={`${size}px`}
          className="object-contain"
          onError={() => setError(true)}
        />
      </span>
    </span>
  );
}
