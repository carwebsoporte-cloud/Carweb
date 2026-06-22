/* Validación standalone del parser CSV — NO toca la base de datos.
   Ejecutar: npx ts-node prisma/validate-csv.ts */

import * as path from 'path';
import * as fs from 'fs';
import { parseRow, loadCsvCodes, CodeSeed } from './csv-codes';

const CSV_PATH = path.resolve(__dirname, '..', '..', 'OBD2_CODES_500.csv');

function count(list: string): number {
  return list ? list.split(',').map((s) => s.trim()).filter((s) => s.length > 1).length : 0;
}

const raw = fs.readFileSync(CSV_PATH, 'utf-8');
const lines = raw.split(/\r?\n/).slice(1).filter((l) => l.trim());

let parsed = 0, noSym = 0, noCau = 0, noSol = 0;
const samples: CodeSeed[] = [];

for (const line of lines) {
  const r = parseRow(line);
  if (!r) continue;
  parsed++;
  if (count(r.symptoms) === 0) noSym++;
  if (count(r.causes) === 0) noCau++;
  if (count(r.solutions) === 0) noSol++;
  if (['B0015', 'B0057', 'C0045', 'P0128', 'U0140', 'P0506'].includes(r.code)) samples.push(r);
}

console.log('================ VALIDACIÓN PARSER CSV ================');
console.log(`Líneas de datos:        ${lines.length}`);
console.log(`Parseadas OK:           ${parsed}`);
console.log(`Sin síntomas:           ${noSym}  (${((noSym / parsed) * 100).toFixed(1)}%)`);
console.log(`Sin causas:             ${noCau}  (${((noCau / parsed) * 100).toFixed(1)}%)`);
console.log(`Sin soluciones:         ${noSol}  (${((noSol / parsed) * 100).toFixed(1)}%)`);

// Promedios
let tS = 0, tC = 0, tSol = 0;
for (const line of lines) {
  const r = parseRow(line);
  if (!r) continue;
  tS += count(r.symptoms); tC += count(r.causes); tSol += count(r.solutions);
}
console.log(`Promedio síntomas/código:   ${(tS / parsed).toFixed(1)}`);
console.log(`Promedio causas/código:     ${(tC / parsed).toFixed(1)}`);
console.log(`Promedio soluciones/código: ${(tSol / parsed).toFixed(1)}`);

console.log('\n================ MUESTRAS ================');
for (const s of samples) {
  console.log(`\n[${s.code}] ${s.title}  (${s.severity})`);
  console.log(`  DESC: ${s.description}`);
  console.log(`  SÍNT: ${s.symptoms}`);
  console.log(`  CAUS: ${s.causes}`);
  console.log(`  SOLU: ${s.solutions}`);
}

// Simulación de merge con un set vacío
const merged = loadCsvCodes(CSV_PATH, new Set());
console.log(`\nloadCsvCodes(vacío) devolvió: ${merged.length} códigos únicos`);
