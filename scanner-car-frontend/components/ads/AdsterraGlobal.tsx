'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { ADS_ENABLED, ADSTERRA_SOCIAL_BAR_SRC, isAdFreePath } from '@/lib/ads';

/* Site-wide Adsterra social bar, loaded once after the page becomes
   interactive so it never blocks rendering. Click-anywhere redirect formats
   (popunder) are intentionally excluded. */
export default function AdsterraGlobal() {
  const pathname = usePathname();
  if (!ADS_ENABLED || isAdFreePath(pathname)) return null;

  return <Script id="adsterra-social-bar" src={ADSTERRA_SOCIAL_BAR_SRC} strategy="afterInteractive" />;
}
