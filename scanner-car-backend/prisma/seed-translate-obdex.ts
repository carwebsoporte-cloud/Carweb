/* ============================================================
   Seed: Traduce contenido OBDex EN → ES + crea traducciones
   ------------------------------------------------------------
   1. Crea OBDCodeTranslation (locale='en') desde YAML
   2. Inserta síntomas/causas desde YAML
   3. Mantiene contenido ES existente donde ya existe
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

type OBDexEntry = {
  code: string;
  category: string;
  title: { en: string; de?: string };
  description: { en: string; de?: string };
  affected_components?: string[];
  common_causes?: { id: string; likelihood: string; label: { en: string; de?: string } }[];
  symptoms?: { en: string; de?: string }[];
  repair?: { difficulty?: string; diy_possible?: boolean; estimated_cost_eur?: [number, number]; estimated_hours?: [number, number] };
  flags?: { mil?: boolean; emissions_relevant?: boolean; limp_mode_possible?: boolean };
  related_codes?: string[];
};

async function main() {
  console.log('=== Traducción OBDex: Translations + Symptoms/Causes ===\n');

  // Cargar genericId
  const generic = await prisma.manufacturer.findFirst({ where: { isGeneric: true } });
  if (!generic) { console.error('Fabricante genérico no encontrado'); return; }
  const genericId = generic.id;

  let totalTranslations = 0;
  let totalSymptoms = 0;
  let totalCauses = 0;
  let totalSkipped = 0;

  for (const url of YAML_URLS) {
    console.log(`Procesando ${url.split('/').pop()}...`);
    const res = await fetch(url);
    if (!res.ok) { console.error(`  Error HTTP ${res.status}`); continue; }
    const text = await res.text();
    const entries = yaml.load(text) as OBDexEntry[];

    let fileTranslations = 0;
    let fileSymptoms = 0;
    let fileCauses = 0;

    for (const entry of entries) {
      // Buscar el código en la BD (solo genéricos)
      const dbCode = await prisma.oBDCode.findUnique({
        where: { code_manufacturerId: { code: entry.code, manufacturerId: genericId } },
      });
      if (!dbCode) { totalSkipped++; continue; }

      // 1. Crear OBDCodeTranslation locale='en'
      const enTitle = entry.title?.en || entry.code;
      const enDesc = entry.description?.en || '';
      const enSymptoms = entry.symptoms?.map((s: any) => s.en).join('\n') || '';
      const enCauses = entry.common_causes?.map((c: any) => c.label?.en).join('\n') || '';
      const enSolutions = deriveSolutionsText(entry);

      const existingTrans = await prisma.oBDCodeTranslation.findUnique({
        where: { codeId_locale: { codeId: dbCode.id, locale: 'en' } },
      });

      if (!existingTrans) {
        await prisma.oBDCodeTranslation.create({
          data: {
            codeId: dbCode.id,
            locale: 'en',
            title: enTitle,
            description: enDesc || null,
            symptoms: enSymptoms || null,
            causes: enCauses || null,
            solutions: enSolutions || null,
          },
        });
        fileTranslations++;
      }

      // 2. Insertar síntomas (si no existen)
      if (entry.symptoms && entry.symptoms.length > 0) {
        const existingSyms = await prisma.oBDSymptom.count({ where: { codeId: dbCode.id } });
        if (existingSyms === 0) {
          for (const s of entry.symptoms) {
            await prisma.oBDSymptom.create({
              data: { codeId: dbCode.id, symptom: s.en },
            });
            fileSymptoms++;
          }
        }
      }

      // 3. Insertar causas (si no existen)
      if (entry.common_causes && entry.common_causes.length > 0) {
        const existingCauses = await prisma.oBDCause.count({ where: { codeId: dbCode.id } });
        if (existingCauses === 0) {
          for (const c of entry.common_causes) {
            await prisma.oBDCause.create({
              data: { codeId: dbCode.id, cause: c.label?.en || c.id },
            });
            fileCauses++;
          }
        }
      }
    }

    console.log(`  → ${fileTranslations} traducciones, ${fileSymptoms} síntomas, ${fileCauses} causas`);
    totalTranslations += fileTranslations;
    totalSymptoms += fileSymptoms;
    totalCauses += fileCauses;
  }

  console.log(`\n=== Resumen ===`);
  console.log(`Traducciones EN creadas: ${totalTranslations}`);
  console.log(`Síntomas insertados: ${totalSymptoms}`);
  console.log(`Causas insertadas: ${totalCauses}`);
  console.log(`Códigos sin match en BD: ${totalSkipped}`);
}

function deriveSolutionsText(entry: OBDexEntry): string {
  const parts: string[] = [];
  const r = entry.repair;
  if (!r) return '';
  if (r.difficulty) parts.push(`Difficulty: ${r.difficulty}`);
  if (r.estimated_hours) parts.push(`Estimated time: ${r.estimated_hours[0]}-${r.estimated_hours[1]} hours`);
  if (r.estimated_cost_eur) parts.push(`Estimated cost: €${r.estimated_cost_eur[0]}-€${r.estimated_cost_eur[1]}`);
  if (r.diy_possible !== undefined) parts.push(r.diy_possible ? 'DIY possible' : 'Professional repair recommended');
  return parts.join('. ');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
