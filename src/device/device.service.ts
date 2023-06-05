import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeviceCreateDto, DeviceImageAddDto, DeviceImageDeleteDto, DeviceUpdateDto } from './device.dto';
import { ConfigService } from '@nestjs/config';
import { createWriteStream, existsSync, mkdirSync, unlink } from 'fs';
import * as path from 'path';
import { error } from 'console';
@Injectable()
export class DeviceService {
    constructor(
        private prismaService: PrismaService,
        private configService: ConfigService
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
            if (medias!==undefined){
                const destination = this.configService.get('MEDIA_LOCATION')
                medias.map(async (element)=>{
                    const extension = path.extname(element.originalname)
                    const media = await this.prismaService.deviceImage.create({
                        data:{
                            deviceId:device.id
                        }
                    })
                    const filepath = `${destination}/${device.id}`
                    if (!existsSync(filepath)) {
                        mkdirSync(filepath, { recursive: true });
                    }
                    const writestream = createWriteStream(`${filepath}/${media.id}${extension}`)
                    writestream.write(element.buffer)
                    writestream.end()
                    await this.prismaService.deviceImage.update({
                        where: {
                            id: media.id
                        },
                        data:{
                            url: filepath
                        }
                    })
                    await this.prismaService.deviceHistory.create({
                        data:{
                            deviceId:device.id
                        }
                    })
                })
            }
            return {
                message:"Successful"
            }
        }catch(error) {
            console.log(error)
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
            return {
                message:"Successfull"
            }
        }catch(error){
            console.log(error)
        }
    }
    async addmedia(body: DeviceImageAddDto,medias: Express.Multer.File[]){
        try{
            const destination = this.configService.get('MEDIA_LOCATION')
            medias.map(async (element)=>{
                const extension = path.extname(element.originalname)
                const media = await this.prismaService.deviceImage.create({
                    data:{
                        deviceId:body.deviceId
                    }
                })
                const filepath = `${destination}/${body.deviceId}`
                if (!existsSync(filepath)) {
                    mkdirSync(filepath, { recursive: true });
                }
                const writestream = createWriteStream(`${filepath}/${media.id}${extension}`)
                writestream.write(element.buffer)
                writestream.end()
                await this.prismaService.deviceImage.update({
                    where: {
                        id: media.id
                    },
                    data:{
                        url: filepath
                    }
                })
            })
            await this.prismaService.deviceHistory.create({
                data:{
                    deviceId:body.deviceId,
                }
            })
            return {
                message: "Successfull"
            }
        }catch(error){
            console.log(error)
        }
    }
    async deletemedia(body: DeviceImageDeleteDto){
        try{
            const media = await this.prismaService.deviceImage.delete({
                where:{
                    id: body.id
                },
                select:{
                    url: true
                }
            })
            unlink(media.url,(error)=>{throw(error)})
            return {
                message: "Successfull"
            }
        }catch(error){
            console.log(error)
        }
    }
    async getall(){
        try{
            return await this.prismaService.device.findMany({})
        }catch(error){
            console.log(error)
        }
    }
    async getavailable(){
        try{
            return await this.prismaService.device.findMany({
                where:{
                    status:0
                },
                select:{
                    id: true,
                    name: true
                }
            })
        }catch(error){
            console.log(error)
        }
    }
    
}
