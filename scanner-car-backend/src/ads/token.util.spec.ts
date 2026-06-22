import { signToken, verifyToken } from './token.util';

/* Invariantes del núcleo de autenticación admin (HMAC firmado).
   El secreto se resuelve de forma perezosa, así que basta con fijarlo aquí. */
describe('token.util (auth admin HMAC)', () => {
  const PREV = process.env.ADMIN_JWT_SECRET;

  beforeAll(() => {
    process.env.ADMIN_JWT_SECRET = 'test-secret-de-al-menos-32-caracteres-largo!!';
  });
  afterAll(() => {
    process.env.ADMIN_JWT_SECRET = PREV;
  });

  it('firma y verifica un token válido', () => {
    const token = signToken({ sub: 'admin' });
    expect(verifyToken(token)).toBe(true);
  });

  it('rechaza un token con la firma manipulada', () => {
    const token = signToken({ sub: 'admin' });
    const tampered = token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a');
    expect(verifyToken(tampered)).toBe(false);
  });

  it('rechaza tokens vacíos o mal formados', () => {
    expect(verifyToken(undefined)).toBe(false);
    expect(verifyToken('')).toBe(false);
    expect(verifyToken('sin-punto-separador')).toBe(false);
  });

  it('rechaza un token expirado', () => {
    const expired = signToken({ sub: 'admin' }, -1); // exp en el pasado
    expect(verifyToken(expired)).toBe(false);
  });
});
