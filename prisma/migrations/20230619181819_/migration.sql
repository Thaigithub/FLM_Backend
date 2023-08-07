/*
  Warnings:

  - You are about to drop the column `formId` on the `evaluateform` table. All the data in the column will be lost.
  - Added the required column `returnFormId` to the `EvaluateForm` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `evaluateform` DROP FOREIGN KEY `EvaluateForm_formId_fkey`;

-- AlterTable
ALTER TABLE `deviceborrow` ADD COLUMN `returnFormId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `evaluateform` DROP COLUMN `formId`,
    ADD COLUMN `returnFormId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `formhistory` ADD COLUMN `note` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `ReturnForm` (
    `id` VARCHAR(191) NOT NULL,
    `formId` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL,

    UNIQUE INDEX `ReturnForm_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReturnFormHistory` (
    `id` VARCHAR(191) NOT NULL,
    `returnFormId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,

    UNIQUE INDEX `ReturnFormHistory_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ReturnForm` ADD CONSTRAINT `ReturnForm_formId_fkey` FOREIGN KEY (`formId`) REFERENCES `Form`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReturnFormHistory` ADD CONSTRAINT `ReturnFormHistory_returnFormId_fkey` FOREIGN KEY (`returnFormId`) REFERENCES `ReturnForm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReturnFormHistory` ADD CONSTRAINT `ReturnFormHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluateForm` ADD CONSTRAINT `EvaluateForm_returnFormId_fkey` FOREIGN KEY (`returnFormId`) REFERENCES `ReturnForm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
