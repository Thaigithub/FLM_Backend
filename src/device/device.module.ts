import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { UtilsModule } from '../utils/utils.module';

@Module({
  imports: [PrismaModule, JwtModule, UtilsModule],
  providers: [DeviceService],
  controllers: [DeviceController]
})
export class DeviceModule {}
