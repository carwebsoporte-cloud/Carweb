'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { getDict } from '@/lib/i18n';
import { useLocale, useLocalizedHref } from '@/components/LocaleProvider';

const ICONS = [
  'M8.25 7.5l.415-.207a.75.75 0 011.085.67V10.5m0 0h6m-6 0h-1.5m1.5 0v5.25a.75.75 0 001.085.67L11.25 16.5m0-6V21m0-10.5a.75.75 0 011.5 0M6.75 7.5h10.5a2.25 2.25 0 012.25 2.25v6a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25v-6A2.25 2.25 0 016.75 7.5z',
  'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
  'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085',
  'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
];
const COLORS = ['#00d4ff', '#00ff88', '#ff8c42', '#a78bfa'];

export default function HowItWorks() {
  const t = getDict(useLocale()).home;
  const localizedHref = useLocalizedHref();
  const STEPS = [
    { n: '1', title: t.hiwS1T, desc: t.hiwS1D, color: COLORS[0], icon: ICONS[0] },
    { n: '2', title: t.hiwS2T, desc: t.hiwS2D, color: COLORS[1], icon: ICONS[1] },
    { n: '3', title: t.hiwS3T, desc: t.hiwS3D, color: COLORS[2], icon: ICONS[2] },
    { n: '4', title: t.hiwS4T, desc: t.hiwS4D, color: COLORS[3], icon: ICONS[3] },
  ];

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
        <div className="flex items-center gap-2">
          <span className="w-1 h-7 rounded-full bg-gradient-to-b from-[#00d4ff] to-[#00ff88]" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white">{t.hiwHeading}</h2>
        </div>
        <Link
          href={localizedHref('/guias')}
          className="inline-flex items-center gap-2 px-5 py-2.5 glass-strong rounded-xl text-sm font-semibold text-white hover:border-neon/40 transition-all"
        >
          {t.hiwViewGuides}
          <svg className="w-4 h-4 text-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.n}
            className="relative"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            {/* Conector horizontal (desktop) */}
            {i < STEPS.length - 1 && (
              <div className="hidden lg:block absolute top-5 left-[3.25rem] right-0 h-px bg-gradient-to-r from-white/15 to-transparent" />
            )}

            <div className="flex items-center gap-3 mb-3">
              <div className="relative shrink-0">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: `${s.color}14`, border: `1px solid ${s.color}33` }}
                >
                  <svg className="w-5 h-5" fill="none" stroke={s.color} strokeWidth={1.7} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                  </svg>
                </div>
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-[#020617]"
                  style={{ background: s.color }}
                >
                  {s.n}
                </span>
              </div>
              <h3 className="text-white font-semibold">{s.title}</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
