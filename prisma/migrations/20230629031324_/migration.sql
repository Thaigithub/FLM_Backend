/*
  Warnings:

  - You are about to drop the `returnformhistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `returnformhistory` DROP FOREIGN KEY `ReturnFormHistory_returnFormId_fkey`;

-- DropForeignKey
ALTER TABLE `returnformhistory` DROP FOREIGN KEY `ReturnFormHistory_userId_fkey`;

-- DropIndex
DROP INDEX `FormHistory_formId_fkey` ON `formhistory`;

-- AlterTable
ALTER TABLE `device` ADD COLUMN `group` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `returnformhistory`;
