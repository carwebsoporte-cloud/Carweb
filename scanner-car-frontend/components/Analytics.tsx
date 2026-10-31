'use client';

import { Suspense, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const pagePath = `${pathname}${search ? `?${search}` : ''}`;
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastTrackedPath.current === pagePath) return;
    lastTrackedPath.current = pagePath;

    const analyticsWindow = window as AnalyticsWindow;
    analyticsWindow.dataLayer ??= [];
    analyticsWindow.gtag ??= (...args: unknown[]) => {
      analyticsWindow.dataLayer?.push(args);
    };
    analyticsWindow.gtag('event', 'page_view', {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pagePath, pathname]);

  return null;
}

export default function Analytics() {
  if (!GA_ID) return null;

  const gaId = JSON.stringify(GA_ID);

  return (
    <>
      {/* Acelera la carga de GA: resuelve DNS y abre conexión por adelantado. */}
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
           window.dataLayer = window.dataLayer || [];
           window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
           window.gtag('js', new Date());
           window.gtag('config', ${gaId}, { send_page_view: false });
         `}
      </Script>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
