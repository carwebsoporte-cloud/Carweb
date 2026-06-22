import type { NextConfig } from "next";

// Cabeceras de seguridad aplicadas a todas las rutas. Sin CSP por ahora: el
// sitio usa estilos en línea (style={}), scripts inline de JSON-LD y GA, por lo
// que una CSP estricta requiere su propia iteración con nonces.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    // Permite rutas locales de /public (fill + priority sin dominio externo)
    localPatterns: [
      { pathname: '/assets/carweb/**' },
      { pathname: '/logos/**' },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
