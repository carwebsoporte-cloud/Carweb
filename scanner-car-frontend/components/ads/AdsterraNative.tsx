'use client';

import { useEffect, useRef } from 'react';
import { ADS_ENABLED, ADSTERRA_NATIVE } from '@/lib/ads';

/* Adsterra native banner. The unit fills a fixed container id, so render at
   most one per page. The script is re-injected on every mount so it also works
   after client-side navigation. */
export default function AdsterraNative() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!ADS_ENABLED || !host) return;

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = ADSTERRA_NATIVE.src;
    host.appendChild(script);

    return () => {
      host.innerHTML = '';
    };
  }, []);

  if (!ADS_ENABLED) return null;

  return (
    <div ref={hostRef}>
      <div id={ADSTERRA_NATIVE.containerId} />
    </div>
  );
}
