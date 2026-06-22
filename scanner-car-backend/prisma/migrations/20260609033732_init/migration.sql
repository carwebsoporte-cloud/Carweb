-- CreateTable
CREATE TABLE `obd_codes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `symptoms` VARCHAR(191) NULL,
    `causes` VARCHAR(191) NULL,
    `solutions` VARCHAR(191) NULL,
    `severity` VARCHAR(191) NOT NULL DEFAULT 'Moderada',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `obd_codes_code_key`(`code`),
    INDEX `obd_codes_code_idx`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
