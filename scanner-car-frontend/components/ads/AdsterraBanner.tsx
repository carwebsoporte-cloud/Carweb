'use client';

import { useEffect, useRef, useState } from 'react';
import { ADS_ENABLED, ADSTERRA_BANNERS, ADSTERRA_BANNER_HOST, type AdsterraBannerFormat } from '@/lib/ads';

/* Adsterra iframe banner. Each invoke.js reads the global `atOptions` when it
   executes and renders the ad next to its own <script>. Several banners on the
   same page would overwrite that global, so loads are chained through a queue:
   set atOptions, inject the script, wait for it, then load the next one.
   (Isolating units in srcdoc iframes does not work: Adsterra serves no ad when
   the document URL is about:srcdoc.) */

declare global {
  interface Window {
    atOptions?: Record<string, unknown>;
  }
}

let loadQueue: Promise<void> = Promise.resolve();

function enqueueBanner(host: HTMLElement, format: AdsterraBannerFormat, isCancelled: () => boolean) {
  const { key, width, height } = ADSTERRA_BANNERS[format];
  loadQueue = loadQueue.then(
    () =>
      new Promise<void>((resolve) => {
        if (isCancelled() || !host.isConnected) return resolve();
        window.atOptions = { key, format: 'iframe', height, width, params: {} };
        const script = document.createElement('script');
        script.src = `${ADSTERRA_BANNER_HOST}/${key}/invoke.js`;
        script.onload = () => resolve();
        script.onerror = () => resolve();
        host.appendChild(script);
      }),
  );
}

function BannerUnit({ format }: { format: AdsterraBannerFormat }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    enqueueBanner(host, format, () => cancelled);
    return () => {
      cancelled = true;
      host.innerHTML = '';
    };
  }, [format]);

  return <div ref={hostRef} />;
}

/* `responsive` picks the 728x90 leaderboard on desktop and the 320x50 unit on
   mobile. Only one is mounted, so hidden units never count impressions. */
export default function AdsterraBanner({ format }: { format: AdsterraBannerFormat | 'responsive' }) {
  const [resolved, setResolved] = useState<AdsterraBannerFormat | null>(
    format === 'responsive' ? null : format,
  );

  useEffect(() => {
    if (format !== 'responsive') return;
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setResolved(mq.matches ? 'leaderboard' : 'mobile');
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [format]);

  if (!ADS_ENABLED) return null;

  const height = resolved ? ADSTERRA_BANNERS[resolved].height : ADSTERRA_BANNERS.mobile.height;

  return (
    <div className="flex justify-center overflow-hidden" style={{ minHeight: height }}>
      {resolved && <BannerUnit key={resolved} format={resolved} />}
    </div>
  );
}
