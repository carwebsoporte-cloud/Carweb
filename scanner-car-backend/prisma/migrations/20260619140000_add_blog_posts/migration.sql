-- Artículos del blog, gestionados desde el panel admin. Contenido bilingüe
-- (español base obligatorio, inglés opcional). El cuerpo se guarda como texto
-- con formato ligero (## subtítulos, - viñetas, línea en blanco = párrafo).
CREATE TABLE `blog_posts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `tag` VARCHAR(191) NOT NULL DEFAULT 'OBD2',
    `coverUrl` TEXT NOT NULL,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `titleEs` VARCHAR(191) NOT NULL,
    `excerptEs` TEXT NOT NULL,
    `bodyEs` TEXT NOT NULL,
    `titleEn` VARCHAR(191) NOT NULL DEFAULT '',
    `excerptEn` TEXT NULL,
    `bodyEn` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blog_posts_slug_key`(`slug`),
    INDEX `blog_posts_published_idx`(`published`),
    INDEX `blog_posts_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
