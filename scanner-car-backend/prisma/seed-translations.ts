/* Carga idempotente de las traducciones (locale en) sin reseed completo.
   Ejecutar: npx prisma db seed no aplica; usar `npm run seed:translations`. */

import { PrismaClient } from '@prisma/client';
import { loadEnglishTranslations } from './translations-en';

const prisma = new PrismaClient();

(async () => {
  const r = await loadEnglishTranslations(prisma);
  console.log(`Traducciones EN cargadas: ${r.loaded}`);
  if (r.missing.length) console.log(`  Códigos no encontrados (omitidos): ${r.missing.join(', ')}`);
  await prisma.$disconnect();
})().catch((e) => {
  console.error('Error cargando traducciones:', e);
  process.exit(1);
});
