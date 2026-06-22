/* ============================================================
   Traducciones al inglés (locale "en") del primer lote de códigos
   de mayor tráfico. El contenido base en español vive en las columnas
   del propio código; estas filas se superponen cuando la API recibe
   ?locale=en. La redacción inglesa usa la terminología SAE estándar
   (p. ej. "System Too Lean", "Catalyst System Efficiency Below
   Threshold") y corrige artefactos del parser del contenido español.

   Loader idempotente: hace upsert por (codeId, locale=en) sobre la
   variante genérica (SAE) de cada código. Se invoca desde seed.ts y
   desde seed-translations.ts.
   ============================================================ */

import type { PrismaClient } from '@prisma/client';

export interface CodeTranslation {
  code: string;
  title: string;
  description: string;
  symptoms: string[];
  causes: string[];
  solutions: string[];
  severity?: string; // opcional; no se traduce (vive en el código base). Se ignora al cargar.
}

export const EN_TRANSLATIONS: CodeTranslation[] = [
  {
    code: 'P0113',
    title: 'Intake Air Temperature (IAT) Sensor Circuit High Input',
    description: 'The Intake Air Temperature (IAT) sensor is sending an abnormally high voltage signal.',
    symptoms: ['Hard starting when warm', 'Excessive fuel consumption'],
    causes: ['Disconnected IAT sensor', 'Open wiring circuit'],
    solutions: ['Check the IAT connector', 'Replace the sensor'],
  },
  {
    code: 'P0135',
    title: 'O2 Sensor Heater Circuit Malfunction (Bank 1, Sensor 1)',
    description: 'The O2 sensor heating element is not working, delaying the sensor from reaching operating temperature.',
    symptoms: ['O2 sensor slow to warm up', 'Rough idle at startup'],
    causes: ['Burned-out heater element', 'Loose connections'],
    solutions: ['Replace the complete O2 sensor'],
  },
  {
    code: 'P0141',
    title: 'O2 Sensor Heater Circuit Malfunction (Bank 1, Sensor 2)',
    description: 'The heater of the post-catalyst O2 sensor is not working.',
    symptoms: ['O2 sensor slow to operate', 'Check Engine light on'],
    causes: ['Burned-out heater element'],
    solutions: ['Replace the O2 sensor'],
  },
  {
    code: 'P0171',
    title: 'System Too Lean (Bank 1)',
    description: 'The computer detects too much air and too little fuel in the bank 1 mixture.',
    symptoms: ['Rough idle', 'Hesitation on acceleration', 'Backfiring through the exhaust', 'Power loss on hills'],
    causes: ['Intake vacuum leak', 'Dirty MAF sensor', 'Weak fuel pump', 'Clogged injectors', 'Blocked fuel filter'],
    solutions: ['Check for vacuum leaks with spray', 'Clean or replace the MAF sensor', 'Check the fuel pressure', 'Clean the injectors'],
  },
  {
    code: 'P0172',
    title: 'System Too Rich (Bank 1)',
    description: 'The computer detects excess fuel relative to air in bank 1.',
    symptoms: ['Black smoke from the exhaust', 'Strong fuel smell', 'Excessive fuel consumption', 'Sooty black spark plugs'],
    causes: ['Injectors with internal leaks', 'Faulty fuel pressure regulator', 'Bad oxygen sensor', 'Very dirty air filter'],
    solutions: ['Test the injectors (drip test)', 'Check the fuel pressure regulator', 'Replace the O2 sensor if needed', 'Replace the air filter'],
  },
  {
    code: 'P0174',
    title: 'System Too Lean (Bank 2)',
    description: 'Same as P0171 but for engine bank 2.',
    symptoms: ['Rough idle on bank 2', 'Power loss'],
    causes: ['Bank 2 vacuum leaks', 'Dirty MAF sensor'],
    solutions: ['Check bank 2 vacuum leaks', 'Clean the MAF sensor'],
  },
  {
    code: 'P0175',
    title: 'System Too Rich (Bank 2)',
    description: 'Same as P0172 but for engine bank 2.',
    symptoms: ['Black smoke', 'Excessive fuel consumption on bank 2'],
    causes: ['Bank 2 injectors leaking'],
    solutions: ['Test the bank 2 injectors'],
  },
  {
    code: 'P0300',
    title: 'Random/Multiple Cylinder Misfire Detected',
    description: 'Misfires are detected across several cylinders with no defined pattern. It can damage the catalytic converter.',
    symptoms: ['Engine shaking', 'Noticeable power loss', 'Check Engine light flashing', 'Vibration under acceleration', 'Backfiring through the exhaust'],
    causes: ['Worn spark plugs', 'Faulty spark plug wires', 'Failing ignition coils', 'Dirty injectors', 'Low compression'],
    solutions: ['Inspect and replace the spark plugs', 'Check the high-tension wires', 'Test the ignition coils', 'Clean or replace the injectors', 'Perform a compression test'],
  },
  {
    code: 'P0301',
    title: 'Cylinder 1 Misfire Detected',
    description: 'Cylinder number 1 is not combusting correctly.',
    symptoms: ['Engine vibration', 'Power loss', 'Irregular fuel consumption', 'Check Engine light flashing'],
    causes: ['Faulty cylinder 1 spark plug', 'Damaged ignition coil', 'Clogged injector', 'Low compression in cylinder 1'],
    solutions: ['Replace the cylinder 1 spark plug', 'Test the coil with a multimeter', 'Check the injector', 'Measure compression'],
  },
  {
    code: 'P0302',
    title: 'Cylinder 2 Misfire Detected',
    description: 'Cylinder 2 is not combusting correctly.',
    symptoms: ['Engine vibration', 'Power loss on cylinder 2'],
    causes: ['Faulty cylinder 2 spark plug', 'Damaged ignition coil'],
    solutions: ['Replace the cylinder 2 spark plug', 'Test the coil'],
  },
  {
    code: 'P0303',
    title: 'Cylinder 3 Misfire Detected',
    description: 'Cylinder 3 is not combusting correctly.',
    symptoms: ['Engine vibration', 'Power loss on cylinder 3'],
    causes: ['Faulty cylinder 3 spark plug', 'Damaged ignition coil'],
    solutions: ['Replace the cylinder 3 spark plug', 'Test the coil'],
  },
  {
    code: 'P0304',
    title: 'Cylinder 4 Misfire Detected',
    description: 'Cylinder 4 is not combusting correctly.',
    symptoms: ['Engine vibration', 'Power loss on cylinder 4'],
    causes: ['Faulty cylinder 4 spark plug', 'Damaged ignition coil'],
    solutions: ['Replace the cylinder 4 spark plug', 'Test the coil'],
  },
  {
    code: 'P0335',
    title: 'Crankshaft Position (CKP) Sensor Circuit Malfunction',
    description: 'The crankshaft sensor is critical for engine operation. Without this signal the engine will not start.',
    symptoms: ['No start', 'Engine stalls unexpectedly', 'Total loss of ignition'],
    causes: ['Faulty CKP sensor', 'Cut wiring', 'Damaged reluctor (tone) wheel'],
    solutions: ['Clean the sensor area', 'Check the wiring', 'Replace the CKP sensor'],
  },
  {
    code: 'P0340',
    title: 'Camshaft Position (CMP) Sensor Circuit Malfunction (Bank 1)',
    description: 'The CMP sensor is not sending a correct signal, affecting engine timing.',
    symptoms: ['No start or hard start', 'Engine stalls while driving'],
    causes: ['Faulty CMP sensor', 'Damaged wiring', 'Dirty reluctor (tone) wheel'],
    solutions: ['Clean the CMP sensor', 'Check the wiring', 'Replace the sensor'],
  },
  {
    code: 'P0401',
    title: 'Exhaust Gas Recirculation (EGR) Flow Insufficient Detected',
    description: 'The EGR system is not recirculating enough exhaust gas, which raises NOx emissions.',
    symptoms: ['Engine knocking', 'Increased emissions', 'Reduced performance at low speed'],
    causes: ['EGR valve clogged with carbon', 'Blocked EGR passages', 'Faulty EGR position sensor', 'Damaged EGR solenoid'],
    solutions: ['Clean the EGR valve with carburetor cleaner', 'Clean the recirculation passages', 'Check the solenoid operation', 'Replace the valve if needed'],
  },
  {
    code: 'P0420',
    title: 'Catalyst System Efficiency Below Threshold (Bank 1)',
    description: 'The catalytic converter is not cleaning the exhaust gases efficiently. The upstream and downstream O2 sensors show similar readings.',
    symptoms: ['Check Engine light on', 'Possible sulfur (rotten-egg) smell', 'Failed emissions test', 'Slight power loss'],
    causes: ['Deteriorated or damaged catalytic converter', 'Faulty oxygen sensor', 'Exhaust system leaks'],
    solutions: ['Check the oxygen sensors with a scan tool', 'Inspect the exhaust for leaks', 'Test the catalyst efficiency', 'Replace the catalytic converter if needed'],
  },
  {
    code: 'P0430',
    title: 'Catalyst System Efficiency Below Threshold (Bank 2)',
    description: 'The bank 2 catalytic converter is not cleaning the exhaust gases correctly.',
    symptoms: ['Sulfur (rotten-egg) smell', 'High emissions', 'Failed emissions test'],
    causes: ['Deteriorated bank 2 catalytic converter', 'Faulty O2 sensor'],
    solutions: ['Replace the bank 2 catalytic converter'],
  },
  {
    code: 'P0440',
    title: 'Evaporative Emission (EVAP) System Malfunction',
    description: 'The fuel vapor capture system has a general fault.',
    symptoms: ['Check Engine light', 'Faint fuel smell'],
    causes: ['Loose fuel cap', 'Broken hoses', 'Clogged purge valve'],
    solutions: ['Tighten or replace the fuel cap', 'Inspect the EVAP hoses'],
  },
  {
    code: 'P0442',
    title: 'Evaporative Emission (EVAP) System Leak Detected (Small Leak)',
    description: 'A small leak was detected in the evaporative emission control system.',
    symptoms: ['Check Engine light on', 'Possible faint fuel smell', 'No driveability symptoms'],
    causes: ['Loose or damaged fuel cap', 'Cracked EVAP hoses', 'Purge valve with a small leak'],
    solutions: ['Tighten or replace the fuel cap', 'Inspect the EVAP system hoses', 'Perform a smoke test to find the leak'],
  },
  {
    code: 'P0455',
    title: 'Evaporative Emission (EVAP) System Leak Detected (Large Leak)',
    description: 'There is a significant leak in the EVAP system.',
    symptoms: ['Check Engine light on', 'Noticeable fuel smell', 'Possible difficulty filling the tank'],
    causes: ['Missing or badly damaged fuel cap', 'Disconnected EVAP hose', 'Cracked charcoal canister'],
    solutions: ['Check that the fuel cap is properly installed', 'Visually inspect all EVAP hoses', 'Check the charcoal canister'],
  },
  {
    code: 'P0456',
    title: 'Evaporative Emission (EVAP) System Leak Detected (Very Small Leak)',
    description: 'A very small leak was detected in the EVAP system.',
    symptoms: ['Check Engine light', 'Very faint fuel smell'],
    causes: ['Small leak in EVAP lines or connectors'],
    solutions: ['Inspect the entire system with a smoke test'],
  },
  {
    code: 'P0500',
    title: 'Vehicle Speed Sensor (VSS) Malfunction',
    description: 'The sensor that measures vehicle speed is not sending a correct signal.',
    symptoms: ['Speedometer not working or reading incorrectly', 'Erratic transmission shifting', 'ABS light on'],
    causes: ['Faulty VSS sensor', 'Damaged wiring', 'Corroded connector', 'Problems with the sensor drive gear'],
    solutions: ['Replace the speed sensor', 'Check the wiring and connectors', 'Clean the connections', 'Inspect the sensor drive gear'],
  },
  {
    code: 'P0505',
    title: 'Idle Air Control System Malfunction',
    description: 'The engine does not maintain a correct, stable idle.',
    symptoms: ['Idle too high or too low', 'Vibration at idle', 'Engine nearly stalls'],
    causes: ['Faulty IAC valve', 'Vacuum leak', 'Dirty throttle body'],
    solutions: ['Clean the IAC valve', 'Check for vacuum leaks', 'Clean the throttle body'],
  },
  {
    code: 'P0520',
    title: 'Engine Oil Pressure Sensor/Switch Circuit Malfunction',
    description: 'The oil pressure sensor is not working correctly.',
    symptoms: ['Oil warning light on erroneously', 'No oil pressure reading'],
    causes: ['Faulty oil pressure sensor', 'Damaged wiring'],
    solutions: ['Replace the oil pressure sensor', 'Verify the actual oil level'],
  },
  {
    code: 'P0562',
    title: 'System Voltage Low',
    description: 'Electrical system voltage below 10V during normal operation.',
    symptoms: ['Weak cranking or no start', 'Battery light on'],
    causes: ['Discharged battery', 'Alternator not charging', 'Loose negative connection'],
    solutions: ['Charge the battery', 'Check the alternator', 'Clean the battery connections'],
  },
  {
    code: 'P0700',
    title: 'Transmission Control System Malfunction',
    description: 'The engine computer detected a problem in the transmission control module.',
    symptoms: ['Transmission warning light on', 'Harsh or delayed shifts', 'Transmission in limp mode', "Won't shift past second gear"],
    causes: ['Internal transmission problem', 'Faulty TCM module', 'Low fluid level', 'Damaged shift solenoid'],
    solutions: ['Check transmission fluid level and condition', 'Scan the TCM for specific codes', 'Inspect the solenoids', 'Take it to a transmission specialist'],
  },
];

