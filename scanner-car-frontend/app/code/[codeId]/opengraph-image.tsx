import { ImageResponse } from 'next/og';
import { getCodeByCode } from '@/lib/api';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const CAT_COLORS: Record<string, string> = {
  P: '#ff8c42', B: '#00d4ff', C: '#00ff88', U: '#a78bfa',
};
const CAT_NAMES: Record<string, string> = {
  P: 'POWERTRAIN', B: 'BODY', C: 'CHASSIS', U: 'NETWORK',
};

interface Props {
  params: Promise<{ codeId: string }>;
}

export default async function OpenGraphImage({ params }: Props) {
  const { codeId } = await params;
  const code = await getCodeByCode(codeId, 'es');
  const upper = (code?.code ?? codeId).toUpperCase();
  const letter = upper[0];
  const color = CAT_COLORS[letter] ?? '#00d4ff';
  const catName = CAT_NAMES[letter] ?? 'OBD2';
  const title = code?.title ?? upper;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
          background: 'linear-gradient(135deg, #020617 0%, #0a1628 50%, #020617 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: `${color}15`,
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: `${color}10`,
            filter: 'blur(60px)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              color,
              letterSpacing: '0.15em',
              padding: '8px 20px',
              borderRadius: 999,
              border: `2px solid ${color}44`,
              background: `${color}11`,
            }}
          >
            {catName}
          </span>
          <span style={{ fontSize: 16, color: '#64748b', letterSpacing: '0.1em' }}>OBD2 FAULT CODE</span>
        </div>

        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            fontFamily: 'monospace',
            color,
            textShadow: `0 0 40px ${color}44`,
            lineHeight: 1,
            marginBottom: 16,
            letterSpacing: '0.02em',
          }}
        >
          {upper}
        </div>

        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: '#f1f5f9',
            lineHeight: 1.2,
            maxWidth: 800,
            marginBottom: 32,
          }}
        >
          {title.length > 80 ? title.substring(0, 80) + '...' : title}
        </div>

        <div
          style={{
            width: 80,
            height: 4,
            borderRadius: 2,
            background: `linear-gradient(to right, ${color}, transparent)`,
            marginBottom: 24,
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: '#00d4ff' }}>CAR</span>
          <span style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>WEB</span>
          <span style={{ fontSize: 14, color: '#475569', marginLeft: 8 }}>carweb.com.co</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
