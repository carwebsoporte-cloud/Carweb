-- Banners publicitarios por posición (Amazon Associates, etc.).
-- Imagen + enlace; cada posición (LEFT/RIGHT/BOTTOM) es independiente.
-- No se muestran en la página de inicio (regla aplicada en el frontend).
CREATE TABLE `ad_banners` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL DEFAULT '',
    `slot` ENUM('LEFT', 'RIGHT', 'BOTTOM') NOT NULL,
    `imageUrl` TEXT NOT NULL,
    `link` TEXT NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ad_banners_slot_idx`(`slot`),
    INDEX `ad_banners_active_idx`(`active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
