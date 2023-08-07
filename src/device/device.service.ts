import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeviceCreateDto, DeviceUpdateDto, DeviceMediaAddDto, DeviceMediaDeleteDto } from './device.dto';
import { UtilsService } from '../utils/utils.service';
import { Response } from 'express';
@Injectable()
export class DeviceService {
    constructor(
        private prismaService: PrismaService,
        private utilsService: UtilsService
    ){}
    async create(body: DeviceCreateDto, medias: Express.Multer.File[]){
        try {
            const device = await this.prismaService.device.create({
                data: {
                    name: body.name,
                    status: 0,
                    id: body.id
                },
                select: {
                    id: true
                }
            })
            await this.utilsService.deviceHistoryService.record(body.id,0,null,'Device is added to the system')
            if (medias!==undefined){
                return await this.utilsService.deviceMediaService.addmedia(device.id,medias)
            }
            else {
                return {
                    status: 200,
                    message:"Successful"
                }
            }
        }catch(error) {
            return {
                status: 500,
                message: error
            }
        }
    }
    async update(body: DeviceUpdateDto){
        try{
            await this.prismaService.device.update({
                where: {
                    id: body.id
                },
                data:{
                    name: body.name,
                    status: body.status
                }
            })
            await this.utilsService.deviceHistoryService.record(body.id,body.status,body.formId,body.note)
            return {
                status: 200,
                message:"Successful"
            }
        }catch(error){
            return {
                status: 500,
                message: error
            }
        }
    }
    async getall(){
        try{
            const data =  await this.prismaService.device.findMany({})
            return {
                status: 200,
                data: data
            }
        }catch(error){
            return {
                status: 500,
                message: error
            }
        }
    }
    async getdetail(id:string){
        try {
            const device = await this.prismaService.device.findUnique({
                where:{
                    id:id
                },
                select:{
                    status:true
                }
            })
            if (!device) {
                return {
                    status: 404,
                    message: 'Device not found'
                }
            }
            const devicemedia = await this.utilsService.deviceMediaService.getbydeviceid(id)
            const devicehistory = await this.utilsService.deviceHistoryService.getbydeviceid(id)
            return{
                status: 200,
                device: device,
                media: devicemedia.map(element=>element.id),
                history: devicehistory
            }
        }catch(error){
            return {
                status: 500,
                message: error
            }
        }
    }
    async addmedia(medias: Express.Multer.File[],body: DeviceMediaAddDto){
        return await this.utilsService.deviceMediaService.addmedia(body.deviceId,medias)
    }
    async deletemedia (body: DeviceMediaDeleteDto){
        return this.utilsService.deviceMediaService.deletemedia(body.id)
    }
    async loadmedia(id: string, res: Response){
        await this.utilsService.deviceMediaService.loadmedia(id, res)
    }
}
