import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { normalizeLocale, withLocale, getDict, esToEnPath, type Locale } from '@/lib/i18n';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://carweb.app';

async function getLocale(): Promise<Locale> {
  return normalizeLocale((await headers()).get('x-locale'));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const en = locale === 'en';
  const esUrl = `${SITE_URL}/guias`;
  const enPath = esToEnPath('/guias');
  const enUrl = `${SITE_URL}/en${enPath}`;
  const title = en ? 'OBD2 Guides | CARWEB — Automotive Diagnostics' : 'Guías OBD2 | CARWEB — Diagnóstico Automotriz';
  const description = en
    ? 'Complete guides to understand and diagnose OBD2 codes: how the system works, P·B·C·U prefixes, severity levels and diagnostics on electric and hybrid vehicles.'
    : 'Guías completas para entender y diagnosticar códigos OBD2: cómo funciona el sistema, prefijos P·B·C·U, niveles de severidad y diagnóstico en vehículos eléctricos e híbridos.';
  return {
    title,
    description,
    alternates: { canonical: en ? enUrl : esUrl, languages: { es: esUrl, en: enUrl, 'x-default': esUrl } },
    openGraph: { title, description, type: 'website', locale: en ? 'en_US' : 'es_ES', url: en ? enUrl : esUrl },
  };
}

