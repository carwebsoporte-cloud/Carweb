/**
 * Genera 3 archivos .webp de placeholder para el hero de CARWEB.
 * Ejecutar: node scripts/create-placeholders.js
 *
 * Cuando tengas los renders profesionales, reemplaza los archivos en:
 *   public/assets/carweb/
 */

const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

const OUT = path.join(__dirname, '..', 'public', 'assets', 'carweb');
fs.mkdirSync(OUT, { recursive: true });

async function run() {
  console.log('Generando placeholders en:', OUT, '\n');

  /* ── hero-background.webp ──────────────────────────────
     Fondo oscuro azul tecnológico (1440×900).
     Reemplazar con: fondo de circuitos + glow azul real.  */
  await sharp({
    create: { width: 1440, height: 900, channels: 3,
      background: { r: 2, g: 13, b: 31 } },   // #020D1F
  })
    .webp({ quality: 85 })
    .toFile(path.join(OUT, 'hero-background.webp'));
  console.log('✓  hero-background.webp  (1440×900 — placeholder oscuro)');

  /* ── hero-particles.webp ───────────────────────────────
     Negro casi puro (mix-blend-mode: screen → invisible).
     Reemplazar con: partículas + anillos de escaneo.       */
  await sharp({
    create: { width: 1440, height: 900, channels: 3,
      background: { r: 0, g: 3, b: 12 } },
  })
    .webp({ quality: 85 })
    .toFile(path.join(OUT, 'hero-particles.webp'));
  console.log('✓  hero-particles.webp   (1440×900 — placeholder negro)');

  /* ── hero-car.webp ─────────────────────────────────────
     Transparente 1200×750 (canal alfa).
     Reemplazar con: render 3D del vehículo holográfico.    */
  await sharp({
    create: { width: 1200, height: 750, channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .webp({ quality: 85 })
    .toFile(path.join(OUT, 'hero-car.webp'));
  console.log('✓  hero-car.webp         (1200×750 — placeholder transparente)');

  console.log('\nPlaceholders listos. El componente hero carga sin errores.');
  console.log('Reemplaza los 3 archivos con renders profesionales cuando los tengas.\n');
}

run().catch((err) => {
  console.error('Error generando placeholders:', err.message);
  console.error('Solución: asegúrate de ejecutar el script desde la carpeta scanner-car-frontend');
  process.exit(1);
});
