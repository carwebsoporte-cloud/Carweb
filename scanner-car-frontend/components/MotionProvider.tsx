'use client';

import { MotionConfig } from 'framer-motion';

/* Hace que TODAS las animaciones de Framer Motion respeten
   la preferencia del sistema "prefers-reduced-motion". */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
