import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class DeviceborrowService {
    constructor(
        private prismaService: PrismaService
    ){}
    record(formId: string, list: string[]){
        list.forEach(async (element)=>{
            await this.prismaService.deviceBorrow.create({
                data:{
                    formId:formId,
                    deviceId:element
                }
            })
        })
    }
    async update(formId: string, list: string[]){
        const olddevice = await this.prismaService.deviceBorrow.findMany({
            where:{
                formId: formId
            },
            select:{
                deviceId: true
            }
        })
        olddevice.forEach(async(element)=>{
            if (!list.includes(element.deviceId)){
                await this.prismaService.deviceBorrow.deleteMany({
                    where:{
                        formId: formId,
                        deviceId: element.deviceId
                    }
                })
            }
        })
        const newdevice = await Promise.all(list.map(async(element)=>{
            const device = await this.prismaService.deviceBorrow.findMany({
                where:{
                    formId: formId,
                    deviceId: element
                }
            })
            if (device.length===0){
                await this.prismaService.deviceBorrow.create({
                    data:{
                        formId: formId,
                        deviceId: element
                    }
                })
            }
        }))
    }
    async getbyformid(formId: string) {
        return await this.prismaService.deviceBorrow.findMany({
            where:{
                formId: formId
            },
            select:{
                deviceId: true
            }
        })
    }
    async getbyreturnformid(formId: string) {
        return await this.prismaService.deviceBorrow.findMany({
            where:{
                returnFormId: formId
            },
            select:{
                deviceId: true
            }
        })
    }
    async recordreturn(formId:string, deviceId:string, returnFormId: string){
        await this.prismaService.deviceBorrow.updateMany({
            where:{
                formId: formId,
                deviceId: deviceId
            },
            data:{
                returnFormId: returnFormId
            }
        })
    }
}
