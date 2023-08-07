/*
  Warnings:

  - You are about to drop the column `decision` on the `form` table. All the data in the column will be lost.
  - You are about to drop the `deviceimage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `deviceimage` DROP FOREIGN KEY `DeviceImage_deviceId_fkey`;

-- AlterTable
ALTER TABLE `devicehistory` ADD COLUMN `note` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `form` DROP COLUMN `decision`;

-- DropTable
DROP TABLE `deviceimage`;

-- CreateTable
CREATE TABLE `FormAttach` (
    `id` VARCHAR(191) NOT NULL,
    `formId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `FormAttach_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeviceMedia` (
    `id` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,

    UNIQUE INDEX `DeviceMedia_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EvaluateForm` (
    `id` VARCHAR(191) NOT NULL,
    `formId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` BOOLEAN NOT NULL,

    UNIQUE INDEX `EvaluateForm_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeviceEvaluate` (
    `id` VARCHAR(191) NOT NULL,
    `evaluateFormId` VARCHAR(191) NOT NULL,
    `deviceBorrowId` VARCHAR(191) NOT NULL,
    `status` BOOLEAN NOT NULL,

    UNIQUE INDEX `DeviceEvaluate_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FormAttach` ADD CONSTRAINT `FormAttach_formId_fkey` FOREIGN KEY (`formId`) REFERENCES `Form`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeviceMedia` ADD CONSTRAINT `DeviceMedia_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `Device`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluateForm` ADD CONSTRAINT `EvaluateForm_formId_fkey` FOREIGN KEY (`formId`) REFERENCES `Form`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluateForm` ADD CONSTRAINT `EvaluateForm_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeviceEvaluate` ADD CONSTRAINT `DeviceEvaluate_evaluateFormId_fkey` FOREIGN KEY (`evaluateFormId`) REFERENCES `EvaluateForm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeviceEvaluate` ADD CONSTRAINT `DeviceEvaluate_deviceBorrowId_fkey` FOREIGN KEY (`deviceBorrowId`) REFERENCES `DeviceBorrow`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
