// Infraestructura de internacionalización (i18n).
// El español es el idioma base y vive en la raíz (/...); el inglés se sirve
// bajo el prefijo /en (rewrite en middleware). El idioma de cada request llega
// a los Server Components vía el header `x-locale` que pone el middleware, y a
// los Client Components vía <LocaleProvider> (ver components/LocaleProvider).

// La lógica de rutas e idioma vive en ./i18n-routes (sin diccionarios) para
// que el middleware la importe sin romper el Edge Runtime. Se re-exporta aquí
// para que todo lo que importa desde '@/lib/i18n' siga funcionando igual.
export * from './i18n-routes';
import type { Locale } from './i18n-routes';

// ── Diccionario de strings de UI ──────────────────────────────────────────
// El contenido editorial de los códigos (título, descripción, síntomas…) se
// traduce en la base de datos vía ?locale=; aquí solo va el chrome de la UI.

type Dict = {
  nav: {
    home: string; search: string; categories: string; diagnostico: string;
    guides: string; advertise: string; account: string; theme: string;
    openMenu: string; closeMenu: string; langLabel: string;
  };
  categories: { P: string; B: string; C: string; U: string };
  footer: {
    tagline: string; sections: string; resources: string; legal: string;
    search: string; diagnostico: string; guides: string; advertise: string;
    blog: string; privacy: string; terms: string; about: string; contact: string;
    rights: string; disclaimer: string;
  };
  card: { viewDiagnostic: string };
  search: {
    eyebrow: string; titleSearch: string; titleResultsPrefix: string;
    resultsSuffix: string; hintTitle: string; hintDesc: string;
    noResultsTitle: string; noResultsDesc: string;
    metaSearch: string; metaResultsPrefix: string; metaDescDefault: string;
    catMotor: string; catBody: string; catChassis: string; catNetwork: string;
    byCode: string; bySymptom: string; symptomTitle: string; symptomPlaceholder: string;
    symptomHintTitle: string; symptomHintDesc: string; symptomNoResults: string;
    symptomExamplesLabel: string; symptomExamples: string[];
  };
  searchBox: { placeholder: string; button: string; ariaLabel: string };
  diagnostico: {
    eyebrow: string; titleHl: string; titleRest: string; subtitle: string;
    stSystem: string; stSymptoms: string; stResults: string;
    q1Title: string; q1Sub: string; select: string; codesTpl: string;
    q2Title: string; q2Sub: string; continueBtn: string; loadingBtn: string;
    resultsFoundTpl: string; noConnection: string; systemLabel: string;
    symptomsCountTpl: string; reset: string; noConnBody: string; goSearch: string;
    symptomsReported: string; viewFullDiag: string; viewAllTpl: string;
    noResults: string; searchManually: string;
    systems: Record<'P' | 'B' | 'C' | 'U', { label: string; desc: string }>;
    symptoms: Record<string, string>;
  };
  variants: {
    genericTag: string; oemTagPrefix: string; alsoDefinedBy: string;
    viewGeneric: string; otherBrands: string;
    pickTitle: string; pickSubTpl: string; pickGeneric: string; pickGenericSub: string;
  };
  brands: {
    navLabel: string; title: string; subtitle: string; genericLabel: string;
    codesCountTpl: string; noCodes: string; backToBrands: string; brandCodesTpl: string;
    viewCodes: string; selectOne: string;
  };
  vehicle: {
    navLabel: string; eyebrow: string; title: string; subtitle: string;
    placeholder: string; decode: string; decoding: string; whereIsVin: string;
    invalidVin: string; notDecoded: string; serviceError: string;
    vehicleTitle: string; recallsTitle: string; recallsCountTpl: string; noRecalls: string;
    fMake: string; fModel: string; fYear: string; fTrim: string; fEngine: string;
    fFuel: string; fBody: string; fDrive: string; fTransmission: string; fType: string;
    fManufacturer: string; fPlant: string;
    rConsequence: string; rRemedy: string; rCampaign: string; recallNote: string;
  };
  category: {
    eyebrow: string; codesIn: string; noCodesTitle: string; noCodesDesc: string;
    backHome: string; page: string; of: string;
    selectOne: string; otherCategories: string; notFoundTitle: string;
    notFoundDesc: string; codesSuffix: string;
  };
  home: {
    heroTitlePre: string; heroTitleHl: string; heroSubtitle: string; heroPopular: string;
    catHeading: string; catViewCodes: string; catCodesSuffix: string;
    catSubP: string; catSubB: string; catSubC: string; catSubU: string;
    hiwHeading: string; hiwViewGuides: string;
    hiwS1T: string; hiwS1D: string; hiwS2T: string; hiwS2D: string;
    hiwS3T: string; hiwS3D: string; hiwS4T: string; hiwS4D: string;
    recentHeading: string; recentViewAll: string;
    popularEyebrow: string; popularTitle: string; popularSub: string;
  };
  code: {
    home: string; backToSearch: string;
    sevCriticalTitle: string; sevCriticalAdvice: string;
    sevModerateTitle: string; sevModerateAdvice: string;
    sevLowTitle: string; sevLowAdvice: string;
    compatibleWith: string; gasDiesel: string; electric: string; hybrid: string;
    symptomsTitle: string; symptomsSub: string;
    causesTitle: string; causesSub: string;
    solutionsTitle: string; solutionsSub: string;
    note: string; noteBody: string;
    costTitle: string; costSub: string; costFootnote: string; diagOnly: string;
    quickInfo: string; codeLabel: string; categoryLabel: string; severityLabel: string;
    symptomsCount: string; causesCount: string; solutionSteps: string;
    resourcesTitle: string; resourcesSub: string;
    videoTitle: string; videoSub: string; componentTitle: string; componentSub: string;
    manualTitle: string; manualSub: string;
    otherCodeTitle: string; otherCodeSub: string; searchPlaceholder: string;
    relatedTitle: string; adSidebar: string; adSlot: string;
  };
};

