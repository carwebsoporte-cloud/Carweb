'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { OBDCode, getCategoryInfo } from '@/lib/types';
import { getDict } from '@/lib/i18n';
import { useLocale, useLocalizedHref } from './LocaleProvider';
import SeverityBadge from './SeverityBadge';

interface CodeCardProps {
  code: OBDCode;
  index?: number;
  // Si se da (y no es genérico), la tarjeta enlaza a la variante de esa marca.
  manufacturerSlug?: string;
}

const CATEGORY_COLOR: Record<string, string> = {
  P: '#ff8c42',
  B: '#00d4ff',
  C: '#00ff88',
  U: '#a78bfa',
};

export default function CodeCard({ code, index = 0, manufacturerSlug }: CodeCardProps) {
  const category = getCategoryInfo(code.code);
  const color = CATEGORY_COLOR[code.code[0]] ?? '#00d4ff';
  const t = getDict(useLocale());
  const localizedHref = useLocalizedHref();
  const href = manufacturerSlug
    ? localizedHref(`/code/${code.code}/${manufacturerSlug}`)
    : localizedHref(`/code/${code.code}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: (index % 6) * 0.06, duration: 0.45 }}
      whileHover={{ y: -6 }}
    >
      <Link
        href={href}
        className="group relative block glass rounded-2xl p-6 h-full overflow-hidden transition-all duration-300"
      >
        {/* Halo */}
        <div
          className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-50 transition-opacity duration-300"
          style={{ background: color }}
        />
        {/* Borde glow hover */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: `inset 0 0 0 1px ${color}55` }}
        />

        <div className="relative">
          {/* Top row */}
          <div className="flex items-start justify-between mb-3">
            <span className="font-mono text-3xl font-extrabold tracking-tight" style={{ color, textShadow: `0 0 16px ${color}40` }}>
              {code.code}
            </span>
            <SeverityBadge severity={code.severity} size="sm" />
          </div>

          <h3 className="text-white font-semibold leading-snug group-hover:text-neon transition-colors line-clamp-2">
            {code.title}
          </h3>

          <p className="text-slate-500 text-xs mt-2 uppercase tracking-wide">{category.shortName}</p>

          {code.description && (
            <p className="text-slate-400 text-sm mt-3 line-clamp-2">
              {code.description.substring(0, 110)}…
            </p>
          )}

          <div className="mt-4 flex items-center text-sm font-medium" style={{ color }}>
            {t.card.viewDiagnostic}
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