/** Une una lista en el mismo formato de texto que el contenido base:
 *  síntomas/causas separados por coma; soluciones numeradas "1. … 2. …". */
function joinPlain(items: string[]): string {
  return items.map((s) => s.trim()).filter(Boolean).join(', ');
}
function joinNumbered(items: string[]): string {
  return items.map((s, i) => `${i + 1}. ${s.trim().replace(/\.$/, '')}.`).join(' ');
}

/** Carga (upsert) las traducciones de un locale sobre la variante genérica
 *  de cada código. Devuelve cuántas se cargaron y qué códigos faltaban. */
export async function loadTranslations(
  prisma: PrismaClient,
  locale: string,
  translations: CodeTranslation[],
): Promise<{ loaded: number; missing: string[] }> {
  const generic = await prisma.manufacturer.findFirst({ where: { isGeneric: true } });
  const genericId = generic?.id ?? 1;
  let loaded = 0;
  const missing: string[] = [];

  for (const t of translations) {
    const target = await prisma.oBDCode.findUnique({
      where: { code_manufacturerId: { code: t.code, manufacturerId: genericId } },
      select: { id: true },
    });
    if (!target) {
      missing.push(t.code);
      continue;
    }
    const data = {
      title: t.title,
      description: t.description,
      symptoms: joinPlain(t.symptoms),
      causes: joinPlain(t.causes),
      solutions: joinNumbered(t.solutions),
    };
    await prisma.oBDCodeTranslation.upsert({
      where: { codeId_locale: { codeId: target.id, locale } },
      create: { codeId: target.id, locale, ...data },
      update: data,
    });
    loaded++;
  }
  return { loaded, missing };
}

/** Atajo para el lote en inglés. Combina el lote base (este archivo) con todos
 *  los lotes adicionales translations-en-2..9; cada archivo exporta un único
 *  array CodeTranslation[]. Los archivos que aún no existan se omiten. */
export function loadEnglishTranslations(prisma: PrismaClient) {
  let all: CodeTranslation[] = [...EN_TRANSLATIONS];
  for (let n = 2; n <= 9; n++) {
    try {
      /* eslint-disable-next-line @typescript-eslint/no-var-requires */
      const mod = require(`./translations-en-${n}`) as Record<string, unknown>;
      const arr = Object.values(mod).find((v) => Array.isArray(v)) as CodeTranslation[] | undefined;
      if (arr) all = all.concat(arr);
    } catch {
      /* el archivo no existe todavía */
    }
  }
  return loadTranslations(prisma, 'en', all);
}
