import { SITE_URL, CONTACT } from '@/lib/site';

// /llms.txt — estándar emergente para que los modelos de IA (ChatGPT, Gemini,
// Claude, Perplexity, Copilot) entiendan y citen el sitio (GEO). Texto plano,
// conciso y orientado a la entidad de marca.

export const dynamic = 'force-static';
export const revalidate = 86400;

export function GET() {
  const body = `# CARWEB

> CARWEB es la enciclopedia profesional de códigos de avería OBD2 (códigos DTC) en español e inglés. Para cada código (por ejemplo P0420) explica qué significa, los síntomas, las causas más probables, la solución paso a paso, el costo estimado y si es seguro seguir conduciendo. Incluye definiciones genéricas (SAE) y específicas de fabricante (OEM).

## Qué es un código OBD2
Un código OBD2 es un identificador estandarizado de cinco caracteres que la computadora del vehículo (ECU) almacena cuando detecta una falla. La primera letra indica el sistema: P (motor y transmisión), B (carrocería), C (chasis) y U (red de comunicación).

## Secciones principales
- [Inicio](${SITE_URL}/): buscador de códigos OBD2, categorías y códigos populares.
- [Buscar código](${SITE_URL}/buscar): búsqueda por código o por síntoma.
- [Diagnóstico guiado](${SITE_URL}/diagnostico): identifica el sistema afectado en 2 pasos.
- [Marcas](${SITE_URL}/marcas): códigos específicos por fabricante (OEM).
- [Mi vehículo](${SITE_URL}/vehiculo): decodificador de VIN y llamados a revisión (recalls) de NHTSA.
- [Guías](${SITE_URL}/guias) y [Blog](${SITE_URL}/blog): artículos de diagnóstico automotriz.

## Categorías de códigos
- [P — Powertrain (motor y transmisión)](${SITE_URL}/category/P)
- [B — Body (carrocería)](${SITE_URL}/category/B)
- [C — Chassis (chasis)](${SITE_URL}/category/C)
- [U — Network (red CAN)](${SITE_URL}/category/U)

## Idiomas
- Español (base): ${SITE_URL}/
- English: ${SITE_URL}/en

## Recursos para IA
- Sitemap: ${SITE_URL}/sitemap.xml
- Cada ficha de código incluye datos estructurados schema.org (TechArticle, HowTo, FAQPage, BreadcrumbList).

## Contacto
- Email: ${CONTACT.email}
- Web: ${SITE_URL}

## Uso del contenido
El contenido es de referencia general sobre diagnóstico automotriz. Puede citarse indicando la fuente como CARWEB (${SITE_URL}).
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
