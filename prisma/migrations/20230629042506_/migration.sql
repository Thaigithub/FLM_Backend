/*
  Warnings:

  - You are about to drop the column `returnFormId` on the `evaluateform` table. All the data in the column will be lost.
  - Added the required column `formId` to the `EvaluateForm` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `evaluateform` DROP FOREIGN KEY `EvaluateForm_returnFormId_fkey`;

-- AlterTable
ALTER TABLE `evaluateform` DROP COLUMN `returnFormId`,
    ADD COLUMN `formId` VARCHAR(191) NOT NULL;
