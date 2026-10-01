'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { ADS_ENABLED, ADSTERRA_POPUNDER_SRC, ADSTERRA_SOCIAL_BAR_SRC, isAdFreePath } from '@/lib/ads';

/* Site-wide Adsterra formats (popunder + social bar), loaded once after the
   page becomes interactive so they never block rendering. */
export default function AdsterraGlobal() {
  const pathname = usePathname();
  if (!ADS_ENABLED || isAdFreePath(pathname)) return null;

  return (
    <>
      <Script id="adsterra-popunder" src={ADSTERRA_POPUNDER_SRC} strategy="afterInteractive" />
      <Script id="adsterra-social-bar" src={ADSTERRA_SOCIAL_BAR_SRC} strategy="afterInteractive" />
    </>
  );
}
