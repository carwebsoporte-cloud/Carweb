import { PrismaClient } from '@prisma/client';

/* ────────────────────────────────────────────────────────────────────────────
   Contenido curado y AMPLIADO para los códigos OBD2 más buscados (mejor SEO).
   Reemplaza descripción + síntomas/causas/soluciones del código GENÉRICO (SAE)
   por versiones más detalladas y orientadas a la intención de búsqueda.

   Idioma: ESPAÑOL (base). Si tienes traducciones EN para estos códigos, conviene
   volver a generarlas después (tus seeds de traducción) para que /en quede al día.

   Ejecutar DESPUÉS del seed principal:
     npm run seed:enriched      (o)      npx ts-node prisma/seed-enriched.ts
   ──────────────────────────────────────────────────────────────────────────── */

const prisma = new PrismaClient();

interface Enriched {
  code: string;
  title: string;
  description: string;
  severity: 'Baja' | 'Moderada' | 'Crítica/No conducir';
  symptoms: string[];
  causes: string[];
  solutions: string[];
}

const ENRICHED: Enriched[] = [
  {
    code: 'P0420',
    title: 'Eficiencia del Sistema Catalizador por Debajo del Umbral (Banco 1)',
    severity: 'Moderada',
    description:
      'El código P0420 indica que el convertidor catalítico del banco 1 ya no reduce las emisiones con la eficiencia que exige la computadora (ECU). Se detecta comparando el sensor de oxígeno anterior (upstream) con el posterior (downstream): cuando ambas señales se parecen demasiado, significa que el catalizador no está "trabajando" los gases. Es uno de los códigos más frecuentes y, aunque rara vez afecta la conducción, impide pasar la revisión de emisiones.',
    symptoms: [
      'Luz Check Engine (MIL) encendida de forma fija',
      'Olor a azufre o "huevo podrido" en el escape',
      'No pasa la prueba de emisiones / gases',
      'Ligera pérdida de potencia o de respuesta',
      'Leve aumento del consumo de combustible',
      'En muchos casos, ningún síntoma perceptible al conducir',
    ],
    causes: [
      'Convertidor catalítico desgastado o envejecido (causa más común)',
      'Sensor de oxígeno posterior (downstream) defectuoso o de respuesta lenta',
      'Fuga en el sistema de escape antes o cerca del catalizador',
      'Fallos de encendido o mezcla rica que han contaminado el catalizador',
      'Sensor de oxígeno anterior (upstream) en mal estado',
      'Aceite o refrigerante entrando al escape y dañando el catalizador',
    ],
    solutions: [
      'Leer los datos en vivo de ambos sensores de oxígeno con un escáner: el posterior debe mantenerse estable mientras el anterior oscila.',
      'Inspeccionar el escape en busca de fugas (uniones y juntas) antes del catalizador, ya que falsean la lectura.',
      'Descartar y reparar primero cualquier fallo de encendido (P030x) o mezcla rica: son los que destruyen el catalizador.',
      'Comprobar el sensor de oxígeno posterior y reemplazarlo si responde lento o erróneo (es mucho más barato que el catalizador).',
      'Verificar físicamente el catalizador (obstrucción, golpeteo interno, temperatura de entrada/salida).',
      'Si se confirma su deterioro, reemplazar el convertidor catalítico por uno homologado y borrar el código tras un ciclo de conducción.',
    ],
  },
  {
    code: 'P0300',
    title: 'Fallo de Encendido Aleatorio o en Múltiples Cilindros',
    severity: 'Crítica/No conducir',
    description:
      'El código P0300 indica que la ECU ha detectado fallos de encendido (misfires) en varios cilindros de forma aleatoria, sin un cilindro fijo. Un fallo de encendido ocurre cuando la mezcla aire-combustible no se quema correctamente en la cámara de combustión. Es un código serio: además de pérdida de potencia y vibración, el combustible sin quemar puede sobrecalentar y destruir el convertidor catalítico. Si la luz Check Engine PARPADEA, detente de forma segura cuanto antes.',
    symptoms: [
      'Motor que tiembla o vibra, sobre todo en ralentí',
      'Luz Check Engine parpadeando (indica fallo activo grave)',
      'Pérdida notable de potencia y de respuesta al acelerar',
      'Tirones o titubeos durante la aceleración',
      'Petardeos o explosiones en el escape',
      'Aumento del consumo de combustible',
      'Arranque difícil o irregular',
      'Olor a gasolina sin quemar',
    ],
    causes: [
      'Bujías desgastadas, sucias o con separación (gap) incorrecta (muy común)',
      'Bobinas de encendido (coils) defectuosas',
      'Cables de bujía en mal estado (en motores que aún los usan)',
      'Fuga de vacío que empobrece la mezcla',
      'Inyectores obstruidos o con fugas',
      'Baja presión de combustible (bomba o filtro)',
      'Baja compresión en uno o más cilindros (desgaste interno)',
      'Sensor MAF sucio que falsea la mezcla',
    ],
    solutions: [
      'Leer con el escáner los contadores de misfire para ver qué cilindros fallan.',
      'Inspeccionar y reemplazar las bujías si están gastadas o sucias (revisar el juego completo).',
      'Probar las bobinas de encendido intercambiándolas entre cilindros para ver si el fallo "se mueve".',
      'Revisar los cables de alta tensión y sus conectores.',
      'Buscar fugas de vacío con limpiador en spray o prueba de humo.',
      'Comprobar la presión de combustible y el estado del filtro.',
      'Limpiar o probar los inyectores.',
      'Realizar una prueba de compresión si el fallo persiste, para descartar desgaste mecánico.',
    ],
  },
  {
    code: 'P0171',
    title: 'Sistema de Combustible Demasiado Pobre (Banco 1)',
    severity: 'Moderada',
    description:
      'El código P0171 significa que el motor funciona con una mezcla "pobre" en el banco 1: hay demasiado aire en proporción al combustible. La ECU lo detecta porque debe añadir cada vez más combustible (ajustes de combustible o "fuel trims" positivos y altos) para compensar. La causa número uno es la entrada de aire NO medido (fugas de vacío), aunque también puede deberse a falta de combustible. Circular mucho tiempo así puede provocar fallos de encendido y dañar el catalizador.',
    symptoms: [
      'Ralentí inestable o irregular',
      'Titubeos y falta de respuesta al acelerar',
      'Pérdida de potencia, sobre todo en subidas o con carga',
      'Posibles fallos de encendido (misfires) por mezcla pobre',
      'Tirones o "jaloneos" a baja velocidad',
      'Luz Check Engine encendida (a veces el único síntoma)',
      'Ligero aumento del consumo al compensar la ECU',
    ],
    causes: [
      'Fuga de vacío en la admisión, mangueras o juntas (la causa más frecuente)',
      'Sensor MAF (flujo de masa de aire) sucio o defectuoso',
      'Bomba de combustible débil o presión baja',
      'Filtro de combustible obstruido',
      'Inyectores sucios u obstruidos',
      'Junta del múltiple de admisión con fuga',
      'Válvula PCV o sus mangueras en mal estado',
      'Sensor de oxígeno anterior deteriorado',
    ],
    solutions: [
      'Revisar los ajustes de combustible (fuel trims) con un escáner para confirmar la condición de mezcla pobre.',
      'Hacer una prueba de humo para localizar fugas de vacío (lo más habitual).',
      'Limpiar el sensor MAF con limpiador específico (sin tocar el filamento).',
      'Comprobar la presión de combustible y el estado del filtro.',
      'Inspeccionar la válvula PCV y sus mangueras.',
      'Revisar la junta del múltiple de admisión.',
      'Limpiar o probar los inyectores.',
      'Borrar el código y verificar que los fuel trims vuelven a valores normales.',
    ],
  },
  {
    code: 'P0128',
    title: 'Temperatura del Refrigerante por Debajo del Termostato',
    severity: 'Baja',
    description:
      'El código P0128 indica que el motor tarda demasiado en alcanzar su temperatura de funcionamiento, o no llega a ella. La ECU lo detecta comparando el tiempo y la temperatura del refrigerante con lo esperado. En la inmensa mayoría de los casos la causa es un termostato pegado abierto, por lo que el refrigerante circula siempre y el motor nunca se calienta lo suficiente. No es peligroso para conducir, pero aumenta el consumo, las emisiones y el desgaste del motor en frío.',
    symptoms: [
      'Luz Check Engine encendida',
      'El motor tarda mucho en calentarse',
      'La calefacción tarda o no calienta bien',
      'El indicador de temperatura se queda más bajo de lo normal',
      'Ligero aumento del consumo de combustible',
      'Los síntomas son más notorios en climas fríos',
    ],
    causes: [
      'Termostato pegado abierto (la causa más común con diferencia)',
      'Sensor de temperatura del refrigerante (ECT) defectuoso o descalibrado',
      'Nivel de refrigerante bajo',
      'Ventilador de enfriamiento que funciona de forma continua sin motivo',
      'Termostato de apertura incorrecta instalado en una reparación previa',
    ],
    solutions: [
      'Comprobar el nivel y el estado del refrigerante.',
      'Reemplazar el termostato: es la solución correcta en la gran mayoría de los casos.',
      'Verificar el sensor de temperatura (ECT) con un escáner, comparando con la temperatura real del motor.',
      'Confirmar que el ventilador de enfriamiento no esté funcionando constantemente.',
      'Tras reparar, conducir hasta temperatura de operación y borrar el código.',
    ],
  },
  {
    code: 'P0442',
    title: 'Fuga Pequeña Detectada en el Sistema EVAP',
    severity: 'Baja',
    description:
      'El código P0442 indica una fuga pequeña en el sistema EVAP, el encargado de capturar los vapores de gasolina del tanque para que no salgan a la atmósfera. La ECU presuriza o hace vacío en el sistema y detecta una pérdida lenta. Lo más habitual —y lo primero que debes revisar— es la tapa del tanque de combustible mal cerrada o con el sello gastado. No afecta a la conducción, pero impide pasar la revisión de emisiones.',
    symptoms: [
      'Luz Check Engine encendida (con frecuencia el único síntoma)',
      'Ligero olor a gasolina en ocasiones',
      'Sin efectos en la conducción ni en el rendimiento',
      'No pasa la prueba de emisiones',
    ],
    causes: [
      'Tapa del tanque floja, mal enroscada o con el sello deteriorado (revisar SIEMPRE primero)',
      'Mangueras del sistema EVAP agrietadas o sueltas',
      'Válvula de purga (purge) con fuga o que no cierra bien',
      'Válvula de ventilación (vent) defectuosa',
      'Pequeña fisura en el canister de carbón activado',
      'Cuello de llenado del tanque dañado',
    ],
    solutions: [
      'Revisar, apretar y, si el sello está gastado, reemplazar la tapa del tanque (la causa más común y económica).',
      'Borrar el código y conducir varios ciclos: si era la tapa, no vuelve a aparecer.',
      'Hacer una prueba de humo en el sistema EVAP para localizar la fuga exacta.',
      'Inspeccionar visualmente todas las mangueras y conexiones EVAP.',
      'Probar las válvulas de purga y de ventilación.',
      'Revisar el canister de carbón activado.',
    ],
  },
];

