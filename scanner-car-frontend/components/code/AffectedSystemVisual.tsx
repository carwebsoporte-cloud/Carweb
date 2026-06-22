/* Visual del sistema afectado — render holográfico + glow sobre la zona del vehículo
   según el código. Server component (next/image + animaciones CSS, sin JS de cliente). */

import Image from 'next/image';

type SystemKey = 'engine' | 'fuel' | 'ignition' | 'catalyst' | 'transmission' | 'ev' | 'chassis' | 'body' | 'network';

interface SystemInfo {
  key: SystemKey;
  label: string;
  part: string;
  color: string;
  desc: string;
}

export function getAffectedSystem(code: string): SystemInfo {
  const c = code.toUpperCase();
  const p3 = c.substring(0, 3);
  const letter = c[0];

  if (c === 'P0420' || c === 'P0430' || p3 === 'P04')
    return { key: 'catalyst', label: 'Sistema de Escape', part: 'Catalizador y sensores O₂', color: '#ff8c42', desc: 'La falla se localiza en la línea de escape: catalizador, sondas lambda (O₂) o sistema EGR.' };
  if (p3 === 'P03')
    return { key: 'ignition', label: 'Sistema de Encendido', part: 'Bujías, bobinas y cilindros', color: '#ff4d4d', desc: 'El problema afecta la combustión en uno o más cilindros: bujías, bobinas o inyectores.' };
  if (p3 === 'P00' || p3 === 'P01' || p3 === 'P02')
    return { key: 'fuel', label: 'Aire / Combustible', part: 'Inyección, MAF, MAP, O₂', color: '#00d4ff', desc: 'Relacionado con la mezcla aire-combustible: sensores de flujo, presión, inyectores o bomba.' };
  if (p3 === 'P07' || p3 === 'P08' || p3 === 'P09')
    return { key: 'transmission', label: 'Transmisión', part: 'Caja y solenoides', color: '#00ff88', desc: 'La avería está en la transmisión: solenoides, sensores de velocidad o presión de aceite.' };
  if (p3 === 'P0A' || p3 === 'P0B' || p3 === 'P0C' || p3 === 'P0D')
    return { key: 'ev', label: 'Sistema Híbrido / EV', part: 'Batería HV y motor eléctrico', color: '#00ff88', desc: 'Pertenece al sistema de alto voltaje: batería de tracción, inversor o motor eléctrico.' };
  if (letter === 'C')
    return { key: 'chassis', label: 'Chasis', part: 'ABS, frenos y suspensión', color: '#00ff88', desc: 'Afecta el chasis: sensores ABS, control de tracción, frenos o suspensión.' };
  if (letter === 'B')
    return { key: 'body', label: 'Carrocería', part: 'Confort y seguridad (SRS)', color: '#00d4ff', desc: 'Corresponde a la carrocería: airbags (SRS), climatización, cierre centralizado o iluminación.' };
  if (letter === 'U')
    return { key: 'network', label: 'Red CAN', part: 'Comunicación entre módulos', color: '#a78bfa', desc: 'Falla de comunicación en la red CAN: pérdida de datos entre las unidades de control (ECU).' };
  return { key: 'engine', label: 'Motor', part: 'Powertrain', color: '#ff8c42', desc: 'La falla pertenece al grupo motopropulsor (motor y gestión electrónica).' };
}

/* Posiciones de resaltado en % sobre el render EXPLOTADO:
   motor arriba-izq · transmisión abajo-izq · batería arriba-der ·
   suspensión der · escape centro-abajo · cabina centro */
type Spot = { x: number; y: number; size: 'lg' | 'md' | 'sm' };

function getSpots(key: SystemKey): Spot[] {
  switch (key) {
    case 'engine':
    case 'fuel':
    case 'ignition':
      return [{ x: 13, y: 24, size: 'lg' }];          // bloque motor (arriba-izq)
    case 'catalyst':
      return [{ x: 46, y: 70, size: 'md' }];          // escape (centro-abajo)
    case 'transmission':
      return [{ x: 13, y: 60, size: 'md' }];          // caja (abajo-izq)
    case 'ev':
      return [{ x: 87, y: 18, size: 'lg' }];          // batería HV (arriba-der)
    case 'chassis':
      return [{ x: 85, y: 49, size: 'lg' }];          // suspensión (der)
    case 'body':
      return [{ x: 47, y: 38, size: 'lg' }];          // cabina (centro)
    case 'network':
      return [{ x: 14, y: 25, size: 'sm' }, { x: 47, y: 38, size: 'sm' }, { x: 86, y: 20, size: 'sm' }];
    default:
      return [{ x: 13, y: 24, size: 'lg' }];
  }
}

const GLOW = { lg: 'w-28 h-28 sm:w-36 sm:h-36', md: 'w-20 h-20 sm:w-28 sm:h-28', sm: 'w-14 h-14 sm:w-20 sm:h-20' };
const RING = { lg: 'w-14 h-14 sm:w-20 sm:h-20', md: 'w-11 h-11 sm:w-14 sm:h-14', sm: 'w-8 h-8 sm:w-10 sm:h-10' };

export default function AffectedSystemVisual({ code }: { code: string }) {
  const sys = getAffectedSystem(code);
  const spots = getSpots(sys.key);
  const color = sys.color;

  return (
    <div className="glass rounded-2xl p-6 sm:p-8 overflow-hidden relative">
      <div className="absolute inset-0 cw-grid cw-grid-fade opacity-20 pointer-events-none" />

      {/* Encabezado */}
      <div className="relative flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}1a`, border: `1px solid ${color}40` }}
        >
          <svg className="w-5 h-5" fill="none" stroke={color} strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 17H3v-6l2-5h9l4 5h2a2 2 0 012 2v4h-2M9 17h6" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg leading-tight">Sistema Afectado</h3>
          <p className="text-sm" style={{ color }}>{sys.label} · {sys.part}</p>
        </div>
      </div>

      {/* Render holográfico + zona resaltada */}
      <div className="relative">
        <Image
          src="/assets/carweb/code-car-exploded.webp"
          alt={`Vehículo despiece — ${sys.label}`}
          width={1915}
          height={821}
          unoptimized
          className="w-full h-auto mix-blend-screen select-none pointer-events-none"
        />

        {/* Glow del catalizador/zona */}
        {spots.map((s, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
          >
            {/* Resplandor radial */}
            <div
              className={`${GLOW[s.size]} rounded-full animate-pulse-glow`}
              style={{ background: `radial-gradient(circle, ${color}77 0%, ${color}22 45%, transparent 70%)` }}
            />
            {/* Anillo punteado */}
            <div
              className={`${RING[s.size]} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse-glow`}
              style={{ border: `2px dashed ${color}`, boxShadow: `0 0 12px ${color}66` }}
            />
            {/* Punto central */}
            <div
              className="w-2.5 h-2.5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: color, boxShadow: `0 0 10px ${color}` }}
            />
          </div>
        ))}
      </div>

      <p className="relative text-slate-400 text-sm mt-4 leading-relaxed border-l-2 pl-3" style={{ borderColor: `${color}66` }}>
        {sys.desc}
      </p>
    </div>
  );
}
