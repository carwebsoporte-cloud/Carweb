/* ============================================================
   Parser del CSV de códigos OBD2 (OBD2_CODES_500.csv)
   ------------------------------------------------------------
   El CSV NO está entrecomillado y sus campos del medio
   (descripción, síntomas, causas, soluciones) contienen comas
   sin delimitador entre ellos. Solo `code` (primer campo) y
   `severity` (último campo) son extraíbles de forma directa.

   La estructura del contenido SIEMPRE sigue el orden:
       descripción → síntomas → causas → soluciones
   Aprovechamos eso con heurísticas:
     · descripción = campos hasta el primero que termina en "."
     · soluciones  = desde el primer ítem que empieza con verbo
                     de acción (Limpiar, Verificar, Reemplazar…)
     · entre ambos = síntomas + causas; la frontera es el primer
                     ítem con lenguaje de "falla de componente"
                     (defectuoso, dañado, suelto, fuga, quemado…).
   ============================================================ */

import * as fs from 'fs';

export interface CodeSeed {
  code: string;
  title: string;
  description: string;
  symptoms: string;
  causes: string;
  solutions: string;
  severity: string;
}

const SEVERITIES = ['Baja', 'Moderada', 'Crítica/No conducir'];

/* Quita acentos y pasa a minúsculas para comparar de forma robusta */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/* Verbos en infinitivo (o "NO ...") con los que arranca una solución */
const SOLUTION_VERBS = [
  'limpiar', 'verificar', 'revisar', 'reemplazar', 'cambiar', 'inspeccionar',
  'reparar', 'comprobar', 'medir', 'realizar', 'ajustar', 'calibrar', 'recalibrar',
  'sustituir', 'apretar', 'diagnosticar', 'escanear', 'llevar', 'usar', 'probar',
  'buscar', 'actualizar', 'detener', 'cargar', 'conectar', 'desconectar',
  'precalentar', 'reducir', 'reprogramar', 'evaluar', 'consultar', 'estacionar',
  'intentar', 'retirar', 'rellenar', 'drenar', 'purgar', 'lubricar', 'soldar',
  'no ', 'no.', 'reiniciar', 'restablecer', 'aplicar', 'instalar', 'colocar',
];

/* Lenguaje que marca una CAUSA (falla de un componente) */
const FAULT_MARKERS = [
  'defectuos', 'danad', 'dana ', 'dano', 'danos', 'suelt', 'roto', 'rota',
  'obstruid', 'suci', 'quemad', 'corro', 'agrietad', 'descalibrad', 'contaminad',
  'desgastad', 'atascad', 'pegad', 'fundid', 'cortocircuito', 'corto circuito',
  'abiert', 'cortad', 'descargad', 'floj', 'fuga', 'bloque', 'deterior', 'oxidad',
  'debil', 'sobrecalent', 'tapad', 'restriccion', 'roto', 'rotura', 'vencid',
  'mal estado', 'mal contacto', 'baja resistencia', 'alta resistencia',
  'sin senal', 'circuito', 'conexion', 'conector', 'cableado', 'fusible',
  'rele', 'reluctancia', 'modulo defectuoso',
];

function startsWithSolutionVerb(item: string): boolean {
  const n = norm(item);
  return SOLUTION_VERBS.some((v) => n.startsWith(v));
}

function looksLikeCause(item: string): boolean {
  const n = norm(item);
  return FAULT_MARKERS.some((m) => n.includes(m));
}

/* Divide el CSV respetando que el código y la severidad son fiables */
export function parseRow(line: string): CodeSeed | null {
  const fields = line.split(',').map((f) => f.trim()).filter((f) => f.length > 0);
  if (fields.length < 4) return null;

  const code = fields[0].toUpperCase();
  if (!/^[PBCU][0-9A-F]{4}$/i.test(code)) return null;

  // severity = último campo si es válido; si no, default Moderada
  let severity = fields[fields.length - 1];
  let endIdx = fields.length - 1; // exclusivo para el contenido del medio
  if (!SEVERITIES.includes(severity)) {
    severity = 'Moderada';
    endIdx = fields.length;
  }

  const title = fields[1] ?? code;
  const middle = fields.slice(2, endIdx); // descripción + síntomas + causas + soluciones

  if (middle.length === 0) {
    return { code, title, description: title, symptoms: '', causes: '', solutions: '', severity };
  }

  // 1) Descripción: campos hasta el primero que termina en "."
  let descEnd = 0;
  for (let i = 0; i < middle.length; i++) {
    if (middle[i].endsWith('.')) { descEnd = i + 1; break; }
  }
  if (descEnd === 0) descEnd = 1; // fallback: primer campo
  const description = middle.slice(0, descEnd).join(', ').replace(/\.$/, '') + '.';

  const rest = middle.slice(descEnd); // síntomas + causas + soluciones

  // 2) Soluciones: desde el primer ítem que empieza con verbo de acción
  let solStart = rest.length;
  for (let i = 0; i < rest.length; i++) {
    if (startsWithSolutionVerb(rest[i])) { solStart = i; break; }
  }
  const solutions = rest.slice(solStart);

  // 3) Entre descripción y soluciones: síntomas → causas
  const symCau = rest.slice(0, solStart);
  let cauStart = symCau.length;
  for (let i = 0; i < symCau.length; i++) {
    if (looksLikeCause(symCau[i])) { cauStart = i; break; }
  }
  const symptoms = symCau.slice(0, cauStart);
  const causes = symCau.slice(cauStart);

  // Capitaliza la primera letra de cada ítem
  const cap = (arr: string[]) =>
    arr.map((s) => (s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s)).join(', ');

  return {
    code,
    title,
    description,
    symptoms: cap(symptoms),
    causes: cap(causes),
    solutions: cap(solutions),
    severity,
  };
}

/* Carga el CSV y devuelve solo los códigos que NO existen ya (existing) */
export function loadCsvCodes(csvPath: string, existing: Set<string>): CodeSeed[] {
  if (!fs.existsSync(csvPath)) {
    console.log(`  CSV no encontrado en ${csvPath} — se omite la importación.`);
    return [];
  }

  const raw = fs.readFileSync(csvPath, 'utf-8');
  const lines = raw.split(/\r?\n/).slice(1); // omite encabezado
  const out: CodeSeed[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    if (!line.trim()) continue;
    const parsed = parseRow(line);
    if (!parsed) continue;
    if (existing.has(parsed.code) || seen.has(parsed.code)) continue;
    seen.add(parsed.code);
    out.push(parsed);
  }

  return out;
}
