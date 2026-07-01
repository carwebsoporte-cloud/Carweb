// Preguntas frecuentes editoriales (AEO/GEO).
// Respuestas concisas y directas, optimizadas para featured snippets y para que
// los motores generativos (ChatGPT, Gemini, Claude, Perplexity) puedan citarlas.
// El mismo contenido alimenta el bloque visible y el JSON-LD FAQPage.

import type { Locale } from './i18n';

export type Faq = { q: string; a: string };

const HOME_FAQ: Record<Locale, Faq[]> = {
  es: [
    {
      q: '¿Qué es un código OBD2?',
      a: 'Un código OBD2 (también llamado código DTC o código de falla) es un identificador estandarizado de cinco caracteres —por ejemplo P0420— que la computadora del vehículo (ECU) guarda cuando detecta un fallo. La primera letra indica el sistema afectado: P (motor y transmisión), B (carrocería), C (chasis) y U (red de comunicación). En CARWEB puedes buscar cualquier código y ver su significado, síntomas, causas y solución.',
    },
    {
      q: '¿Cómo leo los códigos de falla de mi carro?',
      a: 'Conecta un escáner OBD2 al puerto de diagnóstico, que suele estar bajo el volante. El escáner lee los códigos almacenados en la ECU. Luego copia el código (por ejemplo P0171) en el buscador de CARWEB para obtener el diagnóstico completo: qué significa, qué síntomas produce, sus causas más probables y cómo repararlo paso a paso.',
    },
    {
      q: '¿Es seguro seguir conduciendo con la luz Check Engine encendida?',
      a: 'Depende de la gravedad del código. Si la luz está fija y el vehículo funciona normal, puedes conducir con precaución hasta el taller. Si parpadea, suele indicar una falla grave (por ejemplo fallo de encendido) y debes detenerte para evitar daños al motor o al catalizador. Cada ficha de código en CARWEB indica si es seguro seguir conduciendo.',
    },
    {
      q: '¿CARWEB es gratis?',
      a: 'Sí. Consultar el significado, los síntomas, las causas y las soluciones de cualquier código OBD2 en CARWEB es totalmente gratuito, tanto en español como en inglés.',
    },
    {
      q: '¿El mismo código significa lo mismo en todas las marcas?',
      a: 'No siempre. Los códigos genéricos (SAE) son universales, pero muchos fabricantes definen códigos específicos de marca con un significado distinto. Por eso en CARWEB puedes ver tanto la definición genérica como la específica de cada marca (OEM).',
    },
    {
      q: '¿Puedo borrar un código OBD2 sin reparar la falla?',
      a: 'Puedes borrarlo con el escáner, pero si la causa raíz sigue presente el código volverá a aparecer y la luz Check Engine se encenderá de nuevo. Lo recomendable es diagnosticar y reparar la avería antes de borrar el código.',
    },
  ],
  en: [
    {
      q: 'What is an OBD2 code?',
      a: 'An OBD2 code (also called a DTC or fault code) is a standardized five-character identifier —for example P0420— that the vehicle computer (ECU) stores when it detects a fault. The first letter indicates the affected system: P (powertrain), B (body), C (chassis) and U (network). On CARWEB you can look up any code and see its meaning, symptoms, causes and fix.',
    },
    {
      q: 'How do I read my car fault codes?',
      a: 'Plug an OBD2 scanner into the diagnostic port, usually located under the steering wheel. The scanner reads the codes stored in the ECU. Then type the code (for example P0171) into the CARWEB search box to get the full diagnosis: what it means, its symptoms, the most likely causes and a step-by-step fix.',
    },
    {
      q: 'Is it safe to keep driving with the Check Engine light on?',
      a: 'It depends on the severity of the code. If the light is steady and the vehicle drives normally, you can drive with caution to the shop. If it is flashing, it usually means a serious fault (such as a misfire) and you should stop to avoid engine or catalytic-converter damage. Every code page on CARWEB tells you whether it is safe to keep driving.',
    },
    {
      q: 'Is CARWEB free?',
      a: 'Yes. Looking up the meaning, symptoms, causes and fixes for any OBD2 code on CARWEB is completely free, in both Spanish and English.',
    },
    {
      q: 'Does the same code mean the same thing on every brand?',
      a: 'Not always. Generic (SAE) codes are universal, but many manufacturers define brand-specific codes with a different meaning. That is why CARWEB shows both the generic definition and the manufacturer-specific (OEM) one.',
    },
    {
      q: 'Can I clear an OBD2 code without fixing the fault?',
      a: 'You can clear it with a scanner, but if the root cause is still present the code will come back and the Check Engine light will turn on again. The recommended approach is to diagnose and repair the fault before clearing the code.',
    },
  ],
};