// ── Contenido editorial bilingüe (co-ubicado, no en el diccionario compartido) ──
const CONTENT = {
  es: {
    eyebrow: 'Centro de conocimiento', titlePre: 'Guías de ', titleHl: 'Diagnóstico OBD2',
    subtitle: 'Todo lo que necesitas saber para leer, entender y resolver los códigos de falla de tu vehículo.',
    stats: ['6 guías', 'Lectura ~8 min', 'Actualizado 2025'],
    quickNav: [
      { id: 'que-es-obd2', label: '¿Qué es OBD2?', color: '#00d4ff' },
      { id: 'como-usar', label: 'Usar un escáner', color: '#00ff88' },
      { id: 'prefijos', label: 'Prefijos P·B·C·U', color: '#ff8c42' },
      { id: 'severidad', label: 'Severidad', color: '#ff4d4d' },
      { id: 'comunes', label: 'Más comunes', color: '#00d4ff' },
      { id: 'electricos', label: 'EV e Híbridos', color: '#a855f7' },
    ],
    s1: { title: '¿Qué es OBD2?', sub: 'Introducción al sistema de autodiagnóstico',
      p: [
        'OBD2 (On-Board Diagnostics, 2.ª generación) es el estándar universal de autodiagnóstico electrónico presente en todos los vehículos vendidos en EE.UU. desde 1996 y en Europa desde 2001. Su función es monitorear continuamente los sistemas del vehículo y alertar al conductor cuando algún componente opera fuera de parámetros normales.',
        'Cuando el sistema detecta una anomalía, almacena un DTC (Diagnostic Trouble Code) en la memoria del ECU y enciende la luz "Check Engine" o MIL (Malfunction Indicator Lamp). Estos códigos son accesibles a través del puerto OBD2, ubicado bajo el tablero del conductor — generalmente a la izquierda del volante.',
        'El estándar define cinco protocolos de comunicación. El más moderno es ISO 15765-4 (CAN bus), utilizado en prácticamente todos los vehículos fabricados desde 2008 y el protocolo de referencia de CARWEB.',
      ],
      calloutTitle: 'Puerto OBD2',
      callout: 'El conector OBD2 es un conector trapezoidal de 16 pines estandarizado por SAE J1962. Siempre está dentro del habitáculo del vehículo, a menos de 60 cm del volante, y es accesible sin herramientas.' },
    s2: { title: 'Cómo usar un escáner OBD2', sub: 'Pasos para leer códigos de falla correctamente',
      steps: [
        { title: 'Localiza el puerto OBD2', desc: 'Busca el conector de 16 pines bajo el tablero, en el lado del conductor. En la mayoría de vehículos no necesitas herramientas para acceder a él.' },
        { title: 'Conecta el escáner', desc: 'Inserta el lector OBD2 en el puerto con el vehículo apagado. Los lectores Bluetooth se emparejan con tu smartphone; los de pantalla integrada funcionan de forma autónoma.' },
        { title: 'Enciende el contacto sin arrancar', desc: 'Gira la llave a posición II (ACC/ON) sin iniciar el motor. Esto energiza la electrónica del vehículo y permite la comunicación con el ECU.' },
        { title: 'Lee los códigos guardados', desc: 'En el escáner, selecciona "Leer códigos" o "Read Codes". El sistema mostrará todos los DTCs activos y pendientes almacenados en la memoria del ECU.' },
        { title: 'Busca cada código en CARWEB', desc: 'Anota el código exacto (ej: P0420) y búscalo para ver descripción completa, causas probables, síntomas asociados y soluciones paso a paso.' },
        { title: 'Repara y verifica', desc: 'Tras la reparación, borra los códigos con "Clear Codes" y conduce el vehículo en los ciclos de conducción recomendados. Si el código no regresa, la reparación fue exitosa.' },
      ],
      calloutTitle: 'Check Engine parpadeante',
      callout: 'Si la luz Check Engine parpadea en lugar de quedarse fija, indica un fallo activo grave — generalmente un misfiring severo que puede dañar el catalizador en minutos. Reduce la velocidad y detente de forma segura lo antes posible.' },
    s3: { title: 'Prefijos P · B · C · U', sub: 'Qué significa cada letra en un código OBD2',
      intro: 'El primer carácter de un código OBD2 indica el sistema del vehículo donde se originó la falla. El segundo carácter indica si el código es genérico (0) o específico del fabricante (1, 2, 3).',
      cards: [
        { prefix: 'P', label: 'Powertrain', range: 'P0000 – P3FFF', color: '#ff4d4d', desc: 'Motor, transmisión, sistema de combustible y control de emisiones. Representan más del 80% de los DTCs en diagnóstico cotidiano.' },
        { prefix: 'B', label: 'Body', range: 'B0000 – B3FFF', color: '#00d4ff', desc: 'Carrocería, airbags, cinturones, climatización automática, ventanas y espejos eléctricos.' },
        { prefix: 'C', label: 'Chassis', range: 'C0000 – C3FFF', color: '#00ff88', desc: 'ABS, control de estabilidad (ESC/VSC), dirección asistida electrónica y suspensión activa. Críticos para la seguridad.' },
        { prefix: 'U', label: 'Network', range: 'U0000 – U3FFF', color: '#a855f7', desc: 'Red CAN y comunicación entre módulos (ECU, TCM, BCM, ABS). Un fallo aquí puede encender múltiples luces simultáneamente.' },
      ],
      calloutTitle: 'Genérico vs. fabricante',
      callout: 'P0xxx = Código SAE genérico, estándar universal. P1xxx / P2xxx / P3xxx = Código OEM del fabricante — los mismos números pueden significar cosas distintas en Toyota vs. Ford vs. BMW.' },
    s4: { title: 'Niveles de severidad', sub: '¿Cuándo es urgente y cuándo puedes esperar?',
      items: [
        { level: 'Baja', icon: '✓', color: '#00ff88', desc: 'El vehículo puede funcionar con normalidad. El código registrado es informativo o corresponde a una falla intermitente. Planifica la revisión dentro de las próximas semanas para evitar que el problema escale.' },
        { level: 'Moderada', icon: '!', color: '#ff8c42', desc: 'El sistema afectado opera por debajo de sus parámetros óptimos. Conducir con este código puede degradar el rendimiento, aumentar el consumo de combustible o dañar componentes relacionados. Revisa lo antes posible.' },
        { level: 'Alta / Crítica — No conducir', icon: '⚠', color: '#ff4d4d', desc: 'Riesgo de daño permanente al motor, catalizador u otros componentes costosos. En algunos casos implica riesgo para la seguridad. No conduzcas hasta resolver el problema.' },
      ] },
    s5: { title: 'Los 5 códigos más comunes', sub: 'Los DTCs que aparecen con mayor frecuencia en taller',
      codes: [
        { code: 'P0420', sev: 'Moderada', sevColor: '#ff8c42', title: 'Eficiencia del catalizador por debajo del umbral — Banco 1', desc: 'El sensor de oxígeno post-catalizador detecta que el catalizador no reduce emisiones correctamente. Causas habituales: catalizador desgastado, sensor lambda defectuoso o fuga en el escape.' },
        { code: 'P0300', sev: 'Alta', sevColor: '#ff4d4d', title: 'Fallo de encendido detectado — múltiples cilindros', desc: 'Uno o más cilindros no detonan correctamente. Bujías deterioradas, bobinas de encendido, inyectores o problema de compresión. Si la luz parpadea: detente de inmediato.' },
        { code: 'P0171', sev: 'Moderada', sevColor: '#ff8c42', title: 'Mezcla de combustible demasiado pobre — Banco 1', desc: 'La mezcla aire/combustible tiene exceso de aire. Fuga de vacío, sensor MAF contaminado, inyectores obstruidos o bomba de combustible débil son las causas más frecuentes.' },
        { code: 'P0128', sev: 'Baja', sevColor: '#00ff88', title: 'Temperatura del refrigerante por debajo del umbral del termostato', desc: 'El motor tarda demasiado en alcanzar temperatura de operación. Causa casi siempre: termostato defectuoso que queda abierto. Afecta consumo y emisiones.' },
        { code: 'P0442', sev: 'Baja', sevColor: '#00ff88', title: 'Fuga evaporativa pequeña detectada en el sistema EVAP', desc: 'Pequeña fuga en el sistema de control de vapores de combustible. Lo más frecuente: tapón del depósito mal cerrado o con empaque desgastado. Verifica antes de cambiar componentes costosos.' },
      ] },
    s6: { title: 'Vehículos eléctricos e híbridos', sub: 'Códigos P0A–P0D y diagnóstico de alto voltaje',
      intro: 'Los vehículos eléctricos e híbridos generan códigos adicionales en el rango P0A00–P0D99, definidos por el estándar SAE J2012. CARWEB incluye todos estos códigos curados con sus causas y soluciones específicas.',
      cards: [
        { range: 'P0A0x', system: 'Batería de tracción', desc: 'Pack de baterías de alto voltaje, celdas, BMS (Battery Management System).' },
        { range: 'P0B0x', system: 'Sistema de carga', desc: 'Cargador a bordo (OBC), puerto de carga, carga rápida DC.' },
        { range: 'P0C0x', system: 'Motor eléctrico de tracción', desc: 'Motor de tracción, generador en híbridos, motores MG1/MG2.' },
        { range: 'P0D0x', system: 'Inversor / Convertidor', desc: 'Módulo de potencia, convertidor DC/DC, sistema de refrigeración del inversor.' },
      ],
      calloutTitle: '⚡ Advertencia — Alto voltaje',
      callout: 'Los sistemas de propulsión eléctrica operan entre 200 V y 800 V. El diagnóstico avanzado de baterías de tracción, inversores y motores debe ser realizado exclusivamente por técnicos con certificación HV (High Voltage) y con equipo de protección personal adecuado (guantes clase 0, herramientas aisladas).' },
    cta: { title: '¿Tienes un código en tu vehículo?', body: 'Busca el DTC exacto en nuestra base de 438+ códigos o usa el diagnóstico guiado para identificar el sistema afectado.', search: 'Buscar código OBD2', diag: 'Diagnóstico guiado →' },
  },
  en: {
    eyebrow: 'Knowledge center', titlePre: 'OBD2 ', titleHl: 'Diagnostic Guides',
    subtitle: 'Everything you need to read, understand and fix your vehicle fault codes.',
    stats: ['6 guides', '~8 min read', 'Updated 2025'],
    quickNav: [
      { id: 'que-es-obd2', label: 'What is OBD2?', color: '#00d4ff' },
      { id: 'como-usar', label: 'Using a scanner', color: '#00ff88' },
      { id: 'prefijos', label: 'P·B·C·U prefixes', color: '#ff8c42' },
      { id: 'severidad', label: 'Severity', color: '#ff4d4d' },
      { id: 'comunes', label: 'Most common', color: '#00d4ff' },
      { id: 'electricos', label: 'EV & Hybrid', color: '#a855f7' },
    ],
    s1: { title: 'What is OBD2?', sub: 'Introduction to the self-diagnostic system',
      p: [
        'OBD2 (On-Board Diagnostics, 2nd generation) is the universal electronic self-diagnostic standard present in all vehicles sold in the US since 1996 and in Europe since 2001. Its job is to continuously monitor the vehicle systems and alert the driver when a component operates outside normal parameters.',
        'When the system detects an anomaly, it stores a DTC (Diagnostic Trouble Code) in the ECU memory and turns on the "Check Engine" light or MIL (Malfunction Indicator Lamp). These codes are accessible through the OBD2 port, located under the driver dashboard — usually to the left of the steering wheel.',
        'The standard defines five communication protocols. The most modern is ISO 15765-4 (CAN bus), used in practically all vehicles built since 2008 and CARWEB reference protocol.',
      ],
      calloutTitle: 'OBD2 port',
      callout: 'The OBD2 connector is a 16-pin trapezoidal connector standardized by SAE J1962. It is always inside the vehicle cabin, less than 60 cm from the steering wheel, and accessible without tools.' },
    s2: { title: 'How to use an OBD2 scanner', sub: 'Steps to read fault codes correctly',
      steps: [
        { title: 'Locate the OBD2 port', desc: 'Look for the 16-pin connector under the dashboard, on the driver side. On most vehicles you do not need tools to reach it.' },
        { title: 'Connect the scanner', desc: 'Plug the OBD2 reader into the port with the vehicle off. Bluetooth readers pair with your smartphone; built-in screen readers work standalone.' },
        { title: 'Turn the ignition on without starting', desc: 'Turn the key to position II (ACC/ON) without starting the engine. This powers the vehicle electronics and allows communication with the ECU.' },
        { title: 'Read the stored codes', desc: 'On the scanner, select "Read Codes". The system will show all active and pending DTCs stored in the ECU memory.' },
        { title: 'Look up each code on CARWEB', desc: 'Write down the exact code (e.g. P0420) and search it to see the full description, probable causes, associated symptoms and step-by-step fixes.' },
        { title: 'Repair and verify', desc: 'After the repair, clear the codes with "Clear Codes" and drive the vehicle through the recommended drive cycles. If the code does not return, the repair was successful.' },
      ],
      calloutTitle: 'Flashing Check Engine',
      callout: 'If the Check Engine light flashes instead of staying steady, it indicates a serious active fault — usually a severe misfire that can damage the catalytic converter within minutes. Slow down and stop safely as soon as possible.' },
    s3: { title: 'P · B · C · U prefixes', sub: 'What each letter means in an OBD2 code',
      intro: 'The first character of an OBD2 code indicates the vehicle system where the fault originated. The second character indicates whether the code is generic (0) or manufacturer-specific (1, 2, 3).',
      cards: [
        { prefix: 'P', label: 'Powertrain', range: 'P0000 – P3FFF', color: '#ff4d4d', desc: 'Engine, transmission, fuel system and emission control. They make up over 80% of DTCs in everyday diagnostics.' },
        { prefix: 'B', label: 'Body', range: 'B0000 – B3FFF', color: '#00d4ff', desc: 'Body, airbags, seat belts, automatic climate control, power windows and mirrors.' },
        { prefix: 'C', label: 'Chassis', range: 'C0000 – C3FFF', color: '#00ff88', desc: 'ABS, stability control (ESC/VSC), electronic power steering and active suspension. Safety-critical.' },
        { prefix: 'U', label: 'Network', range: 'U0000 – U3FFF', color: '#a855f7', desc: 'CAN network and communication between modules (ECU, TCM, BCM, ABS). A fault here can turn on multiple lights at once.' },
      ],
      calloutTitle: 'Generic vs. manufacturer',
      callout: 'P0xxx = Generic SAE code, universal standard. P1xxx / P2xxx / P3xxx = Manufacturer OEM code — the same numbers can mean different things on Toyota vs. Ford vs. BMW.' },
    s4: { title: 'Severity levels', sub: 'When is it urgent and when can you wait?',
      items: [
        { level: 'Low', icon: '✓', color: '#00ff88', desc: 'The vehicle can run normally. The stored code is informational or corresponds to an intermittent fault. Plan an inspection within the next few weeks to prevent the problem from escalating.' },
        { level: 'Moderate', icon: '!', color: '#ff8c42', desc: 'The affected system operates below its optimal parameters. Driving with this code can degrade performance, increase fuel consumption or damage related components. Have it checked as soon as possible.' },
        { level: 'High / Critical — Do not drive', icon: '⚠', color: '#ff4d4d', desc: 'Risk of permanent damage to the engine, catalytic converter or other costly components. In some cases it involves a safety risk. Do not drive until the problem is resolved.' },
      ] },
    s5: { title: 'The 5 most common codes', sub: 'The DTCs that appear most frequently in the shop',
      codes: [
        { code: 'P0420', sev: 'Moderate', sevColor: '#ff8c42', title: 'Catalyst efficiency below threshold — Bank 1', desc: 'The post-catalyst oxygen sensor detects that the catalytic converter is not reducing emissions correctly. Common causes: worn catalytic converter, faulty lambda sensor or an exhaust leak.' },
        { code: 'P0300', sev: 'High', sevColor: '#ff4d4d', title: 'Misfire detected — multiple cylinders', desc: 'One or more cylinders are not firing correctly. Worn spark plugs, ignition coils, injectors or a compression problem. If the light flashes: stop immediately.' },
        { code: 'P0171', sev: 'Moderate', sevColor: '#ff8c42', title: 'System too lean — Bank 1', desc: 'The air/fuel mixture has too much air. A vacuum leak, contaminated MAF sensor, clogged injectors or a weak fuel pump are the most frequent causes.' },
        { code: 'P0128', sev: 'Low', sevColor: '#00ff88', title: 'Coolant temperature below thermostat threshold', desc: 'The engine takes too long to reach operating temperature. Almost always caused by a faulty thermostat stuck open. It affects consumption and emissions.' },
        { code: 'P0442', sev: 'Low', sevColor: '#00ff88', title: 'Small evaporative leak detected in the EVAP system', desc: 'A small leak in the fuel vapor control system. Most often: a loose gas cap or one with a worn seal. Check it before replacing costly components.' },
      ] },
    s6: { title: 'Electric and hybrid vehicles', sub: 'P0A–P0D codes and high-voltage diagnostics',
      intro: 'Electric and hybrid vehicles generate additional codes in the P0A00–P0D99 range, defined by the SAE J2012 standard. CARWEB includes all these curated codes with their specific causes and fixes.',
      cards: [
        { range: 'P0A0x', system: 'Traction battery', desc: 'High-voltage battery pack, cells, BMS (Battery Management System).' },
        { range: 'P0B0x', system: 'Charging system', desc: 'Onboard charger (OBC), charge port, DC fast charging.' },
        { range: 'P0C0x', system: 'Electric drive motor', desc: 'Drive motor, generator in hybrids, MG1/MG2 motors.' },
        { range: 'P0D0x', system: 'Inverter / Converter', desc: 'Power module, DC/DC converter, inverter cooling system.' },
      ],
      calloutTitle: '⚡ Warning — High voltage',
      callout: 'Electric propulsion systems operate between 200 V and 800 V. Advanced diagnostics of traction batteries, inverters and motors must be performed exclusively by technicians with HV (High Voltage) certification and proper personal protective equipment (class 0 gloves, insulated tools).' },
    cta: { title: 'Do you have a code in your vehicle?', body: 'Search the exact DTC in our database of 438+ codes or use the guided diagnosis to identify the affected system.', search: 'Search OBD2 code', diag: 'Guided diagnosis →' },
  },
} as const;

