/* ============================================================
   Seed script para códigos OEM (fabricante) desde Wal33D
   Dataset: Wal33D/dtc-database (MIT License)
   Fuente: https://github.com/Wal33D/dtc-database
   ------------------------------------------------------------
   Uso: npx ts-node prisma/seed-wal33d.ts
   ============================================================ */

import { PrismaClient } from '@prisma/client';
import { DatabaseSync } from 'node:sqlite';
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

// Mapeo: nombre en Wal33D → slug, nombre visible, país
const MANUFACTURER_MAP: Record<string, { slug: string; name: string; country: string | null }> = {
  ACURA: { slug: 'acura', name: 'Acura', country: 'Japón' },
  AUDI: { slug: 'audi', name: 'Audi', country: 'Alemania' },
  BMW: { slug: 'bmw', name: 'BMW', country: 'Alemania' },
  BUICK: { slug: 'buick', name: 'Buick', country: 'EE.UU.' },
  CADILLAC: { slug: 'cadillac', name: 'Cadillac', country: 'EE.UU.' },
  CHEVY: { slug: 'chevrolet', name: 'Chevrolet / GM', country: 'EE.UU.' },
  CHRYSLER: { slug: 'chrysler', name: 'Chrysler', country: 'EE.UU.' },
  DODGE: { slug: 'dodge', name: 'Dodge', country: 'EE.UU.' },
  FORD: { slug: 'ford', name: 'Ford', country: 'EE.UU.' },
  GEO: { slug: 'geo', name: 'Geo', country: 'EE.UU.' },
  GM: { slug: 'general-motors', name: 'General Motors', country: 'EE.UU.' },
  GMC: { slug: 'gmc', name: 'GMC', country: 'EE.UU.' },
  HONDA: { slug: 'honda', name: 'Honda', country: 'Japón' },
  INFINITI: { slug: 'infiniti', name: 'Infiniti', country: 'Japón' },
  JAGUAR: { slug: 'jaguar', name: 'Jaguar', country: 'Reino Unido' },
  JEEP: { slug: 'jeep', name: 'Jeep / Stellantis', country: 'EE.UU.' },
  KIA: { slug: 'kia', name: 'Kia', country: 'Corea del Sur' },
  LEXUS: { slug: 'lexus', name: 'Lexus', country: 'Japón' },
  LINCOLN: { slug: 'lincoln', name: 'Lincoln', country: 'EE.UU.' },
  MAZDA: { slug: 'mazda', name: 'Mazda', country: 'Japón' },
  MERCEDES: { slug: 'mercedes-benz', name: 'Mercedes-Benz', country: 'Alemania' },
  MERCURY: { slug: 'mercury', name: 'Mercury', country: 'EE.UU.' },
  MITSUBISHI: { slug: 'mitsubishi', name: 'Mitsubishi', country: 'Japón' },
  NISSAN: { slug: 'nissan', name: 'Nissan', country: 'Japón' },
  OLDSMOBILE: { slug: 'oldsmobile', name: 'Oldsmobile', country: 'EE.UU.' },
  OTHER: { slug: 'other', name: 'Otros fabricantes', country: null },
  PLYMOUTH: { slug: 'plymouth', name: 'Plymouth', country: 'EE.UU.' },
  PONTIAC: { slug: 'pontiac', name: 'Pontiac', country: 'EE.UU.' },
  SATURN: { slug: 'saturn', name: 'Saturn', country: 'EE.UU.' },
  SUBARU: { slug: 'subaru', name: 'Subaru', country: 'Japón' },
  SUZUKI: { slug: 'suzuki', name: 'Suzuki', country: 'Japón' },
  TOYOTA: { slug: 'toyota', name: 'Toyota', country: 'Japón' },
  VOLKSWAGEN: { slug: 'volkswagen', name: 'Volkswagen', country: 'Alemania' },
};

// Categoría por primera letra del código
const CAT_BY_LETTER: Record<string, string> = { P: 'P', B: 'B', C: 'C', U: 'U' };

