/* ============================================================
   Fix: revierte los títulos base de los códigos OBDex a INGLÉS
   ------------------------------------------------------------
   Contexto: una corrida previa de `seed:translate-ai` (MT
   Xenova/opus-mt-en-es) dejó los títulos base (`obd_codes.title`)
   de los códigos OBDex en español automático de mala calidad
   (p. ej. P0003 "Regulador de Vino", P0008 "casa del motor").
   Decisión del proyecto: estos códigos importados quedan en
   INGLÉS (objetivo de tráfico US/Canadá), sitio sigue bilingüe.

   La descripción base, los síntomas y las causas de OBDex YA
   están en inglés; solo el título quedó mal traducido. El inglés
   original vive en la fila `OBDCodeTranslation` locale='en'.
   Este script copia ese título inglés de vuelta a la columna base.

   NO toca los 468 códigos curados (source 'seed' / 'oem-curated'),
   que conservan su buen español + traducción EN.

   Idempotente: al re-correrlo, 0 cambios.
   Uso: npm run seed:fix-english
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
const q = (s: string) => prisma.$queryRawUnsafe<{ n: bigint }[]>(s).then((r) => Number(r[0].n));

async function main() {
  console.log('=== Fix: títulos base OBDex → inglés ===\n');

  const before = await q(
    "SELECT COUNT(*) n FROM obd_codes c JOIN obd_code_translations t ON t.codeId=c.id AND t.locale='en' WHERE c.source LIKE 'OBDex%' AND c.title<>t.title",
  );
  const alreadyEn = await q(
    "SELECT COUNT(*) n FROM obd_codes c JOIN obd_code_translations t ON t.codeId=c.id AND t.locale='en' WHERE c.source LIKE 'OBDex%' AND c.title=t.title",
  );
  console.log(`Títulos OBDex con español a revertir: ${before}`);
  console.log(`Títulos OBDex ya en inglés (sin cambio): ${alreadyEn}\n`);

  if (before === 0) {
    console.log('✅ Nada que hacer: todos los títulos OBDex ya están en inglés.');
    return;
  }

  // UPDATE en bloque: copia el título inglés (OBDCodeTranslation locale='en')
  // a la columna base, solo para códigos OBDex cuyo título base difiere.
  const affected = await prisma.$executeRawUnsafe(
    "UPDATE obd_codes c JOIN obd_code_translations t ON t.codeId=c.id AND t.locale='en' SET c.title=t.title WHERE c.source LIKE 'OBDex%' AND c.title<>t.title",
  );
  console.log(`✅ Títulos revertidos a inglés: ${affected}`);

  const after = await q(
    "SELECT COUNT(*) n FROM obd_codes c JOIN obd_code_translations t ON t.codeId=c.id AND t.locale='en' WHERE c.source LIKE 'OBDex%' AND c.title<>t.title",
  );
  console.log(`Quedan con título distinto al EN: ${after} (esperado 0)\n`);

  const samples = await prisma.oBDCode.findMany({
    where: { source: { startsWith: 'OBDex' }, code: { in: ['P0001', 'P0002', 'P0003', 'P0008', 'B0013'] } },
    select: { code: true, title: true },
    orderBy: { code: 'asc' },
  });
  console.log('Muestras post-fix:');
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
