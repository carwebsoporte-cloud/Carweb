-- Restaura la tabla `advertisements`: existía vía `db push` pero nunca se
-- capturó en una migración, por lo que `migrate reset` la eliminó. Esta
-- migración la deja registrada en el historial de forma permanente.
CREATE TABLE `advertisements` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `businessName` VARCHAR(191) NOT NULL,
    `imageUrl` TEXT NOT NULL,
    `whatsapp` VARCHAR(30) NULL,
    `phone` VARCHAR(30) NULL,
    `link` TEXT NULL,
    `plan` ENUM('PREMIUM', 'PRO', 'BASICO') NOT NULL DEFAULT 'BASICO',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `advertisements_active_idx`(`active`),
    INDEX `advertisements_plan_idx`(`plan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Traducción completa: añade las listas (síntomas/causas/soluciones) a las
-- traducciones, que antes solo cubrían título/descripción.
ALTER TABLE `obd_code_translations` ADD COLUMN `causes` TEXT NULL,
    ADD COLUMN `solutions` TEXT NULL,
    ADD COLUMN `symptoms` TEXT NULL;
