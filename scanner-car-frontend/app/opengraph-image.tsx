import { ImageResponse } from 'next/og';

export const alt = 'CARWEB — Enciclopedia de códigos OBD2';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Tarjeta social por defecto (1200×630) para todas las páginas sin OG propia.
// Las fichas de código tienen su propia imagen dinámica (app/code/.../opengraph-image).
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '70px 90px',
          background: 'linear-gradient(135deg, #020617 0%, #0a1628 50%, #020617 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: -140, right: -120, width: 520, height: 520, borderRadius: '50%', background: '#00d4ff18', filter: 'blur(90px)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 360, height: 360, borderRadius: '50%', background: '#00ff8814', filter: 'blur(70px)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 28 }}>
          <span style={{ fontSize: 64, fontWeight: 900, color: '#00d4ff', letterSpacing: '-0.02em' }}>CAR</span>
          <span style={{ fontSize: 64, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.02em' }}>WEB</span>
        </div>

        <div style={{ fontSize: 52, fontWeight: 800, color: '#f1f5f9', lineHeight: 1.1, maxWidth: 920, marginBottom: 24 }}>
          Enciclopedia profesional de códigos OBD2
        </div>

        <div style={{ fontSize: 30, fontWeight: 500, color: '#94a3b8', lineHeight: 1.35, maxWidth: 880 }}>
          Encuentra cualquier código de falla, comprende la avería y descubre la solución paso a paso.
        </div>

        <div style={{ width: 90, height: 5, borderRadius: 3, background: 'linear-gradient(to right, #00d4ff, transparent)', margin: '34px 0 26px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 26, color: '#64748b' }}>
          <span style={{ color: '#00d4ff', fontWeight: 700 }}>carweb.com.co</span>
          <span>· Diagnóstico automotriz inteligente</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
