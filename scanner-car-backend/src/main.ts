import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module';

/** Carga el archivo .env a process.env (NestJS no lo hace por defecto). */
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
  } catch {
    /* sin .env, se usan los valores por defecto */
  }
}

/** Falla pronto y con un mensaje claro si faltan variables de entorno clave. */
function assertRequiredEnv() {
  const missing = ['DATABASE_URL'].filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Faltan variables de entorno obligatorias: ${missing.join(', ')}`);
  }
}

async function bootstrap() {
  loadDotenv();
  assertRequiredEnv();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Detrás de un proxy (Railway, etc.): confía en X-Forwarded-* para la IP real.
  app.set('trust proxy', 1);

  // Cierra Prisma y libera recursos al recibir SIGTERM/SIGINT (despliegues).
  app.enableShutdownHooks();

  // Cabeceras de seguridad. CORP en cross-origin para que el frontend pueda
  // embeber las imágenes de /uploads; CSP desactivada (el API sirve JSON e
  // imágenes, no HTML; la CSP del sitio la aplica el frontend).
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    }),
  );

  // Servir imágenes subidas en /uploads
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });
  app.useStaticAssets(uploadsDir, { prefix: '/uploads' });

  // Habilitar CORS para el frontend
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Pipes de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Swagger solo fuera de producción (evita exponer la superficie del API en prod).
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('CARWEB API')
      .setDescription('API de códigos de falla OBD2 automotriz')
      .setVersion('1.0')
      .addTag('OBD Codes')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 CARWEB API running on http://localhost:${port}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
  }
}

bootstrap();
