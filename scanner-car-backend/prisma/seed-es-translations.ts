/* ============================================================
   ⛔ DEPRECADO — NO USAR. Generaba filas ES placeholder (copia del
   inglés) para una traducción que se descartó. Los códigos
   importados quedan en inglés.
   ============================================================
   Seed: Crea OBDCodeTranslation locale='es' para OBDex codes
   - Copia title EN → ES (traducción real pendiente)
   - Actualiza base columns a EN (temporal)
   - Crea OBDCodeTranslation locale='es' con mismo EN
   - La traducción EN→ES real se hará offline con
     @xenova/transformers (ver seed-es-translate-ai.ts)
   ============================================================ */

import { PrismaClient } from '@prisma/client';
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
const BATCH_SIZE = 500;

async function main() {
  console.log('=== Traducción EN→ES: OBDex Codes ===\n');

  // Cargar fabricante genérico
  const generic = await prisma.manufacturer.findFirst({ where: { isGeneric: true } });
  if (!generic) { console.error('Fabricante genérico no encontrado'); return; }

  // Buscar códigos OBDex SIN traducción ES
  const obdexCodes = await prisma.oBDCode.findMany({
    where: { manufacturerId: generic.id, source: { startsWith: 'OBDex' } },
    select: { id: true, code: true, title: true, description: true },
  });

  // Filtrar los que ya tienen traducción ES
  const existingEs = await prisma.oBDCodeTranslation.findMany({
    where: { locale: 'es', codeId: { in: obdexCodes.map(c => c.id) } },
    select: { codeId: true },
  });
  const existingEsSet = new Set(existingEs.map(t => t.codeId));

  const toTranslate = obdexCodes.filter(c => !existingEsSet.has(c.id));
  console.log(`Total códigos OBDex: ${obdexCodes.length}`);
  console.log(`Ya traducidos al ES: ${existingEs.length}`);
  console.log(`Por traducir: ${toTranslate.length}\n`);

  if (toTranslate.length === 0) {
    console.log('Nada que traducir.');
    return;
  }

  console.log('Copiando EN→ES (traducción real pendiente)...');

  let updated = 0;
  let created = 0;
  let failed = 0;

  for (let i = 0; i < toTranslate.length; i += BATCH_SIZE) {
    const batch = toTranslate.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(toTranslate.length / BATCH_SIZE);

    try {
      // Actualizar base columns (title mantiene su EN por ahora)
      const updateData = batch.map(c => ({
        where: { id: c.id },
        data: { title: c.title }, // mantiene EN
      }));

      // Crear OBDCodeTranslation locale='es' con el mismo EN (placeholder)
      const transData = batch.map(c => ({
        codeId: c.id,
        locale: 'es',
        title: c.title,
        description: c.description,
      }));

      const result = await prisma.oBDCodeTranslation.createMany({
        data: transData,
        skipDuplicates: true,
      });

      updated += batch.length;
      created += result.count;
      const pct = ((i + batch.length) / toTranslate.length * 100).toFixed(1);
      console.log(`[${batchNum}/${totalBatches}] ${i + 1}-${i + batch.length} → ${pct}% (${result.count} nuevas)`);
    } catch (err) {
      failed += batch.length;
      console.error(`  ✗ Error en lote ${batchNum}:`, (err as Error).message.substring(0, 150));
    }
  }

  console.log(`\n=== Resumen: ${updated} procesados, ${created} traducciones ES creadas, ${failed} errores ===`);
  if (created > 0) {
    console.log('\n⚠️  Las traducciones ES contienen el texto EN original.');
    console.log('   Para traducción real, ejecutar offline: npm run seed:translate-ai');
    console.log('   (requiere @xenova/transformers, ~30 min en CPU o <1 min con GPU)');
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
