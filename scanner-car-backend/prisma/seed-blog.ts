/* Carga idempotente de los artículos del blog (upsert por slug).
   Ejecutar: npm run seed:blog
   El cuerpo usa formato ligero: "## " subtítulo, "- " viñeta, línea en blanco = párrafo. */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Seed {
  slug: string;
  tag: string;
  cover: string;
  date: string;
  titleEs: string; excerptEs: string; bodyEs: string;
  titleEn: string; excerptEn: string; bodyEn: string;
}

const POSTS: Seed[] = [
  {
    slug: 'que-es-la-luz-check-engine',
    tag: 'OBD2',
    cover: '/assets/carweb/cat-motor.webp',
    date: '2026-06-15',
    titleEs: '¿Qué significa la luz "Check Engine" y qué debes hacer?',
    excerptEs: 'La luz del motor encendida no siempre es una emergencia, pero nunca debe ignorarse. Te explicamos qué significa y cómo actuar paso a paso.',
    bodyEs: `La luz "Check Engine" —también llamada MIL (Malfunction Indicator Lamp)— es la forma que tiene tu vehículo de avisarte que algo no está funcionando como debería. Se enciende cuando la computadora del motor (la ECU) detecta una lectura fuera de rango en alguno de sus sensores y guarda un código de falla, conocido como DTC.

Ver esa luz encendida genera preocupación, pero la buena noticia es que en la mayoría de los casos no significa que debas detenerte de inmediato. Lo importante es entender qué tan urgente es.

## Luz fija vs. luz parpadeante

La diferencia más importante está en cómo se comporta la luz:

- Luz fija (encendida sin parpadear): indica un problema que conviene revisar pronto, pero que normalmente te permite seguir conduciendo con precaución hasta el taller.
- Luz parpadeante: es una señal seria. Suele indicar un fallo de encendido activo que puede dañar el catalizador, una pieza costosa. Si parpadea, reduce la velocidad, evita acelerar con fuerza y acude al taller cuanto antes.

## Causas más comunes

Muchas veces el origen es más simple de lo que parece. Estas son algunas de las causas más frecuentes:

- Tapa del combustible mal cerrada o en mal estado (una causa típica del código P0457).
- Sensor de oxígeno desgastado.
- Bujías o bobinas de encendido en mal estado.
- Sensor de flujo de aire (MAF) sucio.
- Catalizador con baja eficiencia.

## Qué hacer paso a paso

1. Revisa lo básico: asegúrate de que la tapa del combustible esté bien apretada. A veces basta con eso y la luz se apaga sola tras unos viajes.
2. Conecta un escáner OBD2 y lee el código exacto (por ejemplo P0420 o P0300).
3. Busca ese código en CARWEB para entender la avería, sus síntomas, las causas probables y la solución.
4. Si la luz parpadea o notas pérdida de potencia, humo o ruidos, no fuerces el motor.

Leer el código tú mismo te da una gran ventaja: llegarás al taller sabiendo de qué se trata, podrás hacer mejores preguntas y evitarás reparaciones innecesarias. La información de CARWEB es de referencia; para reparaciones, especialmente de seguridad, consulta siempre con un mecánico certificado.`,
    titleEn: 'What does the "Check Engine" light mean and what should you do?',
    excerptEn: 'A lit engine light is not always an emergency, but it should never be ignored. Here is what it means and how to act step by step.',
    bodyEn: `The "Check Engine" light —also called the MIL (Malfunction Indicator Lamp)— is your vehicle's way of telling you that something is not working as it should. It turns on when the engine computer (the ECU) detects an out-of-range reading from one of its sensors and stores a trouble code, known as a DTC.

Seeing that light is worrying, but the good news is that in most cases it does not mean you must stop immediately. What matters is understanding how urgent it is.

## Steady light vs. flashing light

The most important difference is how the light behaves:

- Steady light (on without blinking): indicates a problem worth checking soon, but that usually lets you keep driving with caution to the shop.
- Flashing light: this is a serious sign. It often indicates an active misfire that can damage the catalytic converter, an expensive part. If it flashes, slow down, avoid heavy acceleration and get to a shop as soon as possible.

## Most common causes

The cause is often simpler than it seems. These are some of the most frequent:

- A loose or faulty fuel cap (a typical cause of code P0457).
- A worn oxygen sensor.
- Bad spark plugs or ignition coils.
- A dirty mass air flow (MAF) sensor.
- A catalytic converter with low efficiency.

## Step-by-step what to do

1. Check the basics: make sure the fuel cap is tight. Sometimes that alone clears the light after a few trips.
2. Connect an OBD2 scanner and read the exact code (for example P0420 or P0300).
3. Look up that code on CARWEB to understand the fault, its symptoms, probable causes and the fix.
4. If the light flashes or you notice power loss, smoke or noises, do not push the engine.

Reading the code yourself gives you a big advantage: you will arrive at the shop knowing what it is about, ask better questions and avoid unnecessary repairs. CARWEB information is for reference; for repairs, especially safety-related ones, always consult a certified mechanic.`,
  },
  {
    slug: 'p0420-catalizador-causas-soluciones',
    tag: 'P0420',
    cover: '/assets/carweb/code-car-exploded.webp',
    date: '2026-06-12',
    titleEs: 'P0420: el código del catalizador explicado (causas y soluciones)',
    excerptEs: 'P0420 es uno de los códigos más buscados. Antes de gastar en un catalizador nuevo, revisa estas causas más probables.',
    bodyEs: `El código P0420 significa "Eficiencia del sistema catalizador por debajo del umbral (Banco 1)". En palabras simples: la computadora del vehículo cree que el catalizador ya no está limpiando los gases de escape tan bien como debería.

Es uno de los códigos más comunes y, también, uno de los que más dinero hace gastar de más, porque mucha gente asume que necesita un catalizador nuevo sin diagnosticar la causa real.

## ¿Cómo sabe el auto que el catalizador falla?

Tu vehículo tiene dos sensores de oxígeno: uno antes del catalizador y otro después. La ECU compara ambas señales. Si el sensor trasero se comporta de forma muy parecida al delantero, el sistema concluye que el catalizador ya no está procesando los gases y guarda el P0420.

## No siempre es el catalizador

Antes de cambiar una pieza cara, descarta estas causas más económicas:

- Sensor de oxígeno (O2) posterior defectuoso o envejecido.
- Fugas en el sistema de escape, especialmente cerca de los sensores.
- Fallos de encendido o una mezcla demasiado rica o pobre, que con el tiempo dañan el catalizador.
- Falsas lecturas por un sensor MAF sucio.
- Y sí, también puede ser un catalizador realmente deteriorado por kilometraje o contaminación (por ejemplo, por quemar aceite).

## Cómo diagnosticarlo

1. Revisa que no haya otros códigos activos (como fallos de encendido P0300–P0304); si los hay, resuélvelos primero.
2. Inspecciona el escape en busca de fugas antes y después del catalizador.
3. Con un escáner que muestre datos en vivo, observa la señal de los sensores de oxígeno delantero y trasero. Si el trasero oscila igual que el delantero, el catalizador probablemente sí está fallando.

## ¿Puedo seguir conduciendo?

Con un P0420 normalmente puedes conducir, pero no lo dejes indefinidamente: además de afectar las emisiones y el consumo, puede impedir que pases una revisión técnica. Consulta la ficha completa de P0420 en CARWEB para ver síntomas, rango de costos y los pasos detallados de reparación.`,
    titleEn: 'P0420: the catalytic converter code explained (causes and fixes)',
    excerptEn: 'P0420 is one of the most searched codes. Before spending on a new catalytic converter, check these most likely causes.',
    bodyEn: `The P0420 code means "Catalyst System Efficiency Below Threshold (Bank 1)". In simple words: the vehicle computer thinks the catalytic converter is no longer cleaning the exhaust gases as well as it should.

It is one of the most common codes and also one that makes people overspend the most, because many assume they need a new converter without diagnosing the real cause.

## How does the car know the converter is failing?

Your vehicle has two oxygen sensors: one before the converter and one after. The ECU compares both signals. If the rear sensor behaves very similarly to the front one, the system concludes that the converter is no longer processing the gases and stores P0420.

## It is not always the converter

Before replacing an expensive part, rule out these cheaper causes:

- A faulty or aged downstream oxygen (O2) sensor.
- Exhaust system leaks, especially near the sensors.
- Misfires or a mixture that is too rich or too lean, which damage the converter over time.
- False readings from a dirty MAF sensor.
- And yes, it can also be a genuinely worn converter from mileage or contamination (for example, from burning oil).

## How to diagnose it

1. Check for other active codes (such as misfires P0300–P0304); if present, fix those first.
2. Inspect the exhaust for leaks before and after the converter.
3. With a scanner that shows live data, watch the front and rear oxygen sensor signals. If the rear one swings just like the front, the converter is probably failing.

## Can I keep driving?

With a P0420 you can usually drive, but do not leave it indefinitely: besides affecting emissions and fuel economy, it can stop you from passing an inspection. Check the full P0420 page on CARWEB to see symptoms, the cost range and the detailed repair steps.`,
  },
  {
    slug: 'como-elegir-un-escaner-obd2',
    tag: 'Guía',
    cover: '/assets/carweb/cat-red.webp',
    date: '2026-06-08',
    titleEs: 'Cómo elegir un escáner OBD2 (guía para empezar)',
    excerptEs: 'Bluetooth, con pantalla o profesional: te ayudamos a elegir el lector OBD2 adecuado según lo que realmente necesitas.',
    bodyEs: `Un escáner OBD2 es la herramienta que te permite leer (y borrar) los códigos de falla de tu vehículo. Es una de las mejores inversiones para cualquier conductor: te ahorra visitas innecesarias al taller solo para "saber qué pasa". Pero hay muchísimas opciones y precios. Esta guía te ayuda a elegir.

## ¿Mi auto es compatible?

Casi con seguridad sí. El estándar OBD2 es obligatorio en todos los vehículos vendidos en Estados Unidos desde 1996 y en Europa desde 2001 (gasolina) y 2004 (diésel). El conector es un puerto trapezoidal de 16 pines que casi siempre está bajo el tablero, del lado del conductor.

## Tipos de escáner

- Adaptador Bluetooth/WiFi: el más económico. Se conecta al puerto y se comunica con una app en tu celular. Ideal para uso doméstico y para quien ya tiene smartphone.
- Lector con pantalla integrada: es autónomo, no necesita celular. Muy práctico para leer y borrar códigos rápido sin instalar apps.
- Escáner profesional: lee datos en vivo, accede a sistemas como ABS y airbag, y ofrece funciones avanzadas. Pensado para talleres y entusiastas serios.

## En qué fijarte antes de comprar

- Que muestre datos en vivo, no solo leer y borrar, si de verdad quieres diagnosticar.
- Compatibilidad con tu marca y con los protocolos de tu país.
- Calidad y soporte de la app (en los modelos Bluetooth, la app es la mitad de la experiencia).
- Reseñas reales de otros usuarios con autos parecidos al tuyo.

## ¿Cuánto gastar?

Para la mayoría de conductores, un adaptador Bluetooth de gama media o un lector con pantalla básico es más que suficiente. Solo si reparas autos con frecuencia justifica un equipo profesional.

Una vez que tengas tu escáner y leas el código, búscalo en CARWEB para entender la falla y la solución paso a paso. Nota de transparencia: algunos enlaces a productos en el sitio son de afiliados (por ejemplo de Amazon); si compras a través de ellos, podemos recibir una pequeña comisión sin costo adicional para ti.`,
    titleEn: 'How to choose an OBD2 scanner (a starter guide)',
    excerptEn: 'Bluetooth, with a screen or professional: we help you choose the right OBD2 reader for what you really need.',
    bodyEn: `An OBD2 scanner is the tool that lets you read (and clear) your vehicle's fault codes. It is one of the best investments any driver can make: it saves unnecessary trips to the shop just to "find out what is going on". But there are many options and price points. This guide helps you choose.

## Is my car compatible?

Almost certainly yes. The OBD2 standard is mandatory on all vehicles sold in the United States since 1996 and in Europe since 2001 (gasoline) and 2004 (diesel). The connector is a 16-pin trapezoidal port, almost always under the dashboard on the driver side.

## Types of scanner

- Bluetooth/WiFi adapter: the most affordable. It plugs into the port and talks to an app on your phone. Ideal for home use and for anyone who already has a smartphone.
- Reader with a built-in screen: standalone, no phone needed. Very handy to read and clear codes quickly without installing apps.
- Professional scanner: reads live data, accesses systems like ABS and airbags, and offers advanced functions. Built for shops and serious enthusiasts.

## What to look for before buying

- That it shows live data, not just read and clear, if you truly want to diagnose.
- Compatibility with your brand and your country's protocols.
- App quality and support (on Bluetooth models, the app is half the experience).
- Real reviews from other users with cars similar to yours.

## How much to spend?

For most drivers, a mid-range Bluetooth adapter or a basic screen reader is more than enough. Only if you fix cars frequently does a professional unit make sense.

Once you have your scanner and read the code, look it up on CARWEB to understand the fault and the step-by-step fix. Transparency note: some product links on the site are affiliate links (for example to Amazon); if you buy through them, we may earn a small commission at no extra cost to you.`,
  },
  {
    slug: 'codigos-obd2-mas-comunes',
    tag: 'OBD2',
    cover: '/assets/carweb/hero-car.webp',
    date: '2026-06-04',
    titleEs: 'Los 8 códigos OBD2 más comunes y qué significan',
    excerptEs: 'Un repaso rápido a los códigos de falla que más aparecen, qué indican y por dónde empezar a revisarlos.',
    bodyEs: `Aunque existen miles de códigos OBD2, en la práctica unos pocos aparecen una y otra vez. Conocerlos te ayuda a reaccionar con calma cuando se enciende el "Check Engine". Aquí tienes los más frecuentes.

## Relacionados con la mezcla y el encendido

- P0300: fallos de encendido aleatorios en varios cilindros. Suele apuntar a bujías, bobinas o problemas de combustible.
- P0171: sistema demasiado pobre (poca gasolina o demasiado aire). Causas típicas: fugas de aire, MAF sucio o inyectores débiles.
- P0174: como el P0171 pero en el otro banco del motor.

## Relacionados con emisiones y escape

- P0420: eficiencia del catalizador por debajo del umbral. No siempre es el catalizador; revisa primero sensores de oxígeno y fugas.
- P0401: flujo insuficiente de recirculación de gases (EGR). Suele ser una válvula EGR o conductos obstruidos por carbón.
- P0457: fuga en el sistema EVAP, casi siempre por la tapa del combustible mal cerrada.

## Relacionados con sensores

- P0128: el motor no alcanza la temperatura esperada. Causa habitual: termostato pegado abierto.
- P0113: señal alta del sensor de temperatura del aire de admisión (IAT), por conexión o sensor en mal estado.

## Cómo usar esta lista

Estos códigos son un punto de partida, no un diagnóstico definitivo: el mismo código puede tener varias causas según el vehículo. Lo recomendable es leer el código con un escáner y luego buscarlo en CARWEB, donde encontrarás los síntomas, las causas probables ordenadas y la solución paso a paso para tu caso. Para reparaciones de seguridad, consulta siempre a un mecánico certificado.`,
    titleEn: 'The 8 most common OBD2 codes and what they mean',
    excerptEn: 'A quick tour of the fault codes that show up the most, what they indicate and where to start checking.',
    bodyEn: `Although there are thousands of OBD2 codes, in practice a few show up again and again. Knowing them helps you react calmly when the "Check Engine" light turns on. Here are the most frequent.

## Related to mixture and ignition

- P0300: random misfires across several cylinders. Usually points to spark plugs, coils or fuel problems.
- P0171: system too lean (too little fuel or too much air). Typical causes: air leaks, a dirty MAF or weak injectors.
- P0174: like P0171 but on the other engine bank.

## Related to emissions and exhaust

- P0420: catalyst efficiency below threshold. It is not always the converter; check oxygen sensors and leaks first.
- P0401: insufficient exhaust gas recirculation (EGR) flow. Usually an EGR valve or passages clogged with carbon.
- P0457: EVAP system leak, almost always from a loose fuel cap.

## Related to sensors

- P0128: the engine does not reach the expected temperature. Common cause: a thermostat stuck open.
- P0113: high signal from the intake air temperature (IAT) sensor, due to wiring or a faulty sensor.

## How to use this list

These codes are a starting point, not a final diagnosis: the same code can have several causes depending on the vehicle. The best approach is to read the code with a scanner and then look it up on CARWEB, where you will find the symptoms, the probable causes in order and the step-by-step fix for your case. For safety repairs, always consult a certified mechanic.`,
  },
  {
    slug: 'se-pueden-borrar-los-codigos-obd2',
    tag: 'Guía',
    cover: '/assets/carweb/cat-chasis.webp',
    date: '2026-05-30',
    titleEs: '¿Se pueden borrar los códigos OBD2? Lo que debes saber',
    excerptEs: 'Borrar un código apaga la luz, pero no repara la falla. Te explicamos cuándo tiene sentido hacerlo y los riesgos.',
    bodyEs: `Una de las primeras cosas que la gente quiere hacer con un escáner es borrar los códigos para apagar la luz del motor. Es posible, pero conviene entender qué pasa realmente cuando lo haces.

## Borrar no es reparar

Cuando borras un código, simplemente le dices a la computadora que olvide la falla registrada y apague la luz. Si el problema de fondo sigue ahí, el código volverá a aparecer en cuanto la ECU vuelva a detectar la condición. En otras palabras: borrar es tratar el síntoma, no la causa.

## ¿Cuándo tiene sentido borrarlo?

- Después de haber reparado la avería, para confirmar que el código no regresa.
- Para comprobar si una falla era puntual (por ejemplo, tras desconectar la batería) o es permanente.
- Para ver con qué rapidez vuelve, lo que ayuda a diagnosticar.

## Riesgos de borrarlo sin reparar

- La falla puede empeorar mientras la ignoras.
- Borras los "monitores de a bordo": tras limpiar los códigos, el vehículo necesita completar varios ciclos de manejo para volver a estar "listo". Si vas a una revisión técnica justo después de borrar, puede rechazarte por no estar lista.
- Si la luz parpadeaba, borrar no soluciona el riesgo de daño al catalizador.

## La forma correcta de proceder

1. Lee el código y anótalo antes de borrar.
2. Búscalo en CARWEB para entender la causa y la solución.
3. Repara la avería.
4. Borra el código y conduce normalmente para confirmar que no regresa.

Borrar códigos es una herramienta útil dentro de un buen diagnóstico, no un atajo para esconder problemas. Ante dudas o reparaciones de seguridad, acude a un mecánico certificado.`,
    titleEn: 'Can you clear OBD2 codes? What you should know',
    excerptEn: 'Clearing a code turns off the light, but it does not fix the fault. Here is when it makes sense and the risks.',
    bodyEn: `One of the first things people want to do with a scanner is clear the codes to turn off the engine light. It is possible, but it helps to understand what actually happens when you do.

## Clearing is not repairing

When you clear a code, you simply tell the computer to forget the stored fault and turn off the light. If the underlying problem is still there, the code will come back as soon as the ECU detects the condition again. In other words: clearing treats the symptom, not the cause.

## When does it make sense to clear it?

- After repairing the fault, to confirm the code does not return.
- To check whether a fault was a one-off (for example, after disconnecting the battery) or permanent.
- To see how quickly it returns, which helps with diagnosis.

## Risks of clearing without repairing

- The fault can get worse while you ignore it.
- You reset the "onboard monitors": after clearing codes, the vehicle needs to complete several drive cycles to be "ready" again. If you go to an inspection right after clearing, it may fail for not being ready.
- If the light was flashing, clearing does not solve the risk of catalytic converter damage.

## The right way to proceed

1. Read the code and write it down before clearing.
2. Look it up on CARWEB to understand the cause and the fix.
3. Repair the fault.
4. Clear the code and drive normally to confirm it does not return.

Clearing codes is a useful tool within a good diagnosis, not a shortcut to hide problems. When in doubt or for safety repairs, see a certified mechanic.`,
  },
];

(async () => {
  let created = 0;
  let updated = 0;
  for (const p of POSTS) {
    const data = {
      tag: p.tag,
      coverUrl: p.cover,
      published: true,
      date: new Date(p.date),
      titleEs: p.titleEs,
      excerptEs: p.excerptEs,
      bodyEs: p.bodyEs,
      titleEn: p.titleEn,
      excerptEn: p.excerptEn,
      bodyEn: p.bodyEn,
    };
    const existing = await prisma.blogPost.findUnique({ where: { slug: p.slug } });
    if (existing) {
      await prisma.blogPost.update({ where: { slug: p.slug }, data });
      updated++;
    } else {
      await prisma.blogPost.create({ data: { slug: p.slug, ...data } });
      created++;
    }
  }
  console.log(`Blog seed listo — creados: ${created}, actualizados: ${updated}`);
  await prisma.$disconnect();
})().catch((e) => {
  console.error('Error cargando artículos del blog:', e);
  process.exit(1);
});
