import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FormhistoryService {
    constructor(
        private prismaService: PrismaService
    ){}
    async record(formId: string, status: number, userId: string, note: string|null){
        return await this.prismaService.formHistory.create({
            data:{
                formId:formId,
                status:status,
                userId:userId,
                note: note
            },
            select:{
                date:true,
                id: true
            }
        })
    }
}
