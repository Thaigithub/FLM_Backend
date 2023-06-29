import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { createWriteStream, existsSync, mkdirSync, unlink } from 'fs';
import { Response } from 'express'
import * as path from 'path';
@Injectable()
export class DevicemediaService {
    constructor(
        private prismaService: PrismaService,
        private configService: ConfigService
    ){}
    async addmedia(deviceId: string ,medias: Express.Multer.File[]){
        try{
            const destination = this.configService.get('MEDIA_LOCATION')
            medias.forEach(async (element)=>{
                const extension = path.extname(element.originalname)
                const media = await this.prismaService.deviceMedia.create({
                    data:{
                        deviceId:deviceId
                    }
                })
                const filepath = `${destination}/${deviceId}`
                if (!existsSync(filepath)) {
                    mkdirSync(filepath, { recursive: true });
                }
                const writestream = createWriteStream(`${filepath}/${media.id}${extension}`)
                writestream.write(element.buffer)
                writestream.end()
                await this.prismaService.deviceMedia.update({
                    where: {
                        id: media.id
                    },
                    data:{
                        url: `${filepath}/${media.id}${extension}`
                    }
                })
            })
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
    async deletemedia(id: string){
        try{
            const media = await this.prismaService.deviceMedia.delete({
                where:{
                    id: id
                },
                select:{
                    url: true
                }
            })
            unlink(media.url,(error)=>{throw(error)})
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
    async loadmedia(id:string, res: Response){
        try{
            const devicemedia = await this.prismaService.deviceMedia.findUnique({
                where:{
                    id:id
                },
                select:{
                    url: true
                }
            })
            if (!devicemedia) {
                return {
                    status: 404,
                    message: 'Media id not found'
                }
            }
            else{
                res.status(200).sendFile(path.resolve(devicemedia.url));
            }
        }catch(error){
            res.status(500).json(error)
        }
    }
    async getbydeviceid(deviceId: string){
        try{
            return await this.prismaService.deviceMedia.findMany({
                where:{
                    deviceId: deviceId
                },
                select:{
                    id:true
                }
            })
        }catch(error){
            // return {
            //     status: 500,
            //     message: error
            // }
        }
    }
}
