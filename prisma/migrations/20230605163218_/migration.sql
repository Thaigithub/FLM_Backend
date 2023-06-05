-- DropIndex
DROP INDEX `DeviceHistory_formId_fkey` ON `devicehistory`;

-- AlterTable
ALTER TABLE `devicehistory` MODIFY `status` INTEGER NULL;
