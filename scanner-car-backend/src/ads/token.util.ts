import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Resuelve el secreto HMAC de forma perezosa (en cada uso), porque .env se carga
 * en bootstrap() DESPUÉS de evaluar los imports del módulo. Falla cerrado: sin un
 * secreto fuerte el panel admin no opera (no hay fallback inseguro en código).
 */
function getSecret(): string {
  const s = process.env.ADMIN_JWT_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      'ADMIN_JWT_SECRET no configurado o demasiado corto (mínimo 32 caracteres). ' +
        'Define un secreto aleatorio fuerte en las variables de entorno.',
    );
  }
  return s;
}

/** Firma un token simple (payload.firma) con HMAC-SHA256. TTL en segundos. */
export function signToken(payload: Record<string, unknown>, ttlSeconds = 60 * 60 * 8): string {
  const exp = Date.now() + ttlSeconds * 1000;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const sig = createHmac('sha256', getSecret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

/** Verifica firma y expiración. Devuelve true si el token es válido. */
export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [body, sig] = token.split('.');
  if (!body || !sig) return false;

  const expected = createHmac('sha256', getSecret()).update(body).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (typeof data.exp === 'number' && Date.now() > data.exp) return false;
    return true;
  } catch {
    return false;
  }
}
