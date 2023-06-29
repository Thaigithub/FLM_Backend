import { Injectable } from '@nestjs/common';
import { DeviceborrowService } from './deviceborrow/deviceborrow.service';
import { DevicehistoryService } from './devicehistory/devicehistory.service';
import { DevicemediaService } from './devicemedia/devicemedia.service';
import { FormattachService } from './formattach/formattach.service';
import { FormhistoryService } from './formhistory/formhistory.service';
@Injectable()
export class UtilsService {
    constructor(
        public deviceBorrowService: DeviceborrowService,
        public deviceHistoryService: DevicehistoryService,
        public deviceMediaService: DevicemediaService,
        public formAttachService: FormattachService,
        public formHistoryService: FormhistoryService
    ){}
}
