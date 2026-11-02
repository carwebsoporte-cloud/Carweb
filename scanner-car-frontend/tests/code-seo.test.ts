import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildCodeDescription, buildCodeTitle, TITLE_BRAND_SUFFIX } from '../lib/code-seo.ts';

const MAX_TITLE = 60;
const MAX_DESC = 155;

test('title falls back to the intent-only pattern when the code title is long', () => {
  const es = buildCodeTitle({ locale: 'es', label: 'P0300', title: 'Fallo de Encendido Aleatorio en Múltiples Cilindros' });
  assert.equal(es.title, 'P0300: Causas, Síntomas y Solución');
  assert.equal(es.ogTitle, 'P0300: Causas, Síntomas y Solución | CARWEB');
  const en = buildCodeTitle({ locale: 'en', label: 'P0300', title: 'Random/Multiple Cylinder Misfire Detected' });
  assert.equal(en.title, 'P0300: Causes, Symptoms & How to Fix');
  assert.equal(en.ogTitle, 'P0300: Causes, Symptoms & How to Fix | CARWEB');
});

test('title works the code title in when it fits in 60 chars with the brand', () => {
  const es = buildCodeTitle({ locale: 'es', label: 'P0171', title: 'Mezcla Pobre' });
  assert.equal(es.title, 'P0171: Mezcla Pobre — Causas, Síntomas y Solución');
  assert.ok(es.ogTitle.length <= MAX_TITLE, es.ogTitle);
  const mid = buildCodeTitle({ locale: 'es', label: 'P0420', title: 'Catalizador Ineficiente' });
  assert.equal(mid.title, 'P0420: Catalizador Ineficiente — Causas y Solución');
  assert.ok(mid.ogTitle.length <= MAX_TITLE, mid.ogTitle);
  const en = buildCodeTitle({ locale: 'en', label: 'P0171', title: 'System Too Lean' });
  assert.equal(en.title, 'P0171: System Too Lean — Causes, Symptoms & Fix');
});

test('title keeps the brand label for OEM variants and never exceeds the budget', () => {
  const r = buildCodeTitle({ locale: 'es', label: 'P0300 (Audi)', title: 'Fallo de Encendido' });
  assert.ok(r.title.startsWith('P0300 (Audi): '));
  for (const title of ['A', 'x'.repeat(200)]) {
    const t = buildCodeTitle({ locale: 'en', label: 'P0300 (Mercedes-Benz)', title });
    assert.ok(t.ogTitle.length <= MAX_TITLE, t.ogTitle);
    assert.ok(t.ogTitle.endsWith(TITLE_BRAND_SUFFIX));
  }
});

test('description leads with the existing description and adds intent words', () => {
  const d = buildCodeDescription({
    locale: 'es',
    label: 'P0300',
    title: 'Fallo de Encendido Aleatorio en Múltiples Cilindros',
    description: 'Se detectan fallos de encendido en varios cilindros sin patrón definido. Puede dañar el catalizador.',
  });
  assert.equal(
    d,
    'Se detectan fallos de encendido en varios cilindros sin patrón definido. Puede dañar el catalizador. P0300: causas, síntomas y solución paso a paso.',
  );
  assert.ok(d.length <= MAX_DESC);
  const en = buildCodeDescription({
    locale: 'en',
    label: 'P0300',
    title: 'Random/Multiple Cylinder Misfire Detected',
    description: 'Misfires are detected across several cylinders with no defined pattern. It can damage the catalytic converter.',
  });
  assert.ok(en.startsWith('Misfires are detected'));
  assert.ok(en.endsWith('P0300: causes, symptoms and how to fix.'));
  assert.ok(en.length <= MAX_DESC, String(en.length));
});

test('description without stored text starts from the code title', () => {
  const d = buildCodeDescription({ locale: 'en', label: 'P0420', title: 'Catalyst Efficiency Below Threshold', description: undefined });
  assert.ok(d.startsWith('OBD2 code P0420: Catalyst Efficiency Below Threshold.'));
  assert.ok(d.length <= MAX_DESC);
});

test('long descriptions are cut at a word boundary within 155 chars', () => {
  const long = 'palabra '.repeat(60).trim() + '.';
  const d = buildCodeDescription({ locale: 'es', label: 'P0300', title: 'Titulo', description: long });
  assert.ok(d.length <= MAX_DESC, String(d.length));
  assert.match(d, /…\s/);
  assert.ok(d.endsWith('solución.'));
  assert.doesNotMatch(d, /palab…/);
});
