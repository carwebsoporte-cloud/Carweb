'use client';

import { useEffect, useState } from 'react';
import { ADS_ENABLED, ADSTERRA_BANNERS, ADSTERRA_BANNER_HOST, type AdsterraBannerFormat } from '@/lib/ads';

/* Adsterra iframe banner. Each unit relies on a global `atOptions`, so several
   banners on the same page would overwrite each other. Rendering every unit in
   its own srcdoc iframe isolates that global. */

function bannerDocument(format: AdsterraBannerFormat): string {
  const { key, width, height } = ADSTERRA_BANNERS[format];
  return `<!doctype html><html><head><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body>
<script>atOptions={'key':'${key}','format':'iframe','height':${height},'width':${width},'params':{}};</script>
<script src="${ADSTERRA_BANNER_HOST}/${key}/invoke.js"></script>
</body></html>`;
}

function BannerFrame({ format }: { format: AdsterraBannerFormat }) {
  const { width, height } = ADSTERRA_BANNERS[format];
  return (
    <iframe
      title="Advertisement"
      srcDoc={bannerDocument(format)}
      width={width}
      height={height}
      loading="lazy"
      scrolling="no"
      style={{ border: 0, display: 'block', maxWidth: '100%' }}
    />
  );
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
      {resolved && <BannerFrame key={resolved} format={resolved} />}
    </div>
  );
}
