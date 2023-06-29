import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class DevicehistoryService {
    constructor(
        private prismaService: PrismaService
    ){}
    async getbydeviceid(deviceid: string){
        try {
            return await this.prismaService.deviceHistory.findMany({
                where:{
                    deviceId: deviceid
                }
            })
        }catch(error){
            return {
                status: 500,
                message: error
            }
        }
    }
    async record(deviceId: string, status: number, formId: string | null, note: string|null){
        try{
            await this.prismaService.deviceHistory.create({
                data:{
                    deviceId: deviceId,
                    status: status,
                    formId: formId,
                    note: note
                }
            })
        }catch(error) {
            // return {
            //     status: 500,
            //     message: error
            // }
        }
    }
}
