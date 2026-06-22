import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CARWEB — Enciclopedia OBD2',
    short_name: 'CARWEB',
    description: 'Diagnóstico automotriz inteligente. Enciclopedia profesional de códigos OBD2.',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#00d4ff',
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
