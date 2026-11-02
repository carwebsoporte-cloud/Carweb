import assert from 'node:assert/strict';
import { test } from 'node:test';
import { serializeJsonLd } from '../lib/json-ld.ts';

test('serializeJsonLd escapes < so </script> cannot break out', () => {
  const out = serializeJsonLd({ text: 'bad </script><script>alert(1)</script>' });
  assert.ok(!out.includes('<'));
  assert.ok(out.includes('\\u003c/script>'));
});

test('serializeJsonLd round-trips through JSON.parse and escapes line separators', () => {
  const value = [{ a: 'x < y', b: 'line\u2028sep\u2029', n: 1 }];
  const out = serializeJsonLd(value);
  assert.ok(!out.includes('\u2028') && !out.includes('\u2029'));
  assert.deepEqual(JSON.parse(out), value);
});
