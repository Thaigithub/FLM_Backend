-- DropForeignKey
ALTER TABLE `devicehistory` DROP FOREIGN KEY `DeviceHistory_formId_fkey`;

-- AlterTable
ALTER TABLE `devicehistory` MODIFY `formId` VARCHAR(191) NULL;
