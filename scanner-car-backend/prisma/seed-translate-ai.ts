/* ============================================================
   ⛔ DEPRECADO — NO USAR. Esta MT EN→ES dejó títulos en español
   roto y contaminó filas 'en'. Los códigos importados quedan en
   inglés; para reparar usar `npm run seed:fix-english`.
   ============================================================
   Seed: Traduce EN→ES usando @xenova/transformers (local, gratis)
   - Detecta códigos OBDex con title en inglés (placeholder)
   - Traduce title EN→ES en lotes de 50
   - Actualiza base columns (title) con español real
   - Crea OBDCodeTranslation locale='en' con el inglés original
   - Requiere: @xenova/transformers
   Uso: npm run seed:translate-ai
   Tiempo estimado: ~30 min en CPU, <1 min con GPU
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
const BATCH_SIZE = 50;

async function main() {
  console.log('=== Traducción EN→ES con AI (Xenova/opus-mt-en-es) ===\n');

  // Encontrar fabricante genérico
  const generic = await prisma.manufacturer.findFirst({ where: { isGeneric: true } });
  if (!generic) { console.error('Fabricante genérico no encontrado'); return; }

  // Buscar códigos OBDex con sus traducciones EN
  const toTranslate = await prisma.oBDCode.findMany({
    where: { manufacturerId: generic.id, source: { startsWith: 'OBDex' } },
    select: { id: true, code: true, title: true },
    orderBy: { code: 'asc' },
  });

  // Cargar las traducciones EN para todos estos códigos
  const allIds = toTranslate.map(c => c.id);
  const enTranslations = await prisma.oBDCodeTranslation.findMany({
    where: { codeId: { in: allIds }, locale: 'en' },
    select: { codeId: true, title: true },
  });
  const enByCodeId = new Map(enTranslations.map(t => [t.codeId, t.title]));

  // Excluir los que ya fueron traducidos al español
  // Regla: si base.title ≠ translation('en').title → ya está traducido (ES vs EN)
  const needsTranslation = toTranslate.filter(c => {
    const enTitle = enByCodeId.get(c.id);
    if (!enTitle) return true; // no tiene traducción EN → necesita traducción
    return c.title === enTitle; // son iguales → base sigue en inglés
  });

  // De los que ya están traducidos: verificar que tengan su EN translation correcta
  const alreadyTranslated = toTranslate.filter(c => {
    const enTitle = enByCodeId.get(c.id);
    return enTitle && c.title !== enTitle;
  });

  console.log(`Códigos OBDex totales: ${toTranslate.length}`);
  console.log(`Ya traducidos (salteando): ${alreadyTranslated.length}`);
  console.log(`Por traducir: ${needsTranslation.length}`);

  if (needsTranslation.length === 0) {
    console.log('\n✅ No hay códigos pendientes de traducción.');
    return;
  }

  // Inicializar modelo
  console.log('\nCargando modelo Xenova/opus-mt-en-es (descarga única ~300MB)...');
  const { pipeline } = await import('@xenova/transformers');
  const translator = await pipeline('translation', 'Xenova/opus-mt-en-es');
  console.log('✅ Modelo listo.\n');

  let translated = 0;
  let failed = 0;

  for (let i = 0; i < needsTranslation.length; i += BATCH_SIZE) {
    const batch = needsTranslation.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(needsTranslation.length / BATCH_SIZE);

    try {
      // Traducir titles en lote
      const titles = batch.map(c => (c.title || c.code).substring(0, 200));
      const results = await translator(titles, { src_lang: 'en', tgt_lang: 'es' } as any) as { translation_text: string }[];

      // Preparar updates en paralelo
      const updates = batch.map((code, idx) => {
        const esTitle = results[idx]?.translation_text?.trim();
        if (!esTitle || esTitle === code.title) return null;

        return {
          id: code.id,
          esTitle,
          enTitle: code.title,
        };
      }).filter(Boolean) as { id: number; esTitle: string; enTitle: string }[];

      if (updates.length > 0) {
        // Actualizar base con español
        await prisma.$transaction(
          updates.map(u =>
            prisma.oBDCode.update({
              where: { id: u.id },
              data: { title: u.esTitle },
            })
          )
        );

        // Crear/actualizar traducción EN con el inglés original
        for (const u of updates) {
          await prisma.oBDCodeTranslation.upsert({
            where: { codeId_locale: { codeId: u.id, locale: 'en' } },
            create: { codeId: u.id, locale: 'en', title: u.enTitle },
            update: { title: u.enTitle },
          });
        }
      }

      translated += batch.length;
      const pct = ((i + batch.length) / needsTranslation.length * 100).toFixed(1);
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const rate = (translated / Math.max(elapsed, 1)).toFixed(1);
      console.log(`[${batchNum}/${totalBatches}] ${translated}/${needsTranslation.length} (${pct}%) · ${rate} codes/s · ${elapsed}s`);
    } catch (err) {
      failed += batch.length;
      console.error(`  ✗ Error lote ${batchNum}:`, (err as Error).message.substring(0, 120));
    }
  }

  const totalTime = Math.round((Date.now() - startTime) / 60);
  console.log(`\n=== Resumen: ${translated} traducidos, ${failed} errores en ${totalTime} min ===`);
}

const startTime = Date.now();

main()
  .catch(e => { console.error('FATAL:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