async function main() {
  const generic = await prisma.manufacturer.findFirst({ where: { isGeneric: true } });
  if (!generic) {
    throw new Error('No se encontró el fabricante genérico (isGeneric=true). Corre primero el seed principal.');
  }

  for (const item of ENRICHED) {
    const letter = item.code[0].toUpperCase();
    const category = await prisma.oBDCategory.findUnique({ where: { code: letter } });
    if (!category) {
      console.warn(`⚠️  Categoría "${letter}" no encontrada para ${item.code}. Saltado.`);
      continue;
    }

    // Crea el código si no existe, o actualiza su contenido base si ya existe.
    const code = await prisma.oBDCode.upsert({
      where: { code_manufacturerId: { code: item.code, manufacturerId: generic.id } },
      update: {
        title: item.title,
        description: item.description,
        severity: item.severity,
        source: 'curado-carweb',
      },
      create: {
        code: item.code,
        title: item.title,
        description: item.description,
        severity: item.severity,
        status: 'PUBLISHED',
        source: 'curado-carweb',
        categoryId: category.id,
        manufacturerId: generic.id,
      },
    });

    // Reemplaza las listas por las versiones ampliadas (borra y vuelve a crear).
    await prisma.oBDSymptom.deleteMany({ where: { codeId: code.id } });
    await prisma.oBDCause.deleteMany({ where: { codeId: code.id } });
    await prisma.oBDSolution.deleteMany({ where: { codeId: code.id } });

    await prisma.oBDSymptom.createMany({ data: item.symptoms.map((symptom) => ({ codeId: code.id, symptom })) });
    await prisma.oBDCause.createMany({ data: item.causes.map((cause) => ({ codeId: code.id, cause })) });
    await prisma.oBDSolution.createMany({ data: item.solutions.map((solution) => ({ codeId: code.id, solution })) });

    console.log(
      `✅ ${item.code} enriquecido — ${item.symptoms.length} síntomas, ${item.causes.length} causas, ${item.solutions.length} soluciones`,
    );
  }
}

main()
  .then(() => console.log('🎉 Enriquecimiento de códigos completado.'))
  .catch((e) => {
    console.error('❌ Error al enriquecer:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
