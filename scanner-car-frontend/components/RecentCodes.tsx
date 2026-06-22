'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { OBDCode } from '@/lib/types';
import { getDict } from '@/lib/i18n';
import { useLocale, useLocalizedHref } from '@/components/LocaleProvider';

const SEV_COLOR: Record<string, string> = {
  'Crítica/No conducir': '#ff4d4d',
  Moderada: '#ff8c42',
  Baja: '#00ff88',
};

export default function RecentCodes({ codes }: { codes: OBDCode[] }) {
  const t = getDict(useLocale()).home;
  const localizedHref = useLocalizedHref();
  if (!codes.length) return null;

  return (
    <section className="relative py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-diag" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-white">{t.recentHeading}</h2>
          </div>
          <Link href={localizedHref('/buscar')} className="text-sm text-neon font-semibold hover:text-white transition-colors flex items-center gap-1">
            {t.recentViewAll}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {codes.slice(0, 10).map((c, i) => {
            const color = SEV_COLOR[c.severity] ?? '#00d4ff';
            return (
              <motion.div
                key={c.code}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <Link
                  href={localizedHref(`/code/${c.code}`)}
                  className="group block glass rounded-xl p-4 h-full hover:border-neon/40 transition-all hover:-translate-y-0.5"
                  title={c.title}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-neon group-hover:text-white transition-colors">{c.code}</span>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                  </div>
                  <p className="text-slate-400 text-xs leading-snug line-clamp-2">{c.title}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
