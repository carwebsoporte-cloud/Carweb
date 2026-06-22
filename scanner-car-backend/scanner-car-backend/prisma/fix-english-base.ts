/* ============================================================
   Fix: restaura los títulos de los códigos OBDex a INGLÉS desde
   el YAML original de OBDex (fuente autoritativa).
   ------------------------------------------------------------
   Contexto: una corrida previa de `seed:translate-ai` (MT
   Xenova/opus-mt-en-es) dejó los títulos en español automático
   de mala calidad (p. ej. P0003 "Regulador de Vino", P0008
   "casa del motor") y ADEMÁS contaminó con español muchas filas
   `OBDCodeTranslation` locale='en'. Por eso no basta copiar la
   fila 'en' a la base: hay que re-traer el inglés del YAML.

   Decisión del proyecto: los códigos importados quedan en INGLÉS
   (objetivo de tráfico US/Canadá); el sitio sigue bilingüe. La
   descripción base, los síntomas y las causas de OBDex YA están
   en inglés (translate-ai solo tocó títulos), así que solo se
   corrigen los títulos: la columna base `obd_codes.title` y la
   fila `OBDCodeTranslation` locale='en'.

   NO toca los 468 códigos curados (source 'seed' / 'oem-curated').
   Idempotente: al re-correrlo, 0 cambios.
   Uso: npm run seed:fix-english   (requiere red para bajar el YAML)
   ============================================================ */

import { PrismaClient } from '@prisma/client';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

function loadDotenv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) return;
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (!m) continue;
      const key = m[1];
      let val = (m[2] ?? '').trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  } catch { /* ignore */ }
}

loadDotenv();
const prisma = new PrismaClient();

const YAML_URLS = [
  'https://raw.githubusercontent.com/foerbsnavi/OBDex/main/data/generic/P0xxx_enriched.yaml',
  'https://raw.githubusercontent.com/foerbsnavi/OBDex/main/data/generic/P2xxx_enriched.yaml',
  'https://raw.githubusercontent.com/foerbsnavi/OBDex/main/data/generic/P3xxx_enriched.yaml',
  'https://raw.githubusercontent.com/foerbsnavi/OBDex/main/data/generic/B0xxx_enriched.yaml',
  'https://raw.githubusercontent.com/foerbsnavi/OBDex/main/data/generic/C0xxx_enriched.yaml',
  'https://raw.githubusercontent.com/foerbsnavi/OBDex/main/data/generic/U0xxx_enriched.yaml',
  'https://raw.githubusercontent.com/foerbsnavi/OBDex/main/data/generic/U3xxx_enriched.yaml',
];

type OBDexEntry = { code: string; title?: { en?: string; de?: string } };

async function buildEnglishMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const url of YAML_URLS) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`  ⚠ ${url.split('/').pop()}: HTTP ${res.status}`);
        continue;
      }
      const entries = (yaml.load(await res.text()) as OBDexEntry[]) || [];
      let n = 0;
      for (const e of entries) {
        const en = e.title?.en;
        if (e.code && en) {
          map.set(e.code.toUpperCase(), en);
          n++;
        }
      }
      console.log(`  ${url.split('/').pop()}: ${n} títulos EN`);
    } catch (err) {
      console.warn(`  ⚠ Error en ${url}:`, (err as Error).message);
    }
  }
  return map;
}

async function main() {
  console.log('=== Fix: títulos OBDex → inglés (desde YAML OBDex) ===\n');
  console.log('Descargando títulos EN del YAML OBDex...');
  const enMap = await buildEnglishMap();
  console.log(`\nTotal títulos EN de referencia: ${enMap.size}\n`);
  if (enMap.size === 0) {
    console.error('❌ No se pudo descargar ningún YAML. Abortando (revisa la red).');
    process.exit(1);
  }

  // Códigos OBDex en BD (genéricos importados desde OBDex)
  const codes = await prisma.oBDCode.findMany({
    where: { source: { startsWith: 'OBDex' } },
    select: { id: true, code: true, title: true },
  });
  console.log(`Códigos OBDex en BD: ${codes.length}`);

  let baseFixed = 0;
  let enFixed = 0;
  let notInYaml = 0;

  for (const c of codes) {
    const en = enMap.get(c.code.toUpperCase());
    if (!en) { notInYaml++; continue; }

    if (c.title !== en) {
      await prisma.oBDCode.update({ where: { id: c.id }, data: { title: en } });
      baseFixed++;
    }
    // Corrige también la fila de traducción 'en' (estaba contaminada con español)
    const r = await prisma.oBDCodeTranslation.updateMany({
      where: { codeId: c.id, locale: 'en', NOT: { title: en } },
      data: { title: en },
    });
    enFixed += r.count;

    if ((baseFixed + enFixed) > 0 && (baseFixed % 500 === 0)) {
      console.log(`  ...${baseFixed} títulos base corregidos`);
    }
  }

  console.log(`\n=== Resumen ===`);
  console.log(`Títulos base corregidos a inglés: ${baseFixed}`);
  console.log(`Filas de traducción 'en' corregidas: ${enFixed}`);
  console.log(`Códigos sin match en el YAML (sin cambio): ${notInYaml}`);

  const samples = await prisma.oBDCode.findMany({
    where: { source: { startsWith: 'OBDex' }, code: { in: ['P0001', 'P0002', 'P0003', 'P0008', 'B0013'] } },
    select: { code: true, title: true },
    orderBy: { code: 'asc' },
  });
  console.log('\nMuestras post-fix:');
  for (const s of samples) console.log(`  ${s.code} → ${s.title}`);
}

main()
  .catch((e) => {
    console.error('FATAL:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