async function main() {
  console.log('=== Seed Wal33D — Códigos OEM por Fabricante ===\n');

  // 1. Cargar categorías existentes
  const categories = await prisma.oBDCategory.findMany();
  const catMap: Record<string, number> = {};
  for (const c of categories) catMap[c.code] = c.id;
  console.log(`Categorías: ${Object.keys(catMap).length}`);

  // 2. Crear fabricantes faltantes
  const existingMgfs = await prisma.manufacturer.findMany();
  const existingSlugs = new Set(existingMgfs.map(m => m.slug));
  let created = 0;
  for (const [wal33dName, info] of Object.entries(MANUFACTURER_MAP)) {
    if (!existingSlugs.has(info.slug)) {
      await prisma.manufacturer.create({
        data: { slug: info.slug, name: info.name, isGeneric: false, country: info.country },
      });
      created++;
      console.log(`  + Fabricante creado: ${info.name} (${info.slug})`);
    }
  }
  console.log(`Fabricantes creados: ${created}`);

  // Recargar fabricantes con sus IDs
  const allMgfs = await prisma.manufacturer.findMany();
  const mfgBySlug: Record<string, number> = {};
  for (const m of allMgfs) mfgBySlug[m.slug] = m.id;

  // 3. Mapeo inverso: Wal33D name → slug
  const wal33dToSlug: Record<string, string> = {};
  for (const [name, info] of Object.entries(MANUFACTURER_MAP)) {
    wal33dToSlug[name] = info.slug;
  }

  // 4. Leer SQLite Wal33D
  console.log('\nLeyendo dtc_codes.db...');
  const dbPath = path.resolve(__dirname, 'dtc_codes.db');
  if (!fs.existsSync(dbPath)) {
    console.error('ERROR: dtc_codes.db no encontrado. Descárgalo desde:');
    console.error('  https://github.com/Wal33D/dtc-database/raw/main/data/dtc_codes.db');
    process.exit(1);
  }
  const db = new DatabaseSync(dbPath);

  const rows = db.prepare(
    "SELECT code, manufacturer, description, type, locale FROM dtc_definitions WHERE is_generic=0 AND locale='en' AND manufacturer IS NOT NULL AND manufacturer != ''"
  ).all() as any[];

  console.log(`Total filas OEM (en): ${rows.length}`);

  // 5. Agrupar por fabricante e insertar
  type CodeRow = { code: string; description: string; type: string };
  const byMfg: Record<string, CodeRow[]> = {};

  for (const row of rows) {
    const mfg = row.manufacturer as string;
    if (!byMfg[mfg]) byMfg[mfg] = [];
    byMfg[mfg].push({ code: row.code, description: row.description || '', type: row.type || 'P' });
  }

  let totalInserted = 0;
  let totalSkipped = 0;

  const BATCH_SIZE = 200;

  for (const [wal33dName, codes] of Object.entries(byMfg)) {
    const slug = wal33dToSlug[wal33dName];
    if (!slug) {
      console.warn(`  ⚠ Fabricante no mapeado: ${wal33dName} — ${codes.length} códigos omitidos`);
      totalSkipped += codes.length;
      continue;
    }

    const mfgId = mfgBySlug[slug];
    if (!mfgId) {
      console.warn(`  ⚠ Fabricante sin ID: ${slug} — ${codes.length} códigos omitidos`);
      totalSkipped += codes.length;
      continue;
    }

    const batch: {
      code: string;
      title: string;
      description: string;
      severity: string;
      source: string;
      categoryId: number;
      manufacturerId: number;
    }[] = [];

    for (const c of codes) {
      const catCode = CAT_BY_LETTER[c.type] || 'P';
      const catId = catMap[catCode];
      if (!catId) continue;

      // Usar description como title (campo único que tiene Wal33D)
      const title = c.description || c.code;
      // Truncar description a 200 chars si title y description son iguales
      const desc = c.description && c.description !== title ? c.description : '';

      batch.push({
        code: c.code,
        title,
        description: desc,
        severity: 'Moderada',
        source: 'Wal33D (MIT)',
        categoryId: catId,
        manufacturerId: mfgId,
      });
    }

    // Insertar en lotes
    for (let i = 0; i < batch.length; i += BATCH_SIZE) {
      const slice = batch.slice(i, i + BATCH_SIZE);
      const result = await prisma.oBDCode.createMany({ data: slice, skipDuplicates: true });
      totalInserted += result.count;
    }

    console.log(`  ${slug}: ${batch.length} códigos`);
  }

  db.close();
  console.log(`\n=== Resumen: ${totalInserted} insertados, ${totalSkipped} omitidos ===`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