const CATEGORY_FAQ: Record<string, Record<Locale, Faq[]>> = {
  P: {
    es: [
      { q: '¿Qué significan los códigos OBD2 que empiezan por P?', a: 'Los códigos P corresponden al tren motriz (powertrain): motor, transmisión, sistema de combustible, emisiones y escape. Son los más comunes y muchos están estandarizados por la SAE, por lo que aplican a casi todos los vehículos.' },
      { q: '¿Cuáles son los códigos P más frecuentes?', a: 'Algunos de los más buscados son P0300 (fallo de encendido aleatorio), P0420 (eficiencia del catalizador baja), P0171 (mezcla pobre) y P0455 (fuga grande en el sistema EVAP).' },
    ],
    en: [
      { q: 'What do OBD2 codes starting with P mean?', a: 'P codes belong to the powertrain: engine, transmission, fuel system, emissions and exhaust. They are the most common and many are SAE-standardized, so they apply to almost every vehicle.' },
      { q: 'What are the most common P codes?', a: 'Some of the most searched are P0300 (random misfire), P0420 (catalyst efficiency below threshold), P0171 (system too lean) and P0455 (large EVAP leak).' },
    ],
  },
  B: {
    es: [
      { q: '¿Qué significan los códigos OBD2 que empiezan por B?', a: 'Los códigos B corresponden a la carrocería (body): airbags y sistema SRS, climatización, ventanas eléctricas, cierre centralizado y otros accesorios eléctricos del habitáculo.' },
    ],
    en: [
      { q: 'What do OBD2 codes starting with B mean?', a: 'B codes belong to the body: airbags and the SRS system, climate control, power windows, central locking and other interior electrical accessories.' },
    ],
  },
  C: {
    es: [
      { q: '¿Qué significan los códigos OBD2 que empiezan por C?', a: 'Los códigos C corresponden al chasis (chassis): frenos ABS, control de estabilidad y tracción, dirección asistida y suspensión. Suelen estar relacionados con la seguridad activa del vehículo.' },
    ],
    en: [
      { q: 'What do OBD2 codes starting with C mean?', a: 'C codes belong to the chassis: ABS brakes, stability and traction control, power steering and suspension. They are usually related to the vehicle active-safety systems.' },
    ],
  },
  U: {
    es: [
      { q: '¿Qué significan los códigos OBD2 que empiezan por U?', a: 'Los códigos U corresponden a la red de comunicación (network): la red CAN bus y la comunicación entre los módulos electrónicos de control. Suelen indicar pérdida de comunicación entre componentes.' },
    ],
    en: [
      { q: 'What do OBD2 codes starting with U mean?', a: 'U codes belong to the communication network: the CAN bus and the communication between the electronic control modules. They usually indicate a loss of communication between components.' },
    ],
  },
};

export function getHomeFaq(locale: Locale): Faq[] {
  return HOME_FAQ[locale];
}

export function getCategoryFaq(category: string, locale: Locale): Faq[] {
  return CATEGORY_FAQ[category.toUpperCase()]?.[locale] ?? [];
}
