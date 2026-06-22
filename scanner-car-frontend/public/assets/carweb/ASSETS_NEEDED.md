# Recursos gráficos requeridos — CARWEB Hero

Coloca los siguientes archivos en esta carpeta:

## hero-background.webp
- Fondo oscuro azul tecnológico
- Circuitos electrónicos, trazados PCB
- Glow azul, luces tecnológicas
- Resolución recomendada: 1440×900 px
- Referencia: panel trasero oscuro de la imagen pagina de carweb.png

## hero-particles.webp  (o .png con transparencia)
- Partículas flotantes, destellos, puntos de luz
- Fondo transparente o negro (se usa mix-blend-mode: screen)
- Anillos de escaneo circulares bajo el vehículo
- Resolución: 1440×900 px

## hero-car.webp
- Render 3D del vehículo holográfico con glow azul/cyan
- Fondo transparente o negro muy oscuro
- Vista 3/4 frontal izquierda, ligeramente desde arriba
- Motor con glow naranja/rojo (partes calientes)
- Resolución recomendada: 1200×750 px
- Referencia exacta: imagen pagina de carweb.png

## Tarjetas de categoría (sección "Explora por Categoría")
4 imágenes verticales (~600×800 px) que rellenan cada tarjeta:

- cat-motor.webp      → bloque de motor con glow ROJO (categoría P)
- cat-carroceria.webp → carro/interior en AZUL (categoría B)
- cat-chasis.webp     → disco de freno / suspensión en VERDE (categoría C)
- cat-red.webp        → carro con nodos de red en MORADO (categoría U)

Actualmente hay placeholders tintados. Reemplázalos con renders reales
para igualar la referencia pagina de carweb (1).png.

## Instrucciones
1. Genera o compra los renders profesionales
2. Exporta en .webp (o .png con canal alfa para hero-car y hero-particles)
3. Coloca los archivos en esta carpeta con el nombre exacto indicado
4. Los componentes detectan automáticamente los archivos
5. Recarga el servidor de desarrollo — todo se activa solo
