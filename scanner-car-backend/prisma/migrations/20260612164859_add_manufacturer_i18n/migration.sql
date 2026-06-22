-- DropIndex
DROP INDEX `obd_codes_code_key` ON `obd_codes`;

-- AlterTable
ALTER TABLE `obd_codes` ADD COLUMN `manufacturerId` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `source` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'PUBLISHED';

-- CreateTable
CREATE TABLE `manufacturers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `isGeneric` BOOLEAN NOT NULL DEFAULT false,
    `country` VARCHAR(191) NULL,
    `logoUrl` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `manufacturers_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `obd_code_translations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codeId` INTEGER NOT NULL,
    `locale` VARCHAR(5) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `obd_code_translations_codeId_idx`(`codeId`),
    UNIQUE INDEX `obd_code_translations_codeId_locale_key`(`codeId`, `locale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `obd_codes_manufacturerId_idx` ON `obd_codes`(`manufacturerId`);

-- CreateIndex
CREATE UNIQUE INDEX `obd_codes_code_manufacturerId_key` ON `obd_codes`(`code`, `manufacturerId`);

-- AddForeignKey
ALTER TABLE `obd_codes` ADD CONSTRAINT `obd_codes_manufacturerId_fkey` FOREIGN KEY (`manufacturerId`) REFERENCES `manufacturers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obd_code_translations` ADD CONSTRAINT `obd_code_translations_codeId_fkey` FOREIGN KEY (`codeId`) REFERENCES `obd_codes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
