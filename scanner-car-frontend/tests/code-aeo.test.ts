import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildAnswerSummary, buildCodeFaq, type AeoCodeInput } from '../lib/code-aeo.ts';

const P0300_ES: AeoCodeInput = {
  label: 'P0300',
  title: 'Fallo de Encendido Aleatorio en Múltiples Cilindros',
  description: 'Se detectan fallos de encendido en varios cilindros sin patrón definido. Puede dañar el catalizador.',
  severity: 'Crítica/No conducir',
  causes: ['Bujías desgastadas', 'Cables de bujía defectuosos', 'Bobinas de encendido fallando', 'Inyectores sucios', 'Baja compresión'],
  symptoms: ['Motor tembloroso', 'Pérdida notable de potencia', 'Luz Check Engine parpadeando'],
  solutions: ['Revisar y reemplazar bujías.', 'Verificar cables de alta tensión', 'Probar bobinas de encendido.'],
};

const P0300_EN: AeoCodeInput = {
  label: 'P0300',
  title: 'Random/Multiple Cylinder Misfire Detected',
  description: 'Misfires are detected across several cylinders with no defined pattern. It can damage the catalytic converter.',
  severity: 'Crítica/No conducir',
  causes: ['Worn spark plugs', 'Faulty spark plug wires', 'Failing ignition coils', 'Dirty injectors', 'Low compression'],
  symptoms: ['Engine shaking', 'Noticeable power loss'],
  solutions: ['Inspect and replace the spark plugs', 'Test the ignition coils'],
};

const words = (text: string) => text.trim().split(/\s+/).length;

test('answer summary is answer-first, deterministic and 40-60 words (es)', () => {
  const summary = buildAnswerSummary(P0300_ES, 'es');
  assert.ok(summary);
  assert.equal(summary.heading, '¿Qué significa el código P0300?');
  assert.ok(summary.text.startsWith('P0300 significa «Fallo de Encendido Aleatorio en Múltiples Cilindros».'));
  assert.ok(summary.text.includes('Puede dañar el catalizador.'));
  assert.ok(summary.text.includes('Gravedad crítica'));
  assert.ok(summary.text.includes('bujías desgastadas, cables de bujía defectuosos y bobinas de encendido fallando'));
  assert.ok(words(summary.text) >= 40 && words(summary.text) <= 60, String(words(summary.text)));
  assert.deepEqual(buildAnswerSummary(P0300_ES, 'es'), summary);
});

test('answer summary in English uses English heading and copy', () => {
  const summary = buildAnswerSummary(P0300_EN, 'en');
  assert.ok(summary);
  assert.equal(summary.heading, 'What does P0300 mean?');
  assert.ok(summary.text.startsWith('P0300 means “Random/Multiple Cylinder Misfire Detected”.'));
  assert.ok(summary.text.includes('Critical severity'));
  assert.ok(summary.text.includes('worn spark plugs, faulty spark plug wires and failing ignition coils'));
  assert.ok(words(summary.text) >= 35 && words(summary.text) <= 60, String(words(summary.text)));
});

test('answer summary never exceeds 60 words and keeps the meaning sentence', () => {
  const long = { ...P0300_ES, description: 'Palabra uno. ' + 'relleno '.repeat(80).trim() + '.' };
  const summary = buildAnswerSummary(long, 'es');
  assert.ok(summary);
  assert.ok(words(summary.text) <= 60, String(words(summary.text)));
  assert.ok(summary.text.startsWith('P0300 significa'));
});

test('answer summary omits missing parts and does not invent text', () => {
  const summary = buildAnswerSummary({ label: 'P0001', title: 'Control del regulador', causes: [], symptoms: [], solutions: [] }, 'es');
  assert.ok(summary);
  assert.equal(summary.text, 'P0001 significa «Control del regulador».');
  assert.equal(buildAnswerSummary({ label: 'P0001', title: '  ', causes: [], symptoms: [], solutions: [] }, 'es'), null);
});

test('acronym-leading causes keep their capitalization', () => {
  const summary = buildAnswerSummary({ ...P0300_ES, causes: ['ECU defectuosa', 'Bujías desgastadas'] }, 'es');
  assert.ok(summary?.text.includes('ECU defectuosa y bujías desgastadas'));
});

test('FAQ is built from existing fields only (es)', () => {
  const faq = buildCodeFaq(P0300_ES, 'es');
  assert.deepEqual(faq.map((f) => f.q), [
    '¿Qué significa el código P0300?',
    '¿Cuáles son las causas más comunes del código P0300?',
    '¿Qué síntomas produce el código P0300?',
    '¿Puedo seguir conduciendo con el código P0300?',
    '¿Cómo se soluciona el código P0300?',
  ]);
  assert.ok(faq[0].a.startsWith('P0300 significa «Fallo de Encendido Aleatorio en Múltiples Cilindros». Se detectan'));
  assert.ok(faq[1].a.includes('bujías desgastadas, cables de bujía defectuosos, bobinas de encendido fallando, inyectores sucios y baja compresión'));
  assert.ok(faq[2].a.includes('motor tembloroso, pérdida notable de potencia y luz Check Engine parpadeando'));
  assert.ok(faq[3].a.startsWith('No.'));
  assert.equal(faq[4].a, 'Pasos recomendados: 1. Revisar y reemplazar bujías. 2. Verificar cables de alta tensión. 3. Probar bobinas de encendido.');
});

test('FAQ in English and moderate/low severity answers', () => {
  const faq = buildCodeFaq({ ...P0300_EN, severity: 'Moderada' }, 'en');
  assert.equal(faq[0].q, 'What does the P0300 code mean?');
  assert.equal(faq[3].q, 'Can I keep driving with the P0300 code?');
  assert.ok(faq[3].a.startsWith('With caution.'));
  assert.equal(faq[4].a, 'Recommended steps: 1. Inspect and replace the spark plugs. 2. Test the ignition coils.');
  const low = buildCodeFaq({ ...P0300_EN, severity: 'Baja' }, 'en');
  assert.ok(low[3].a.startsWith('Yes.'));
});

test('FAQ omits questions whose data is missing', () => {
  const faq = buildCodeFaq({ label: 'P0001', title: 'Regulador', causes: [], symptoms: [], solutions: [], severity: 'Desconocida' }, 'en');
  assert.deepEqual(faq.map((f) => f.q), ['What does the P0001 code mean?']);
  assert.equal(faq[0].a, 'P0001 means “Regulador”.');
  assert.deepEqual(buildCodeFaq({ label: 'P0001', title: '', causes: [], symptoms: [], solutions: [] }, 'es'), []);
});