const es: Dict = {
  nav: {
    home: 'Inicio', search: 'Buscar Código', categories: 'Categorías', diagnostico: 'Diagnóstico',
    guides: 'Guías', advertise: 'Anunciarse', account: 'Cuenta', theme: 'Tema oscuro',
    openMenu: 'Abrir menú', closeMenu: 'Cerrar menú', langLabel: 'Idioma',
  },
  categories: { P: 'Motor (P)', B: 'Carrocería (B)', C: 'Chasis (C)', U: 'Red CAN (U)' },
  card: { viewDiagnostic: 'Ver diagnóstico' },
  search: {
    eyebrow: 'Buscador OBD2', titleSearch: 'Buscar Código de Falla', titleResultsPrefix: 'Resultados para',
    resultsSuffix: 'resultado(s) encontrado(s)', hintTitle: 'Escribe un código o palabra clave',
    hintDesc: 'Ingresa al menos 2 caracteres. Ej: P0420, P03, catalizador, sensor…',
    noResultsTitle: 'Sin resultados para', noResultsDesc: 'Verifica el código o intenta con otro término. Recuerda que los códigos OBD2 empiezan con P, B, C o U.',
    metaSearch: 'Buscar Código OBD2', metaResultsPrefix: 'Resultados para', metaDescDefault: 'Busca cualquier código de falla OBD2 y obtén su diagnóstico, causas y solución.',
    catMotor: 'Motor', catBody: 'Carrocería', catChassis: 'Chasis', catNetwork: 'Red CAN',
    byCode: 'Por código', bySymptom: 'Por síntoma', symptomTitle: 'Buscar por Síntoma', symptomPlaceholder: 'Ej: ralentí inestable, humo negro, pérdida de potencia…',
    symptomHintTitle: 'Describe lo que sientes en tu vehículo', symptomHintDesc: '¿No tienes el código? Escribe un síntoma y te mostramos los códigos OBD2 más probables.',
    symptomNoResults: 'Sin coincidencias para ese síntoma. Prueba con otras palabras (ej: ralentí, humo, vibración, consumo).',
    symptomExamplesLabel: 'Prueba con:', symptomExamples: ['ralentí inestable', 'humo negro', 'pérdida de potencia', 'consumo excesivo', 'vibración'],
  },
  searchBox: { placeholder: 'Ingresa tu código OBD2 (ej: P0420, P0300...)', button: 'Buscar', ariaLabel: 'Buscar código OBD2' },
  diagnostico: {
    eyebrow: 'Diagnóstico guiado', titleHl: 'Identifica', titleRest: ' el sistema afectado',
    subtitle: 'Responde 2 preguntas rápidas y encuentra los códigos OBD2 más probables para tu vehículo.',
    stSystem: 'Sistema', stSymptoms: 'Síntomas', stResults: 'Resultados',
    q1Title: '¿Qué sistema presenta fallas?', q1Sub: 'Selecciona el área del vehículo más relacionada con el problema.',
    select: 'Seleccionar', codesTpl: 'Códigos %sxxxx',
    q2Title: '¿Qué síntomas presenta el vehículo?', q2Sub: 'Selecciona todos los que apliquen (opcional). Puedes continuar sin seleccionar ninguno.',
    continueBtn: 'Ver diagnóstico →', loadingBtn: 'Consultando base de datos…',
    resultsFoundTpl: '%s códigos encontrados', noConnection: 'Sin conexión al servidor', systemLabel: 'Sistema:',
    symptomsCountTpl: '%s síntoma(s) registrado(s)', reset: '↺ Reiniciar',
    noConnBody: 'No se pudo conectar con el servidor. Verifica que el backend esté activo o busca el código directamente.',
    goSearch: 'Ir al buscador', symptomsReported: 'Síntomas reportados', viewFullDiag: 'Ver diagnóstico completo →',
    viewAllTpl: 'Ver todos los códigos %sxxxx', noResults: 'No se encontraron códigos para esta categoría en este momento.',
    searchManually: 'Buscar manualmente',
    systems: {
      P: { label: 'Motor / Tren de fuerza', desc: 'Motor, transmisión, combustible, emisiones y escape.' },
      B: { label: 'Carrocería / Interior', desc: 'Airbags, climatización, ventanas y accesorios eléctricos.' },
      C: { label: 'Chasis / Seguridad activa', desc: 'ABS, control de estabilidad, frenos y dirección asistida.' },
      U: { label: 'Red de comunicación', desc: 'CAN bus y comunicación entre módulos de control electrónico.' },
    },
    symptoms: {
      'check-engine': 'Luz "Check Engine" encendida', vibra: 'Motor vibra o tiembla (especialmente en ralentí)',
      potencia: 'Pérdida de potencia al acelerar', combustible: 'Consumo elevado de combustible',
      humo: 'Humo excesivo o inusual por el escape', arranque: 'Motor no arranca o tarda en arrancar',
      ruido: 'Ruidos inusuales en el motor', airbag: 'Luz de airbag / SRS encendida',
      ac: 'Aire acondicionado o calefacción sin funcionar', ventanas: 'Ventanas eléctricas sin respuesta',
      bocina: 'Bocina o alarma con fallos', 'tablero-b': 'Indicadores del tablero con errores',
      'abs-luz': 'Luz de ABS encendida', estabilidad: 'Luz de control de tracción o estabilidad',
      frenos: 'Frenos que vibran o no responden bien', direccion: 'Dirección asistida pesada o irregular',
      suspension: 'Suspensión irregular o ruidos al girar', multiples: 'Múltiples luces de advertencia a la vez',
      modulos: 'Módulos del vehículo sin respuesta', 'pantalla-u': 'Pantalla del tablero con errores o en blanco',
      'escaner-u': 'El escáner no logra comunicarse con el vehículo',
    },
  },
  variants: {
    genericTag: 'Genérico (SAE)', oemTagPrefix: 'Específico de', alsoDefinedBy: 'Este código también tiene una definición específica de marca:',
    viewGeneric: 'Ver versión genérica (SAE)', otherBrands: 'Ver en otra marca:',
    pickTitle: 'Código específico de marca', pickSubTpl: 'El código %s significa cosas distintas según el fabricante. Elige tu marca para ver la definición correcta:',
    pickGeneric: 'Versión genérica (SAE)', pickGenericSub: 'Definición universal del estándar',
  },
  brands: {
    navLabel: 'Marcas', title: 'Marcas de Vehículos', subtitle: 'Explora los códigos de falla específicos de cada fabricante. Un mismo código puede significar cosas distintas según la marca.',
    genericLabel: 'Genérico (SAE) — universal', codesCountTpl: '%s códigos', noCodes: 'Sin códigos específicos todavía', backToBrands: 'Volver a marcas',
    brandCodesTpl: 'Códigos de %s', viewCodes: 'Ver códigos', selectOne: 'Selecciona un código para ver el diagnóstico completo.',
  },
  vehicle: {
    navLabel: 'Mi Vehículo', eyebrow: 'Decodificador de VIN', title: 'Identifica tu Vehículo', subtitle: 'Ingresa el VIN (número de serie) y descubre marca, modelo, año, motor y los llamados a revisión (recalls) oficiales de tu vehículo.',
    placeholder: 'Ingresa los 17 caracteres del VIN', decode: 'Decodificar', decoding: 'Consultando NHTSA…',
    whereIsVin: 'El VIN está en el tablero (lado del conductor), en el marco de la puerta o en la tarjeta de propiedad. Datos por NHTSA (EE.UU.).',
    invalidVin: 'VIN inválido. Debe tener 17 caracteres (sin las letras I, O ni Q).', notDecoded: 'No se pudo decodificar este VIN.', serviceError: 'No se pudo conectar con el servicio de NHTSA. Intenta de nuevo.',
    vehicleTitle: 'Datos del Vehículo', recallsTitle: 'Llamados a Revisión (Recalls)', recallsCountTpl: '%s recall(s) encontrados', noRecalls: 'Sin recalls registrados para este vehículo. 👍',
    fMake: 'Marca', fModel: 'Modelo', fYear: 'Año', fTrim: 'Versión', fEngine: 'Motor', fFuel: 'Combustible', fBody: 'Carrocería', fDrive: 'Tracción', fTransmission: 'Transmisión', fType: 'Tipo', fManufacturer: 'Fabricante', fPlant: 'País de ensamblaje',
    rConsequence: 'Riesgo', rRemedy: 'Solución', rCampaign: 'Campaña', recallNote: 'Información oficial de NHTSA (EE.UU.). La cobertura puede variar fuera de Norteamérica.',
  },
  category: {
    eyebrow: 'Categoría OBD2', codesIn: 'Códigos de', noCodesTitle: 'No hay códigos',
    noCodesDesc: 'No se encontraron códigos en esta categoría.',
    backHome: 'Volver al inicio', page: 'Página', of: 'de',
    selectOne: 'Selecciona uno para ver el diagnóstico detallado.', otherCategories: 'Otras Categorías',
    notFoundTitle: 'Categoría no encontrada', notFoundDesc: 'La categoría no existe.', codesSuffix: 'código(s) en esta categoría.',
  },
  footer: {
    tagline: 'La enciclopedia profesional de códigos OBD2. Diagnostica cualquier falla de tu vehículo con información clara y confiable.',
    sections: 'Navegación', resources: 'Recursos', legal: 'Legal',
    search: 'Buscar Código', diagnostico: 'Diagnóstico', guides: 'Guías', advertise: 'Anunciarse',
    blog: 'Blog', privacy: 'Privacidad', terms: 'Términos', about: 'Acerca de', contact: 'Contacto',
    rights: 'Todos los derechos reservados.',
    disclaimer: 'La información es de referencia general. Consulta siempre con un mecánico certificado.',
  },
  home: {
    heroTitlePre: 'Diagnóstico OBD2 ', heroTitleHl: 'Inteligente',
    heroSubtitle: 'Encuentra cualquier código OBD2, comprende la falla y descubre la solución paso a paso.',
    heroPopular: 'Códigos populares:',
    catHeading: 'Explora por Categoría', catViewCodes: 'Ver códigos', catCodesSuffix: 'códigos',
    catSubP: 'Códigos del tren motriz y sistema del motor',
    catSubB: 'Sistemas de confort, airbags, puertas y más',
    catSubC: 'Frenos ABS, suspensión, dirección y estabilidad',
    catSubU: 'Comunicación entre módulos y redes del vehículo',
    hiwHeading: '¿Cómo funciona?', hiwViewGuides: 'Ver Guías de Diagnóstico',
    hiwS1T: 'Conecta el escáner', hiwS1D: 'Conecta tu escáner OBD2 al puerto de diagnóstico del vehículo.',
    hiwS2T: 'Lee el código', hiwS2D: 'El sistema identifica el código de falla almacenado en la ECU.',
    hiwS3T: 'Diagnóstico', hiwS3D: 'Encuentra causas, síntomas y posibles soluciones al instante.',
    hiwS4T: 'Soluciona', hiwS4D: 'Repara y borra el código verificando el resultado final.',
    recentHeading: 'Códigos Consultados Recientemente', recentViewAll: 'Ver todos',
    popularEyebrow: 'Más buscados', popularTitle: 'Códigos Populares', popularSub: 'Los códigos de falla más consultados en la plataforma.',
  },
  code: {
    home: 'Inicio', backToSearch: 'Volver al buscador',
    sevCriticalTitle: '¿Puedo seguir conduciendo? NO',
    sevCriticalAdvice: 'DETÉN el vehículo en un lugar seguro. Continuar manejando puede causar daños graves al motor o poner en riesgo tu seguridad.',
    sevModerateTitle: '¿Puedo seguir conduciendo? Con precaución',
    sevModerateAdvice: 'Puedes manejar hasta el taller, pero no postpongas la reparación. El problema puede empeorar y dañar otros componentes.',
    sevLowTitle: '¿Puedo seguir conduciendo? Sí',
    sevLowAdvice: 'Puedes seguir manejando con normalidad. Agenda una revisión próxima para no afectar las emisiones o el rendimiento.',
    compatibleWith: 'Compatible con:', gasDiesel: '🚗 Gasolina/Diésel', electric: '⚡ Eléctrico', hybrid: '🔋 Híbrido',
    symptomsTitle: 'Síntomas que Notarás', symptomsSub: 'Lo que puedes observar cuando aparece este código',
    causesTitle: 'Posibles Causas', causesSub: 'Los componentes o condiciones que generan este código',
    solutionsTitle: 'Cómo Solucionarlo — Paso a Paso', solutionsSub: 'Procedimiento recomendado de diagnóstico y reparación',
    note: 'Nota:', noteBody: 'Esta información es de referencia general. Para diagnósticos precisos y reparaciones de seguridad, consulta siempre con un mecánico certificado.',
    costTitle: 'Costo Estimado', costSub: 'Rango aproximado en USD (varía por región y taller)',
    costFootnote: 'Solo diagnóstico: $50–$150', diagOnly: 'Solo diagnóstico: $50–$150',
    quickInfo: 'Información Rápida', codeLabel: 'Código', categoryLabel: 'Categoría', severityLabel: 'Severidad',
    symptomsCount: 'Síntomas', causesCount: 'Causas', solutionSteps: 'Pasos de solución',
    resourcesTitle: 'Recursos para Profundizar', resourcesSub: 'Videos, imágenes y manuales de servicio',
    videoTitle: 'Video Tutorial', videoSub: 'Ver en YouTube', componentTitle: 'Ver Componente', componentSub: 'Imágenes del sensor',
    manualTitle: 'Manual de Servicio', manualSub: 'Buscar manual PDF',
    otherCodeTitle: '¿Tienes Otro Código?', otherCodeSub: 'Búscalo directamente:', searchPlaceholder: 'Ej: P0420',
    relatedTitle: 'Códigos Relacionados', adSidebar: 'Espacio Publicitario · Sidebar AdSense', adSlot: 'Espacio Publicitario — Google AdSense',
  },
};

