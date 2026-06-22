import { Body, Controller, Post, UnauthorizedException, InternalServerErrorException, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { timingSafeEqual } from 'crypto';
import { signToken } from './token.util';
import { LoginDto } from './dto/login.dto';

/** Comparación en tiempo constante (evita timing attacks en el login). */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

@Controller('api/admin')
export class AdminAuthController {
  /** POST /api/admin/login → { token }. Limitado a 5 intentos/min por IP (anti fuerza bruta). */
  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  login(@Body() body: LoginDto) {
    // Se leen en cada request porque .env se carga en bootstrap (sin autoload).
    const ADMIN_USER = process.env.ADMIN_USERNAME;
    const ADMIN_PASS = process.env.ADMIN_PASSWORD;
    if (!ADMIN_USER || !ADMIN_PASS) {
      throw new InternalServerErrorException(
        'Credenciales de administrador no configuradas en el servidor.',
      );
    }

    // Se evalúan ambas comparaciones siempre (sin cortocircuito) para no filtrar
    // por tiempo si el usuario es correcto pero la contraseña no.
    const okUser = safeEqual(body.username, ADMIN_USER);
    const okPass = safeEqual(body.password, ADMIN_PASS);
    if (okUser && okPass) {
      return { token: signToken({ sub: 'admin' }), user: body.username };
    }
    throw new UnauthorizedException('Usuario o contraseña incorrectos');
  }
}
