/* ============================================================
   Seed script para códigos genéricos SAE J2012 desde OBDex
   Dataset: foerbsnavi/OBDex (CC0-1.0)
   Fuente: https://github.com/foerbsnavi/OBDex
   ------------------------------------------------------------
   Uso: npx ts-node prisma/seed-obdex.ts
   Requiere: npm install js-yaml
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

const CATEGORY_MAP: Record<string, string> = {
  powertrain: 'P',
  body: 'B',
  chassis: 'C',
  network: 'U',
};

const FAMILY_MAP: Record<string, string> = {
  P0: 'P', P2: 'P', P3: 'P',
  B0: 'B',
  C0: 'C',
  U0: 'U', U3: 'U',
};

type OBDexFlags = {
  mil?: boolean;
  emissions_relevant?: boolean;
  drive_cycle_required?: boolean;
  limp_mode_possible?: boolean;
};

type OBDexRepair = {
  difficulty?: string;
  diy_possible?: boolean;
  estimated_cost_eur?: [number, number];
  estimated_hours?: [number, number];
};

type OBDexCause = {
  id: string;
  likelihood: string;
  label: { en: string; de?: string };
};

type OBDexEntry = {
  code: string;
  category: string;
  title: { en: string; de?: string };
  description: { en: string; de?: string };
  affected_components?: string[];
  common_causes?: OBDexCause[];
  symptoms?: { en: string; de?: string }[];
  repair?: OBDexRepair;
  flags?: OBDexFlags;
  related_codes?: string[];
};

function deriveSeverity(flags?: OBDexFlags): string {
  if (!flags) return 'Moderada';
  if (flags.limp_mode_possible) return 'Crítica/No conducir';
  if (flags.mil && flags.emissions_relevant) return 'Moderada';
  if (flags.mil) return 'Moderada';
  return 'Baja';
}

function deriveSourceText(repair?: OBDexRepair): string {
  if (!repair) return '';
  const parts: string[] = [];
  const hours = repair.estimated_hours;
  const cost = repair.estimated_cost_eur;
  if (hours) parts.push(`Tiempo estimado: ${hours[0]}-${hours[1]} horas`);
  if (cost) parts.push(`Costo estimado: €${cost[0]}-€${cost[1]}`);
  if (repair.difficulty) parts.push(`Dificultad: ${repair.difficulty}`);
  if (repair.diy_possible !== undefined) parts.push(repair.diy_possible ? 'Posible hacerlo uno mismo' : 'Requiere taller especializado');
  return parts.join(' · ');
}

async function ensureCategories(): Promise<Record<string, number>> {
  const cats = await prisma.oBDCategory.findMany();
  const map: Record<string, number> = {};
  for (const c of cats) map[c.code] = c.id;
  return map;
}

async function ensureGenericManufacturer(): Promise<number> {
  let gen = await prisma.manufacturer.findFirst({ where: { isGeneric: true } });
  if (!gen) {
    gen = await prisma.manufacturer.create({
      data: { slug: 'generico-sae', name: 'Genérico (SAE)', isGeneric: true },
    });
  }
  return gen.id;
}

async function fetchAndParseYaml(url: string): Promise<OBDexEntry[]> {
  console.log(`  Descargando ${url.split('/').pop()}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error fetching ${url}: ${res.status}`);
  const text = await res.text();
  const data = yaml.load(text) as OBDexEntry[];
  console.log(`    → ${data.length} códigos`);
  return data;
}

async function main() {
  console.log('=== Seed OBDex — Códigos Genéricos SAE J2012 ===\n');

  const categories = await ensureCategories();
  const genericId = await ensureGenericManufacturer();
  console.log(`  Categorías: ${Object.keys(categories).join(', ')}`);
  console.log(`  Fabricante genérico ID: ${genericId}\n`);

  let totalSeeded = 0;
  let totalSkipped = 0;

  for (const url of YAML_URLS) {
    try {
      const entries = await fetchAndParseYaml(url);
      const batch: {
        code: string;
        title: string;
        description: string;
        severity: string;
        source: string;
        categoryId: number;
        manufacturerId: number;
      }[] = [];

      for (const entry of entries) {
        const catCode = CATEGORY_MAP[entry.category];
        if (!catCode || !categories[catCode]) {
          console.warn(`    ⚠ Categoría desconocida: ${entry.category} para ${entry.code}`);
          totalSkipped++;
          continue;
        }

        const severity = deriveSeverity(entry.flags);
        const sourceExtra = deriveSourceText(entry.repair);
        const source = sourceExtra ? `OBDex (CC0) · ${sourceExtra}` : 'OBDex (CC0)';

        batch.push({
          code: entry.code,
          title: entry.title.en || entry.title.de || entry.code,
          description: entry.description.en || entry.description.de || '',
          severity,
          source,
          categoryId: categories[catCode],
          manufacturerId: genericId,
        });
      }

      if (batch.length > 0) {
        await prisma.oBDCode.createMany({ data: batch, skipDuplicates: true });
        console.log(`    ✅ Insertados ${batch.length} códigos`);
        totalSeeded += batch.length;
      }
    } catch (err) {
      console.error(`  ❌ Error en ${url}:`, err);
    }
  }

  console.log(`\n=== Resumen: ${totalSeeded} códigos insertados, ${totalSkipped} omitidos ===`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
