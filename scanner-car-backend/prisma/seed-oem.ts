/* Carga idempotente de los códigos OEM por fabricante (sin reseed completo).
   Ejecutar: npm run seed:oem */

import { PrismaClient } from '@prisma/client';
import { loadOemCodes } from './oem-codes';

const prisma = new PrismaClient();

(async () => {
  const r = await loadOemCodes(prisma);
  console.log(`Códigos OEM cargados: ${r.loaded}`);
  if (r.skipped.length) console.log(`  Omitidos (fabricante/categoría no encontrados): ${r.skipped.join(', ')}`);
  await prisma.$disconnect();
})().catch((e) => {
  console.error('Error cargando códigos OEM:', e);
  process.exit(1);
});