const en: Dict = {
  nav: {
    home: 'Home', search: 'Search Code', categories: 'Categories', diagnostico: 'Diagnosis',
    guides: 'Guides', advertise: 'Advertise', account: 'Account', theme: 'Dark theme',
    openMenu: 'Open menu', closeMenu: 'Close menu', langLabel: 'Language',
  },
  categories: { P: 'Powertrain (P)', B: 'Body (B)', C: 'Chassis (C)', U: 'Network (U)' },
  card: { viewDiagnostic: 'View diagnosis' },
  search: {
    eyebrow: 'OBD2 Search', titleSearch: 'Search Fault Code', titleResultsPrefix: 'Results for',
    resultsSuffix: 'result(s) found', hintTitle: 'Type a code or keyword',
    hintDesc: 'Enter at least 2 characters. e.g. P0420, P03, catalytic converter, sensor…',
    noResultsTitle: 'No results for', noResultsDesc: 'Check the code or try another term. Remember OBD2 codes start with P, B, C or U.',
    metaSearch: 'Search OBD2 Code', metaResultsPrefix: 'Results for', metaDescDefault: 'Search any OBD2 fault code and get its diagnosis, causes and fix.',
    catMotor: 'Powertrain', catBody: 'Body', catChassis: 'Chassis', catNetwork: 'Network',
    byCode: 'By code', bySymptom: 'By symptom', symptomTitle: 'Search by Symptom', symptomPlaceholder: 'e.g. rough idle, black smoke, power loss…',
    symptomHintTitle: 'Describe what you feel in your vehicle', symptomHintDesc: "Don't have the code? Type a symptom and we'll show the most likely OBD2 codes.",
    symptomNoResults: 'No matches for that symptom. Try other words (e.g. idle, smoke, vibration, consumption).',
    symptomExamplesLabel: 'Try:', symptomExamples: ['rough idle', 'black smoke', 'power loss', 'high consumption', 'vibration'],
  },
  searchBox: { placeholder: 'Enter your OBD2 code (e.g. P0420, P0300...)', button: 'Search', ariaLabel: 'Search OBD2 code' },
  diagnostico: {
    eyebrow: 'Guided diagnosis', titleHl: 'Identify', titleRest: ' the affected system',
    subtitle: 'Answer 2 quick questions and find the most likely OBD2 codes for your vehicle.',
    stSystem: 'System', stSymptoms: 'Symptoms', stResults: 'Results',
    q1Title: 'Which system is failing?', q1Sub: 'Select the vehicle area most related to the problem.',
    select: 'Select', codesTpl: '%s codes',
    q2Title: 'What symptoms does the vehicle have?', q2Sub: 'Select all that apply (optional). You can continue without selecting any.',
    continueBtn: 'See diagnosis →', loadingBtn: 'Querying the database…',
    resultsFoundTpl: '%s codes found', noConnection: 'No server connection', systemLabel: 'System:',
    symptomsCountTpl: '%s symptom(s) recorded', reset: '↺ Restart',
    noConnBody: 'Could not connect to the server. Make sure the backend is running or search for the code directly.',
    goSearch: 'Go to search', symptomsReported: 'Reported symptoms', viewFullDiag: 'See full diagnosis →',
    viewAllTpl: 'See all %s codes', noResults: 'No codes were found for this category at the moment.',
    searchManually: 'Search manually',
    systems: {
      P: { label: 'Engine / Powertrain', desc: 'Engine, transmission, fuel, emissions and exhaust.' },
      B: { label: 'Body / Interior', desc: 'Airbags, climate control, windows and electrical accessories.' },
      C: { label: 'Chassis / Active safety', desc: 'ABS, stability control, brakes and power steering.' },
      U: { label: 'Communication network', desc: 'CAN bus and communication between electronic control modules.' },
    },
    symptoms: {
      'check-engine': 'Check Engine light on', vibra: 'Engine vibrates or shakes (especially at idle)',
      potencia: 'Power loss on acceleration', combustible: 'High fuel consumption',
      humo: 'Excessive or unusual exhaust smoke', arranque: 'Engine does not start or is slow to start',
      ruido: 'Unusual engine noises', airbag: 'Airbag / SRS light on',
      ac: 'Air conditioning or heating not working', ventanas: 'Power windows unresponsive',
      bocina: 'Horn or alarm faults', 'tablero-b': 'Dashboard indicators showing errors',
      'abs-luz': 'ABS light on', estabilidad: 'Traction or stability control light',
      frenos: 'Brakes that vibrate or respond poorly', direccion: 'Heavy or irregular power steering',
      suspension: 'Irregular suspension or noises when turning', multiples: 'Multiple warning lights at once',
      modulos: 'Vehicle modules unresponsive', 'pantalla-u': 'Dashboard screen with errors or blank',
      'escaner-u': 'The scanner cannot communicate with the vehicle',
    },
  },
  variants: {
    genericTag: 'Generic (SAE)', oemTagPrefix: 'Specific to', alsoDefinedBy: 'This code also has a manufacturer-specific definition:',
    viewGeneric: 'View generic (SAE) version', otherBrands: 'View on another brand:',
    pickTitle: 'Manufacturer-specific code', pickSubTpl: 'Code %s means different things depending on the manufacturer. Choose your brand to see the correct definition:',
    pickGeneric: 'Generic (SAE) version', pickGenericSub: 'Universal standard definition',
  },
  brands: {
    navLabel: 'Brands', title: 'Vehicle Brands', subtitle: 'Browse the manufacturer-specific fault codes. The same code can mean different things depending on the brand.',
    genericLabel: 'Generic (SAE) — universal', codesCountTpl: '%s codes', noCodes: 'No specific codes yet', backToBrands: 'Back to brands',
    brandCodesTpl: '%s Codes', viewCodes: 'View codes', selectOne: 'Select a code to see the full diagnosis.',
  },
  vehicle: {
    navLabel: 'My Vehicle', eyebrow: 'VIN Decoder', title: 'Identify Your Vehicle', subtitle: 'Enter the VIN (serial number) and find out the make, model, year, engine and official safety recalls for your vehicle.',
    placeholder: 'Enter the 17-character VIN', decode: 'Decode', decoding: 'Querying NHTSA…',
    whereIsVin: 'The VIN is on the dashboard (driver side), the door frame or the registration card. Data by NHTSA (USA).',
    invalidVin: 'Invalid VIN. It must be 17 characters (without the letters I, O or Q).', notDecoded: 'This VIN could not be decoded.', serviceError: 'Could not connect to the NHTSA service. Please try again.',
    vehicleTitle: 'Vehicle Details', recallsTitle: 'Safety Recalls', recallsCountTpl: '%s recall(s) found', noRecalls: 'No recalls on record for this vehicle. 👍',
    fMake: 'Make', fModel: 'Model', fYear: 'Year', fTrim: 'Trim', fEngine: 'Engine', fFuel: 'Fuel', fBody: 'Body', fDrive: 'Drive', fTransmission: 'Transmission', fType: 'Type', fManufacturer: 'Manufacturer', fPlant: 'Assembly country',
    rConsequence: 'Risk', rRemedy: 'Remedy', rCampaign: 'Campaign', recallNote: 'Official NHTSA (USA) data. Coverage may vary outside North America.',
  },
  category: {
    eyebrow: 'OBD2 Category', codesIn: 'Codes', noCodesTitle: 'No codes',
    noCodesDesc: 'No codes were found in this category.',
    backHome: 'Back to home', page: 'Page', of: 'of',
    selectOne: 'Select one to see the detailed diagnosis.', otherCategories: 'Other Categories',
    notFoundTitle: 'Category not found', notFoundDesc: 'The category does not exist.', codesSuffix: 'code(s) in this category.',
  },
  footer: {
    tagline: 'The professional OBD2 trouble-code encyclopedia. Diagnose any vehicle fault with clear, reliable information.',
    sections: 'Navigation', resources: 'Resources', legal: 'Legal',
    search: 'Search Code', diagnostico: 'Diagnosis', guides: 'Guides', advertise: 'Advertise',
    blog: 'Blog', privacy: 'Privacy', terms: 'Terms', about: 'About', contact: 'Contact',
    rights: 'All rights reserved.',
    disclaimer: 'Information is for general reference. Always consult a certified mechanic.',
  },
  home: {
    heroTitlePre: 'Smart OBD2 ', heroTitleHl: 'Diagnostics',
    heroSubtitle: 'Find any OBD2 code, understand the failure and discover the step-by-step fix.',
    heroPopular: 'Popular codes:',
    catHeading: 'Browse by Category', catViewCodes: 'View codes', catCodesSuffix: 'codes',
    catSubP: 'Powertrain and engine system codes',
    catSubB: 'Comfort systems, airbags, doors and more',
    catSubC: 'ABS brakes, suspension, steering and stability',
    catSubU: 'Communication between modules and vehicle networks',
    hiwHeading: 'How does it work?', hiwViewGuides: 'View Diagnostic Guides',
    hiwS1T: 'Connect the scanner', hiwS1D: 'Plug your OBD2 scanner into the vehicle diagnostic port.',
    hiwS2T: 'Read the code', hiwS2D: 'The system identifies the fault code stored in the ECU.',
    hiwS3T: 'Diagnosis', hiwS3D: 'Find causes, symptoms and possible fixes instantly.',
    hiwS4T: 'Fix it', hiwS4D: 'Repair and clear the code, verifying the final result.',
    recentHeading: 'Recently Viewed Codes', recentViewAll: 'View all',
    popularEyebrow: 'Most searched', popularTitle: 'Popular Codes', popularSub: 'The most-viewed fault codes on the platform.',
  },
  code: {
    home: 'Home', backToSearch: 'Back to search',
    sevCriticalTitle: 'Can I keep driving? NO',
    sevCriticalAdvice: 'STOP the vehicle in a safe place. Continuing to drive may cause serious engine damage or put your safety at risk.',
    sevModerateTitle: 'Can I keep driving? With caution',
    sevModerateAdvice: 'You can drive to the shop, but do not postpone the repair. The problem may worsen and damage other components.',
    sevLowTitle: 'Can I keep driving? Yes',
    sevLowAdvice: 'You can keep driving normally. Schedule a check soon so emissions and performance are not affected.',
    compatibleWith: 'Compatible with:', gasDiesel: '🚗 Gas/Diesel', electric: '⚡ Electric', hybrid: '🔋 Hybrid',
    symptomsTitle: 'Symptoms You Will Notice', symptomsSub: 'What you may observe when this code appears',
    causesTitle: 'Possible Causes', causesSub: 'The components or conditions that trigger this code',
    solutionsTitle: 'How to Fix It — Step by Step', solutionsSub: 'Recommended diagnostic and repair procedure',
    note: 'Note:', noteBody: 'This information is for general reference. For precise diagnostics and safety repairs, always consult a certified mechanic.',
    costTitle: 'Estimated Cost', costSub: 'Approximate range in USD (varies by region and shop)',
    costFootnote: 'Diagnosis only: $50–$150', diagOnly: 'Diagnosis only: $50–$150',
    quickInfo: 'Quick Info', codeLabel: 'Code', categoryLabel: 'Category', severityLabel: 'Severity',
    symptomsCount: 'Symptoms', causesCount: 'Causes', solutionSteps: 'Solution steps',
    resourcesTitle: 'Dig Deeper', resourcesSub: 'Videos, images and service manuals',
    videoTitle: 'Video Tutorial', videoSub: 'Watch on YouTube', componentTitle: 'View Component', componentSub: 'Sensor images',
    manualTitle: 'Service Manual', manualSub: 'Find PDF manual',
    otherCodeTitle: 'Have Another Code?', otherCodeSub: 'Look it up directly:', searchPlaceholder: 'e.g. P0420',
    relatedTitle: 'Related Codes', adSidebar: 'Advertising Space · Sidebar AdSense', adSlot: 'Advertising Space — Google AdSense',
  },
};

const DICTS: Record<Locale, Dict> = { es, en };

export function getDict(locale: Locale): Dict {
  return DICTS[locale];
}