export default async function GuiasPage() {
  const locale = await getLocale();
  const g = CONTENT[locale];
  const L = (href: string) => withLocale(href, locale);
  const SECTION_ICON: Record<string, string> = {
    s1: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
    s2: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2',
    s3: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14',
    s4: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    s5: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    s6: 'M13 10V3L4 14h7v7l9-11h-7z',
  };

  const canonicalUrl = locale === 'en' ? `${SITE_URL}/en${esToEnPath('/guias')}` : `${SITE_URL}/guias`;
  const en = locale === 'en';
  const metaTitle = en ? 'OBD2 Guides | CARWEB — Automotive Diagnostics' : 'Guías OBD2 | CARWEB — Diagnóstico Automotriz';
  const metaDesc = en
    ? 'Complete guides to understand and diagnose OBD2 codes: how the system works, P·B·C·U prefixes, severity levels and diagnostics on electric and hybrid vehicles.'
    : 'Guías completas para entender y diagnosticar códigos OBD2: cómo funciona el sistema, prefijos P·B·C·U, niveles de severidad y diagnóstico en vehículos eléctricos e híbridos.';

  return (
    <div className="min-h-screen bg-[#020617]">
      <BreadcrumbJsonLd
        items={[
          { position: 1, name: getDict(locale).nav.home, url: locale === 'en' ? `${SITE_URL}/en` : SITE_URL },
          { position: 2, name: getDict(locale).nav.guides, url: canonicalUrl },
        ]}
      />
      <ArticleJsonLd headline={metaTitle} description={metaDesc} url={canonicalUrl} />
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-16 px-4">
        <div className="absolute inset-0 cw-grid opacity-30" />
        <div className="absolute inset-0 cw-radial opacity-40" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-xs text-neon font-semibold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-neon animate-blink" />
            {g.eyebrow}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            {g.titlePre}<span className="holo-text">{g.titleHl}</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">{g.subtitle}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-slate-500">
            {g.stats.map((s, i) => (
              <span key={i} className="flex items-center gap-4">{i > 0 && <span>·</span>}{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Navegación rápida ────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
          {g.quickNav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="shrink-0 px-3 py-1.5 glass rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              style={{ borderColor: `${item.color}44` }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* ── Contenido ────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-14 space-y-20">

        {/* 01 · Qué es OBD2 */}
        <section id="que-es-obd2" className="scroll-mt-28">
          <SectionHeader number="01" title={g.s1.title} subtitle={g.s1.sub} color="#00d4ff" iconPath={SECTION_ICON.s1} />
          <div className="space-y-4 text-slate-300 leading-relaxed">
            <p>{g.s1.p[0]}</p>
            <p>{g.s1.p[1]}</p>
            <Callout color="#00d4ff" title={g.s1.calloutTitle}>{g.s1.callout}</Callout>
            <p>{g.s1.p[2]}</p>
          </div>
        </section>

        {/* 02 · Cómo usar un escáner */}
        <section id="como-usar" className="scroll-mt-28">
          <SectionHeader number="02" title={g.s2.title} subtitle={g.s2.sub} color="#00ff88" iconPath={SECTION_ICON.s2} />
          <ol className="space-y-3 mb-6">
            {g.s2.steps.map((step, i) => (
              <li key={i} className="flex gap-4 glass rounded-xl p-4">
                <span className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: '#00ff8820', border: '1px solid #00ff8840', color: '#00ff88' }}>{i + 1}</span>
                <div>
                  <p className="font-semibold text-white mb-1">{step.title}</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <Callout color="#ff8c42" title={g.s2.calloutTitle}>{g.s2.callout}</Callout>
        </section>

        {/* 03 · Prefijos P B C U */}
        <section id="prefijos" className="scroll-mt-28">
          <SectionHeader number="03" title={g.s3.title} subtitle={g.s3.sub} color="#ff8c42" iconPath={SECTION_ICON.s3} />
          <p className="text-slate-300 leading-relaxed mb-6">{g.s3.intro}</p>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {g.s3.cards.map((item) => (
              <Link key={item.prefix} href={L(`/category/${item.prefix}`)} className="glass rounded-xl p-5 block hover:scale-[1.02] transition-transform" style={{ borderColor: `${item.color}44` }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black" style={{ background: `${item.color}18`, color: item.color }}>{item.prefix}</span>
                  <div>
                    <p className="font-bold text-white">{item.label}</p>
                    <p className="text-xs text-slate-500 font-mono">{item.range}</p>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </Link>
            ))}
          </div>
          <Callout color="#ff8c42" title={g.s3.calloutTitle}>{g.s3.callout}</Callout>
        </section>

        {/* 04 · Severidad */}
        <section id="severidad" className="scroll-mt-28">
          <SectionHeader number="04" title={g.s4.title} subtitle={g.s4.sub} color="#ff4d4d" iconPath={SECTION_ICON.s4} />
          <div className="space-y-4">
            {g.s4.items.map((item) => (
              <div key={item.level} className="flex gap-4 rounded-xl p-5" style={{ background: `${item.color}0e`, border: `1px solid ${item.color}30` }}>
                <span className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg" style={{ background: `${item.color}22`, color: item.color }}>{item.icon}</span>
                <div>
                  <p className="font-bold mb-1" style={{ color: item.color }}>{item.level}</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 05 · Códigos más comunes */}
        <section id="comunes" className="scroll-mt-28">
          <SectionHeader number="05" title={g.s5.title} subtitle={g.s5.sub} color="#00d4ff" iconPath={SECTION_ICON.s5} />
          <div className="space-y-3">
            {g.s5.codes.map((item) => (
              <div key={item.code} className="glass rounded-xl p-4 flex gap-4 items-start hover:border-white/15 transition-all">
                <div className="shrink-0 text-center w-16">
                  <Link href={L(`/code/${item.code}`)} className="font-mono font-bold text-neon hover:text-white transition-colors text-sm">{item.code}</Link>
                  <div className="text-[10px] mt-0.5 font-medium" style={{ color: item.sevColor }}>{item.sev}</div>
                </div>
                <div>
                  <p className="text-white font-medium text-sm mb-1">{item.title}</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 06 · EV e Híbridos */}
        <section id="electricos" className="scroll-mt-28">
          <SectionHeader number="06" title={g.s6.title} subtitle={g.s6.sub} color="#a855f7" iconPath={SECTION_ICON.s6} />
          <p className="text-slate-300 leading-relaxed mb-6">{g.s6.intro}</p>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {g.s6.cards.map((item) => (
              <div key={item.range} className="glass rounded-xl p-4" style={{ borderColor: '#a855f733' }}>
                <p className="font-mono font-bold text-purple-400 text-sm mb-1">{item.range}</p>
                <p className="font-semibold text-white text-sm mb-1">{item.system}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <Callout color="#ff4d4d" title={g.s6.calloutTitle}>{g.s6.callout}</Callout>
        </section>

        {/* ── CTA final ────────────────────────────────────── */}
        <div className="glass rounded-2xl p-8 sm:p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-neon/10 border border-neon/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-neon" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{g.cta.title}</h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">{g.cta.body}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={L('/buscar')} className="px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#00a3c4] text-[#020617] font-bold rounded-xl hover:shadow-lg hover:shadow-[#00d4ff]/30 transition-all">
              {g.cta.search}
            </Link>
            <Link href={L('/diagnostico')} className="px-6 py-3 glass font-semibold text-white rounded-xl hover:border-neon/30 transition-all">
              {g.cta.diag}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Subcomponentes ─────────────────────────────────────── */

function SectionHeader({
  number, title, subtitle, color, iconPath,
}: {
  number: string; title: string; subtitle: string; color: string; iconPath: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-7">
      <div className="shrink-0 flex flex-col items-center gap-2">
        <span className="font-mono text-xs font-bold" style={{ color: `${color}70` }}>{number}</span>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <svg className="w-6 h-6" fill="none" stroke={color} strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
          </svg>
        </div>
      </div>
      <div className="pt-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">{title}</h2>
        <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
        <div className="mt-3 h-px w-16 rounded-full" style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />
      </div>
    </div>
  );
}

function Callout({
  color, title, children,
}: {
  color: string; title: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl p-4 my-5" style={{ background: `${color}0d`, borderLeft: `3px solid ${color}`, paddingLeft: '1.25rem' }}>
      <p className="text-sm font-bold mb-1" style={{ color }}>{title}</p>
      <p className="text-slate-300 text-sm leading-relaxed">{children}</p>
    </div>
  );
}
