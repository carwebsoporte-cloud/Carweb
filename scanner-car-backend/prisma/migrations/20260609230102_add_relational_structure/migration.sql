/*
  Warnings:

  - You are about to drop the column `causes` on the `obd_codes` table. All the data in the column will be lost.
  - You are about to drop the column `solutions` on the `obd_codes` table. All the data in the column will be lost.
  - You are about to drop the column `symptoms` on the `obd_codes` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `obd_codes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `obd_codes` DROP COLUMN `causes`,
    DROP COLUMN `solutions`,
    DROP COLUMN `symptoms`,
    ADD COLUMN `categoryId` INTEGER NOT NULL,
    MODIFY `description` TEXT NULL;

-- CreateTable
CREATE TABLE `obd_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` CHAR(1) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `obd_categories_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `obd_symptoms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codeId` INTEGER NOT NULL,
    `symptom` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `obd_symptoms_codeId_idx`(`codeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `obd_causes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codeId` INTEGER NOT NULL,
    `cause` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `obd_causes_codeId_idx`(`codeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `obd_solutions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codeId` INTEGER NOT NULL,
    `solution` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `obd_solutions_codeId_idx`(`codeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `brand` VARCHAR(191) NULL,
    `year` INTEGER NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `vehicle_types_type_idx`(`type`),
    INDEX `vehicle_types_brand_idx`(`brand`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `code_vehicle_compatibility` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codeId` INTEGER NOT NULL,
    `vehicleTypeId` INTEGER NOT NULL,
    `applicable` BOOLEAN NOT NULL DEFAULT true,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `code_vehicle_compatibility_codeId_idx`(`codeId`),
    INDEX `code_vehicle_compatibility_vehicleTypeId_idx`(`vehicleTypeId`),
    UNIQUE INDEX `code_vehicle_compatibility_codeId_vehicleTypeId_key`(`codeId`, `vehicleTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `obd_codes_categoryId_idx` ON `obd_codes`(`categoryId`);

-- CreateIndex
CREATE FULLTEXT INDEX `obd_codes_code_title_description_idx` ON `obd_codes`(`code`, `title`, `description`);

-- AddForeignKey
ALTER TABLE `obd_codes` ADD CONSTRAINT `obd_codes_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `obd_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obd_symptoms` ADD CONSTRAINT `obd_symptoms_codeId_fkey` FOREIGN KEY (`codeId`) REFERENCES `obd_codes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obd_causes` ADD CONSTRAINT `obd_causes_codeId_fkey` FOREIGN KEY (`codeId`) REFERENCES `obd_codes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obd_solutions` ADD CONSTRAINT `obd_solutions_codeId_fkey` FOREIGN KEY (`codeId`) REFERENCES `obd_codes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `code_vehicle_compatibility` ADD CONSTRAINT `code_vehicle_compatibility_codeId_fkey` FOREIGN KEY (`codeId`) REFERENCES `obd_codes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `code_vehicle_compatibility` ADD CONSTRAINT `code_vehicle_compatibility_vehicleTypeId_fkey` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicle_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
