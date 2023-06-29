import { Module } from '@nestjs/common';
import { DeviceborrowService } from './deviceborrow/deviceborrow.service';
import { DevicehistoryService } from './devicehistory/devicehistory.service';
import { DevicemediaService } from './devicemedia/devicemedia.service';
import { FormattachService } from './formattach/formattach.service';
import { UtilsService } from './utils.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FormhistoryService } from './formhistory/formhistory.service';

@Module({
  imports: [
    PrismaModule
  ],
  providers: [
    DeviceborrowService,
    DevicehistoryService,
    DevicemediaService,
    FormattachService,
    UtilsService,
    FormhistoryService
  ],
  exports: [
    UtilsService
  ]
})
export class UtilsModule {}
