import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { createWriteStream, existsSync, mkdirSync, unlink } from 'fs';
import { Response } from 'express'
import * as path from 'path';
@Injectable()
export class FormattachService {
    constructor(
        private prismaService: PrismaService,
        private configService: ConfigService
    ){}
    async addattach(formId: string ,attaches: Express.Multer.File[]){
        try{
            const form = await this.prismaService.form.findUnique({
                where:{
                    id: formId
                },
                select:{
                    status: true
                }
            })
            if (!form) {
                return {
                    status: 404,
                    message: "Form not found"
                }
            }
            if (![10, 21, 40].includes(form.status)){
                return {
                    status: 403,
                    message: "Form is not available to configurate"
                }
            }
            const destination = this.configService.get('ATTACH_LOCATION')
            attaches.forEach(async (element)=>{
                const extension = path.extname(element.originalname)
                const attach = await this.prismaService.formAttach.create({
                    data:{
                        formId: formId,
                        name: element.originalname
                    }
                })
                const filepath = `${destination}/${formId}`
                if (!existsSync(filepath)) {
                    mkdirSync(filepath, { recursive: true });
                }
                const writestream = createWriteStream(`${filepath}/${attach.id}${extension}`)
                writestream.write(element.buffer)
                writestream.end()
                await this.prismaService.formAttach.update({
                    where: {
                        id: attach.id
                    },
                    data:{
                        url: `${filepath}/${attach.id}${extension}`
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
    async deleteattach(id: string){
        try{
            const attach = await this.prismaService.formAttach.findUnique({
                where:{
                    id: id
                },
                select:{
                    formId: true,
                    url: true
                }
            })
            if (!attach) {
                return {
                    status: 404,
                    message: "Attach not found"
                }
            }
            const form = await this.prismaService.form.findUnique({
                where:{
                    id: attach.formId
                },
                select:{
                    status: true
                }
            })
            if (!form) {
                return {
                    status: 404,
                    message: "Form not found"
                }
            }
            if (![10, 21, 40].includes(form.status)){
                return {
                    status: 403,
                    message: "Form is not available to configurate"
                }
            }
            unlink(attach.url,(error)=>{throw(error)})
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
    async loadattach(id:string, res: Response){
        try{
            const formattach = await this.prismaService.formAttach.findUnique({
                where:{
                    id:id
                },
                select:{
                    url: true
                }
            })
            if (!formattach) {
                res.status(404).json("Attach not found")
            }
            else{
                res.status(200).sendFile(path.resolve(formattach.url));
            }
        }catch(error){
            res.status(500).json(error)
        }
    }
    async getbyformid(formId: string){
        try{
            return await this.prismaService.formAttach.findMany({
                where:{
                    formId: formId
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
