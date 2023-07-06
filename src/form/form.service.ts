import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { FormAddAttachDto, FormConfigDto, FormConfigReturnDto, FormCreateDto, FormCreateReturnDto, FormDeleteAttachDto, FormLoadAttachDto, FormConfirmDto, FormEvaluateDto} from './form.dto';
import { MailService } from '../mail/mail.service';
import { UtilsService } from '../utils/utils.service';
import { format } from 'date-fns';
import { Response } from 'express';
@Injectable()
export class FormService {
    constructor(
        private prismaService: PrismaService,
        private jwtService: JwtService,
        private mailService: MailService,
        private utilsService: UtilsService
    ){}
    async create(body:FormCreateDto, jwtToken:string, attaches: Express.Multer.File[]){
        try{
            const userId = await this.jwtService.decode(jwtToken)['userId']
            const user = await this.prismaService.user.findUnique({
                where:{
                    id: userId
                },
                select: {
                    firstName: true,
                    lastName: true,
                    unit: true,
                    execId: true,
                    id:true,
                }
            })
            body.devices.forEach(async (element)=>{
                const device = await this.prismaService.device.findUnique({
                    where:{
                        id: element
                    },
                    select: {
                        status:true
                    }
                })
                if (device===undefined) {
                    return{
                        status: 404,
                        message:'Device not found'  
                    } 
                }
                if (device.status!==0) {
                    return{
                        status: 404,
                        message:'Device is not available'  
                    }
                }
            })
            const form = await this.prismaService.form.create({
                data: {
                    borrowDate: body.borrowDate,
                    returnDate: body.returnDate,
                    project: body.project,
                    status: 10,
                    userId: user.id
                },
                select: {
                    id: true
                }
            })
            await this.utilsService.formAttachService.addattach(form.id,attaches)
            const formhistory = await this.utilsService.formHistoryService.record(form.id, 10, user.id, 'Form create')
            this.utilsService.deviceBorrowService.record(form.id,body.devices)
            const exec = await this.prismaService.user.findUnique({
                where:{
                    id:user.execId
                },
                select:{
                    firstName:true,
                    lastName:true,
                    email:true
                }
            })
            const context = {
                sender:`${user.lastName} ${user.firstName}`,
                dateSend: formhistory.date,
                formId:form.id,
                borrowDate: format(new Date(body.borrowDate), 'dd-MM-yyyy'),
                returnDate: format(new Date(body.returnDate), 'dd-MM-yyyy'),
                project: body.project,
                unit: user.unit,
                executor: `${exec.lastName} ${exec.firstName}`,
                borrower: `${user.lastName} ${user.firstName}`,
                status: 10
            }
            this.mailService.sendEmail(exec.email,"Thông báo có đơn mượn",context,'borrow')
            return {
                status: 200,
                message: "Successfull"
            }
        }catch(error){
            return {
                status: 500,
                message: error
            }
        }
    }
    async config(body: FormConfigDto, jwtToken: string){
        try{
            const userId = await this.jwtService.decode(jwtToken)['userId']
            const role = await this.jwtService.decode(jwtToken)['role']
            const form = await this.prismaService.form.findUnique({
                where:{
                    id: body.formId
                },
                select:{
                    status:true,
                    userId: true,
                }
            })
            if (!form) {
                return {
                    status: 404,
                    message: "Form unfound"
                }
            }
            if (!(([10,21].includes(form.status)&&role===1) || ([30,40,51].includes(form.status)&&role===4))){
                return {
                    status: 403,
                    message: "Form is not at appropriate status to config"
                }
            }
            body.devices.forEach(async (element)=>{
                const device = await this.prismaService.device.findUnique({
                    where:{
                        id: element
                    },
                    select: {
                        status:true
                    }
                })
                if (device===undefined) {
                    return{
                        status: 404,
                        message:'Device not found'  
                    } 
                }
                if (device.status!==0) {
                    return{
                        status: 404,
                        message:'Device is not available'  
                    }
                }
            })
            await this.utilsService.deviceBorrowService.update(body.formId,body.devices)
            if (role===1){
                const formhistory = await this.utilsService.formHistoryService.record(body.formId, 10, userId, "Form update")
                await this.prismaService.form.update({
                    where:{
                        id: body.formId
                    },
                    data: {
                        borrowDate: body.borrowDate,
                        returnDate: body.returnDate,
                        project: body.project,
                        status: 10
                    }
                })
                const user = await this.prismaService.user.findUnique({
                    where:{
                        id: userId
                    },
                    select: {
                        firstName: true,
                        lastName: true,
                        unit: true,
                        execId: true,
                        id:true,
                    }
                })
                const exec = await this.prismaService.user.findUnique({
                    where:{
                        id:user.execId
                    },
                    select:{
                        firstName:true,
                        lastName:true,
                        email:true
                    }
                })
                const context = {
                    sender:`${user.lastName} ${user.firstName}`,
                    dateSend: formhistory.date,
                    formId:body.formId,
                    borrowDate: format(new Date(body.borrowDate), 'dd-MM-yyyy'),
                    returnDate: format(new Date(body.returnDate), 'dd-MM-yyyy'),
                    project: body.project,
                    unit: user.unit,
                    executor: `${exec.lastName} ${exec.firstName}`,
                    borrower: `${user.lastName} ${user.firstName}`,
                    status: 10
                }
                this.mailService.sendEmail(exec.email,"Thông báo mượn thiết bị đã được cập nhật",context,'borrow')
                return {
                    status: 200,
                    message: "Successfull"
                }
            }
            else {
                const formhistory = await this.utilsService.formHistoryService.record(body.formId, 40, userId, "Form update")
                await this.prismaService.form.update({
                    where:{
                        id: body.formId
                    },
                    data: {
                        borrowDate: body.borrowDate,
                        returnDate: body.returnDate,
                        project: body.project,
                        status: 40
                    }
                })
                const user = await this.prismaService.user.findUnique({
                    where:{
                        id: userId
                    },
                    select:{
                        firstName: true,
                        lastName: true
                    }
                })
                const borrower = await this.prismaService.user.findUnique({
                    where:{
                        id: form.userId
                    },
                    select: {
                        firstName: true,
                        lastName: true,
                        unit: true,
                        execId: true,
                        id:true,
                        email: true
                    }
                })
                const exec = await this.prismaService.user.findUnique({
                    where:{
                        id:borrower.execId
                    },
                    select:{
                        firstName:true,
                        lastName:true,
                        email:true
                    }
                })
                const context = {
                    sender:`${user.lastName} ${user.firstName}`,
                    dateSend: formhistory.date,
                    formId:body.formId,
                    borrowDate: format(new Date(body.borrowDate), 'dd-MM-yyyy'),
                    returnDate: format(new Date(body.returnDate), 'dd-MM-yyyy'),
                    project: body.project,
                    unit: borrower.unit,
                    executor: `${exec.lastName} ${exec.firstName}`,
                    borrower: `${borrower.lastName} ${borrower.firstName}`,
                    status: 40
                }
                this.mailService.sendEmail(borrower.email,"Thông báo mượn thiết bị đã được cập nhật",context,'borrow')
                return {
                    status: 200,
                    message: "Successfull"
                }
            }
        }catch(error){
            return {
                status:500,
                message:error
            }
        }
    }
    async createreturn(body: FormCreateReturnDto, jwtToken:string){
        try{
            const userId = await this.jwtService.decode(jwtToken)['userId']
            const form = await this.prismaService.form.findUnique({
                where: {
                    id: body.formId
                }
            })
            if (!form) {
                return {
                    status: 404,
                    message: "Form unfound"
                }
            }
            if (form.userId !== userId) {
                return {
                    status: 403,
                    message: "Not the author of the form"
                }
            }
            if (form.status !== 55) {
                return {
                    status: 403,
                    message: "Form is not at appropriate status for you to create return request"
                }
            }
            const deviceBorrow = (await this.utilsService.deviceBorrowService.getbyformid(body.formId)).map(element=>element.deviceId)
            const returnrequesteddevice = await (await this.prismaService.returnForm.findMany({
                where:{
                    formId: body.formId
                },
                select:{
                    id: true
                }
            })).map(element=>element.id).reduce(async(promise: Promise<Array<string>>, element)=>{
                const accum = await promise
                return accum.concat((await this.utilsService.deviceBorrowService.getbyreturnformid(element)).map(element=>element.deviceId))
            },Promise.resolve([]))
            body.devices.forEach(async(element)=>{
                if (!deviceBorrow.includes(element)){
                    return {
                        status: 404,
                        message: "DeviceId is not found with the formId"
                    }
                }
                if (returnrequesteddevice.includes(element)) {
                    return {
                        status: 403,
                        message: "DeviceId has been requested for return in another return formId"
                    }
                }
            })
            const returnForm = await this.prismaService.returnForm.create({
                data:{
                    formId: body.formId,
                    status: 60
                },
                select:{
                    id: true
                }
            })
            const formhistory = await this.utilsService.formHistoryService.record(returnForm.id,60,userId,"Form request create")
            body.devices.forEach(async(element)=>{
                await this.utilsService.deviceBorrowService.recordreturn(body.formId,element,returnForm.id)
            })
            const user = await this.prismaService.user.findUnique({
                where:{
                    id: userId
                },
                select: {
                    firstName: true,
                    lastName: true,
                    unit: true,
                    execId: true,
                    id:true,
                }
            })
            const exec = await this.prismaService.user.findUnique({
                where:{
                    id:user.execId
                },
                select:{
                    firstName:true,
                    lastName:true,
                    email:true
                }
            })
            const context = {
                sender:`${user.lastName} ${user.firstName}`,
                dateSend: formhistory.date,
                borowFormId: body.formId,
                returnFormId: returnForm.id,
                borrowDate: format(new Date(form.borrowDate), 'dd-MM-yyyy'),
                returnDate: format(new Date(form.returnDate), 'dd-MM-yyyy'),
                project: form.project,
                unit: user.unit,
                executor: `${exec.lastName} ${exec.firstName}`,
                borrower: `${user.lastName} ${user.firstName}`,
                status: 60
            }
            this.mailService.sendEmail(exec.email,"Thông báo có đơn trả",context,'return')
            return {
                status: 200,
                message: "Successfull"
            }
        }catch(error){
            return {
                status:500,
                message:error
            }
        }
    }
    async configreturn(body:FormConfigReturnDto, jwtToken:string){
        try{
            const userId = this.jwtService.decode(jwtToken)['userId']
            const role = this.jwtService.decode(jwtToken)['role']
            const returnform = await this.prismaService.returnForm.findUnique({
                where:{
                    id: body.formId
                }
            })
            if (!returnform) {
                return {
                    status: 404,
                    message: "Form not found"
                }
            }
            const formlist = await this.prismaService.form.findMany({
                where:{
                    id: returnform.formId,
                    userId: userId
                }
            })
            if (formlist.length===0) {
                return {
                    status:403,
                    message:"Form is not at appropriate status to config"
                }
            }
            const form = formlist[0]
            if (!(((form.status===71 || form.status===60)&&role===1) || ((form.status===80||form.status===90)&&role===4))){
                return {
                    status:403,
                    message:"Form is not at appropriate status to config"
                }
            }
            const deviceBorrow = (await this.utilsService.deviceBorrowService.getbyformid(returnform.formId)).map(element=>element.deviceId)
            const returnrequesteddevice = await (await this.prismaService.returnForm.findMany({
                where:{
                    formId: returnform.formId
                },
                select:{
                    id: true
                }
            })).map(element=>element.id).reduce(async(promise: Promise<Array<string>>, element)=>{
                const accum = await promise
                return accum.concat((await this.utilsService.deviceBorrowService.getbyreturnformid(element)).map(element=>element.deviceId))
            },Promise.resolve([]))
            body.devices.forEach(async(element)=>{
                if (!deviceBorrow.includes(element)) {
                    return {
                        status: 404,
                        message: "DeviceId is not found with the formId"
                    }
                }
                if (returnrequesteddevice.includes(element)) {
                    return {
                        status: 403,
                        message: "DeviceId has been requested for return in another return formId"
                    }
                }
            })
            if (role===1){
                const formhistory = await this.utilsService.formHistoryService.record(body.formId, 60, userId, "Return form update")
                await this.prismaService.returnForm.update({
                    where:{
                        id: body.formId
                    },
                    data: {
                        status: 60
                    }
                })
                const user = await this.prismaService.user.findUnique({
                    where:{
                        id: userId
                    },
                    select: {
                        firstName: true,
                        lastName: true,
                        unit: true,
                        execId: true,
                        id:true,
                    }
                })
                const exec = await this.prismaService.user.findUnique({
                    where:{
                        id:user.execId
                    },
                    select:{
                        firstName:true,
                        lastName:true,
                        email:true
                    }
                })
                const context = {
                    sender:`${user.lastName} ${user.firstName}`,
                    dateSend: formhistory.date,
                    borrowFormId:form.id,
                    returnFormId:body.formId,
                    borrowDate: format(new Date(form.borrowDate), 'dd-MM-yyyy'),
                    returnDate: format(new Date(form.returnDate), 'dd-MM-yyyy'),
                    project: form.project,
                    unit: user.unit,
                    executor: `${exec.lastName} ${exec.firstName}`,
                    borrower: `${user.lastName} ${user.firstName}`,
                    status: 60
                }
                this.mailService.sendEmail(exec.email,"Thông báo trả thiết bị đã được cập nhật",context,'return')
                return {
                    status: 200,
                    message: "Successfull"
                }
            }
            else {
                const formhistory = await this.utilsService.formHistoryService.record(body.formId, 90, userId, "Return form update")
                await this.prismaService.returnForm.update({
                    where:{
                        id: body.formId
                    },
                    data: {
                        status: 90
                    }
                })
                const user = await this.prismaService.user.findUnique({
                    where:{
                        id: userId
                    },
                    select:{
                        firstName: true,
                        lastName: true
                    }
                })
                const borrower = await this.prismaService.user.findUnique({
                    where:{
                        id: form.userId
                    },
                    select: {
                        firstName: true,
                        lastName: true,
                        unit: true,
                        execId: true,
                        id:true,
                        email: true
                    }
                })
                const exec = await this.prismaService.user.findUnique({
                    where:{
                        id:borrower.execId
                    },
                    select:{
                        firstName:true,
                        lastName:true,
                        email:true
                    }
                })
                const context = {
                    sender:`${user.lastName} ${user.firstName}`,
                    dateSend: formhistory.date,
                    borrowFormId:form.id,
                    returnFormId:body.formId,
                    borrowDate: format(new Date(form.borrowDate), 'dd-MM-yyyy'),
                    returnDate: format(new Date(form.returnDate), 'dd-MM-yyyy'),
                    project: form.project,
                    unit: borrower.unit,
                    executor: `${exec.lastName} ${exec.firstName}`,
                    borrower: `${borrower.lastName} ${borrower.firstName}`,
                    status: 90
                }
                this.mailService.sendEmail(borrower.email,"Thông báo trả thiết bị đã được cập nhật",context,'return')
                return {
                    status: 200,
                    message: "Successfull"
                }
            }
        }catch(error){
            return {
                status: 500,
                message: error
            }
        }
    }
    async approve(type:string,body:FormConfirmDto,jwtToken:string){
        try{
            if (!['borrow','return'].includes(type)){
                return {
                    status: 400,
                    message: "Bad type request"
                }
            }
            const userId = this.jwtService.decode(jwtToken)['userId']
            const role = this.jwtService.decode(jwtToken)['role']
            switch(role) {
                case 1:{
                    if (type==='borrow'){
                        const form = await this.prismaService.form.findUnique({
                            where:{
                                id: body.formId
                            }
                        })
                        if (!form) {
                            return{
                                status: 404,
                                message: "Form not found"
                            }
                        }
                        if (form.status!==40){
                            return{
                                status: 403,
                                message: "Form not at appropriate status for you to approve"
                            }
                        }
                        await this.prismaService.form.update({
                            where:{
                                id: form.id
                            },
                            data:{
                                status: 50
                            }
                        });
                        (await this.utilsService.deviceBorrowService.getbyformid(form.id)).map(element=>element.deviceId).forEach(async(element)=>{
                            await this.prismaService.device.update({
                                where:{
                                    id:element
                                },
                                data:{
                                    status:2
                                }
                            })
                            await this.utilsService.deviceHistoryService.record(element,2,form.id,"Device is borrowed")
                        })
                        const formhistory = await this.utilsService.formHistoryService.record(form.id,50,userId,"Form is approved by borrower and waiting for confirmation of examination of borrower")
                        const user = await this.prismaService.user.findUnique({
                            where:{
                                id: userId
                            },
                            select: {
                                firstName: true,
                                lastName: true,
                                unit: true,
                                execId: true,
                                id:true,
                                email:true
                            }
                        })
                        const exec = await this.prismaService.user.findUnique({
                            where:{
                                id:user.execId
                            },
                            select:{
                                firstName:true,
                                lastName:true
                            }
                        })
                        const context = {
                            dateSend: formhistory.date,
                            formId:form.id,
                            borrowDate: format(new Date(form.borrowDate), 'dd-MM-yyyy'),
                            returnDate: format(new Date(form.returnDate), 'dd-MM-yyyy'),
                            project: form.project,
                            unit: user.unit,
                            executor: `${exec.lastName} ${exec.firstName}`,
                            borrower: `${user.lastName} ${user.firstName}`,
                            status: 50
                        }
                        this.mailService.sendEmail(user.email,"Thông báo đã xác nhận đơn mượn được sửa đổi lần cuối",context,'borrow confirmation')
                        return {
                            status: 200,
                            message: "Successful"
                        }
                    }
                    else {
                        const returnform = await this.prismaService.returnForm.findUnique({
                            where:{
                                id: body.formId
                            }
                        })
                        if (!returnform) {
                            return{
                                status: 404,
                                message: "Form not found"
                            }
                        }
                        if (returnform.status!==90){
                            return{
                                status: 403,
                                message: "Form not at appropriate status for you to approve"
                            }
                        }
                        await this.prismaService.returnForm.update({
                            where:{
                                id: returnform.id
                            },
                            data:{
                                status: 95
                            }
                        });
                        (await this.utilsService.deviceBorrowService.getbyreturnformid(returnform.id)).map(element=>element.deviceId).forEach(async(element)=>{
                            await this.prismaService.device.update({
                                where:{
                                    id:element
                                },
                                data:{
                                    status:0
                                }
                            })
                            await this.utilsService.deviceHistoryService.record(element,2,returnform.id,"Device is borrowed")
                        })
                        const formhistory = await this.utilsService.formHistoryService.record(returnform.id,95,userId,"Form is approved by borrower and waiting for confirmation of examination of examiner")
                        const form = await this.prismaService.form.findUnique({
                            where:{
                                id: returnform.formId
                            }
                        })
                        const user = await this.prismaService.user.findUnique({
                            where:{
                                id: userId
                            },
                            select: {
                                firstName: true,
                                lastName: true,
                                unit: true,
                                execId: true,
                                id:true,
                            }
                        })
                        const exec = await this.prismaService.user.findUnique({
                            where:{
                                id:user.execId
                            },
                            select:{
                                firstName:true,
                                lastName:true,
                                email:true
                            }
                        })
                        
                        const context = {
                            dateSend: formhistory.date,
                            formId:form.id,
                            borrowDate: format(new Date(form.borrowDate), 'dd-MM-yyyy'),
                            returnDate: format(new Date(form.returnDate), 'dd-MM-yyyy'),
                            project: form.project,
                            unit: user.unit,
                            executor: `${exec.lastName} ${exec.firstName}`,
                            borrower: `${user.lastName} ${user.firstName}`,
                            status: 95
                        };
                        (await this.prismaService.user.findMany({
                            where:{
                                role:6
                            },
                            select:{
                                email:true
                            }
                        })).map(element=>element.email).forEach(element=>{
                            this.mailService.sendEmail(element,"Thông báo kiểm tra thiết bị",context,'borrow confirmation')
                        })
                        return {
                            status: 200,
                            message: "Successful"
                        }
                    }
                }
                case 2:{
                    if (type==='borrow') {
                        const form = await this.prismaService.form.findUnique({
                            where:{
                                id: body.formId
                            }
                        })
                        if (!form) {
                            return{
                                status: 404,
                                message: "Form not found"
                            }
                        }
                        if (form.status!==10){
                            return{
                                status: 403,
                                message: "Form not at appropriate status for you to approve"
                            }
                        }
                        await this.prismaService.form.update({
                            where:{
                                id: form.id
                            },
                            data:{
                                status: 20
                            }
                        })
                        const formhistory = await this.utilsService.formHistoryService.record(form.id,20,userId,"Form is approved by execborrower and waiting for execlender")
                        const user = await this.prismaService.user.findUnique({
                            where:{
                                id: form.userId
                            },
                            select: {
                                firstName: true,
                                lastName: true,
                                unit: true,
                                execId: true,
                                id:true,
                            }
                        })
                        const exec = await this.prismaService.user.findUnique({
                            where:{
                                id:userId
                            },
                            select:{
                                firstName:true,
                                lastName:true,
                                email:true
                            }
                        })
                        const context = {
                            sender: `${exec.lastName} ${exec.firstName}`,
                            dateSend: formhistory.date,
                            formId:form.id,
                            borrowDate: format(new Date(form.borrowDate), 'dd-MM-yyyy'),
                            returnDate: format(new Date(form.returnDate), 'dd-MM-yyyy'),
                            project: form.project,
                            unit: user.unit,
                            executor: `${exec.lastName} ${exec.firstName}`,
                            borrower: `${user.lastName} ${user.firstName}`,
                            status: 20
                        };
                        (await this.prismaService.user.findMany({
                            where:{
                                role:3
                            },
                            select:{
                                email:true
                            }
                        })).map(element=>element.email).forEach(element=>{
                            this.mailService.sendEmail(element,"Thông báo có đơn mượn",context,'borrow')
                        })
                        return {
                            status: 200,
                            message: "Successful"
                        }
                    }
                    else {
                        const returnform = await this.prismaService.returnForm.findUnique({
                            where:{
                                id: body.formId
                            }
                        })
                        if (!returnform) {
                            return{
                                status: 404,
                                message: "Form not found"
                            }
                        }
                        if (returnform.status!==60){
                            return{
                                status: 403,
                                message: "Form not at appropriate status for you to approve"
                            }
                        }
                        await this.prismaService.returnForm.update({
                            where:{
                                id: returnform.id
                            },
                            data:{
                                status: 70
                            }
                        })
                        const formhistory = await this.utilsService.formHistoryService.record(returnform.id,70,userId,"Return form is approved by execborrower and waiting for execlender")
                        const form = await this.prismaService.form.findUnique({
                            where:{
                                id: returnform.formId
                            }
                        })
                        const user = await this.prismaService.user.findUnique({
                            where:{
                                id: userId
                            },
                            select: {
                                firstName: true,
                                lastName: true,
                                unit: true,
                                execId: true,
                                id:true,
                            }
                        })
                        const exec = await this.prismaService.user.findUnique({
                            where:{
                                id:user.execId
                            },
                            select:{
                                firstName:true,
                                lastName:true,
                                email:true
                            }
                        })
                        
                        const context = {
                            dateSend: formhistory.date,
                            formId:form.id,
                            borrowDate: format(new Date(form.borrowDate), 'dd-MM-yyyy'),
                            returnDate: format(new Date(form.returnDate), 'dd-MM-yyyy'),
                            project: form.project,
                            unit: user.unit,
                            executor: `${exec.lastName} ${exec.firstName}`,
                            borrower: `${user.lastName} ${user.firstName}`,
                            status: 70
                        };
                        (await this.prismaService.user.findMany({
                            where:{
                                role:3
                            },
                            select:{
                                email:true
                            }
                        })).map(element=>element.email).forEach(element=>{
                            this.mailService.sendEmail(element,"Thông báo có đơn trả",context,'return')
                        })
                        return {
                            status: 200,
                            message: "Successful"
                        }
                    }
                }
                case 3:{
                    if (type==='borrow') {
                        const form = await this.prismaService.form.findUnique({
                            where:{
                                id: body.formId
                            }
                        })
                        if (!form) {
                            return{
                                status: 404,
                                message: "Form not found"
                            }
                        }
                        if (form.status!==20){
                            return{
                                status: 403,
                                message: "Form not at appropriate status for you to approve"
                            }
                        }
                        await this.prismaService.form.update({
                            where:{
                                id: form.id
                            },
                            data:{
                                status: 30
                            }
                        })
                        const formhistory = await this.utilsService.formHistoryService.record(form.id,30,userId,"Form is approved by execlender and waiting for configuration of lender")
                        const user = await this.prismaService.user.findUnique({
                            where:{
                                id: form.userId
                            },
                            select: {
                                firstName: true,
                                lastName: true,
                                unit: true,
                                execId: true,
                                id:true,
                            }
                        })
                        const exec = await this.prismaService.user.findUnique({
                            where:{
                                id:userId
                            },
                            select:{
                                firstName:true,
                                lastName:true,
                                email:true
                            }
                        })
                        const sender = await this.prismaService.user.findUnique({
                            where:{
                                id: userId
                            }
                        })
                        const context = {
                            sender: `${sender.lastName} ${sender.firstName}`,
                            dateSend: formhistory.date,
                            formId:form.id,
                            borrowDate: format(new Date(form.borrowDate), 'dd-MM-yyyy'),
                            returnDate: format(new Date(form.returnDate), 'dd-MM-yyyy'),
                            project: form.project,
                            unit: user.unit,
                            executor: `${exec.lastName} ${exec.firstName}`,
                            borrower: `${user.lastName} ${user.firstName}`,
                            status: 30
                        };
                        (await this.prismaService.user.findMany({
                            where:{
                                role:4
                            },
                            select:{
                                email:true
                            }
                        })).map(element=>element.email).forEach(element=>{
                            this.mailService.sendEmail(element,"Thông báo có đơn mượn",context,'borrow')
                        })
                        return {
                            status: 200,
                            message: "Successful"
                        }
                    }
                    else {
                        const returnform = await this.prismaService.returnForm.findUnique({
                            where:{
                                id: body.formId
                            }
                        })
                        if (!returnform) {
                            return{
                                status: 404,
                                message: "Form not found"
                            }
                        }
                        if (returnform.status!==70){
                            return{
                                status: 403,
                                message: "Form not at appropriate status for you to approve"
                            }
                        }
                        await this.prismaService.returnForm.update({
                            where:{
                                id: returnform.id
                            },
                            data:{
                                status: 80
                            }
                        })
                        const formhistory = await this.utilsService.formHistoryService.record(returnform.id,80,userId,"Return form is approved by execlender and waiting for configuration of lender")
                        const form = await this.prismaService.form.findUnique({
                            where:{
                                id: returnform.formId
                            }
                        })
                        const user = await this.prismaService.user.findUnique({
                            where:{
                                id: userId
                            },
                            select: {
                                firstName: true,
                                lastName: true,
                                unit: true,
                                execId: true,
                                id:true,
                            }
                        })
                        const exec = await this.prismaService.user.findUnique({
                            where:{
                                id:user.execId
                            },
                            select:{
                                firstName:true,
                                lastName:true,
                                email:true
                            }
                        })
                        
                        const context = {
                            dateSend: formhistory.date,
                            formId:form.id,
                            borrowDate: format(new Date(form.borrowDate), 'dd-MM-yyyy'),
                            returnDate: format(new Date(form.returnDate), 'dd-MM-yyyy'),
                            project: form.project,
                            unit: user.unit,
                            executor: `${exec.lastName} ${exec.firstName}`,
                            borrower: `${user.lastName} ${user.firstName}`,
                            status: 80
                        };
                        (await this.prismaService.user.findMany({
                            where:{
                                role:4
                            },
                            select:{
                                email:true
                            }
                        })).map(element=>element.email).forEach(element=>{
                            this.mailService.sendEmail(element,"Thông báo có đơn trả",context,'return')
                        })
                        return {
                            status: 200,
                            message: "Successful"
                        }
                    }
                }
                case 4:{
                    if (type==='borrow') {
                        const form = await this.prismaService.form.findUnique({
                            where:{
                                id: body.formId
                            }
                        })
                        if (!form) {
                            return{
                                status: 404,
                                message: "Form not found"
                            }
                        }
                        if (form.status!==30){
                            return{
                                status: 403,
                                message: "Form not at appropriate status for you to approve"
                            }
                        }
                        await this.prismaService.form.update({
                            where:{
                                id: form.id
                            },
                            data:{
                                status: 40
                            }
                        })
                        const formhistory = await this.utilsService.formHistoryService.record(form.id,40,userId,"Form is request for confirmation of borrower")
                        const user = await this.prismaService.user.findUnique({
                            where:{
                                id: userId
                            },
                            select:{
                                firstName: true,
                                lastName: true
                            }
                        })
                        const borrower = await this.prismaService.user.findUnique({
                            where:{
                                id: form.userId
                            },
                            select: {
                                firstName: true,
                                lastName: true,
                                unit: true,
                                execId: true,
                                id:true,
                                email: true
                            }
                        })
                        const exec = await this.prismaService.user.findUnique({
                            where:{
                                id:borrower.execId
                            },
                            select:{
                                firstName:true,
                                lastName:true,
                                email:true
                            }
                        })
                        const context = {
                            sender:`${user.lastName} ${user.firstName}`,
                            dateSend: formhistory.date,
                            formId:body.formId,
                            borrowDate: format(new Date(form.borrowDate), 'dd-MM-yyyy'),
                            returnDate: format(new Date(form.returnDate), 'dd-MM-yyyy'),
                            project: form.project,
                            unit: borrower.unit,
                            executor: `${exec.lastName} ${exec.firstName}`,
                            borrower: `${borrower.lastName} ${borrower.firstName}`,
                            status: 40
                        }
                        this.mailService.sendEmail(borrower.email,"Thông báo mượn thiết bị đã được cập nhật",context,'borrow')
                    }
                    else {
                        const returnform = await this.prismaService.returnForm.findUnique({
                            where:{
                                id: body.formId
                            }
                        })
                        if (!returnform) {
                            return{
                                status: 404,
                                message: "Form not found"
                            }
                        }
                        if (returnform.status!==80){
                            return{
                                status: 403,
                                message: "Form not at appropriate status for you to approve"
                            }
                        }
                        await this.prismaService.returnForm.update({
                            where:{
                                id: returnform.id
                            },
                            data:{
                                status: 90
                            }
                        })
                        const formhistory = await this.utilsService.formHistoryService.record(returnform.id,90,userId,"Return form is approved by execborrower and waiting for execlender")
                        const form = await this.prismaService.form.findUnique({
                            where:{
                                id: returnform.formId
                            }
                        })
                        const user = await this.prismaService.user.findUnique({
                            where:{
                                id: userId
                            },
                            select:{
                                firstName: true,
                                lastName: true
                            }
                        })
                        const borrower = await this.prismaService.user.findUnique({
                            where:{
                                id: form.userId
                            },
                            select: {
                                firstName: true,
                                lastName: true,
                                unit: true,
                                execId: true,
                                id:true,
                                email: true
                            }
                        })
                        const exec = await this.prismaService.user.findUnique({
                            where:{
                                id:borrower.execId
                            },
                            select:{
                                firstName:true,
                                lastName:true,
                                email:true
                            }
                        })
                        const context = {
                            sender:`${user.lastName} ${user.firstName}`,
                            dateSend: formhistory.date,
                            borrowFormId:form.id,
                            returnFormId:body.formId,
                            borrowDate: format(new Date(form.borrowDate), 'dd-MM-yyyy'),
                            returnDate: format(new Date(form.returnDate), 'dd-MM-yyyy'),
                            project: form.project,
                            unit: borrower.unit,
                            executor: `${exec.lastName} ${exec.firstName}`,
                            borrower: `${borrower.lastName} ${borrower.firstName}`,
                            status: 90
                        }
                        this.mailService.sendEmail(borrower.email,"Thông báo trả thiết bị đã được cập nhật",context,'return')
                        return {
                            status: 200,
                            message: "Successfull"
                        }
                    }
                }
            }
        }catch(error){
            return {
                status: 500,
                message: error
            }
        }
    }
    async reject(type:string,body:FormConfirmDto,jwtToken:string){
        try{
            if (!['borrow','return'].includes(type)){
                return {
                    status: 400,
                    message: "Bad type request"
                }
            }
            const userId = this.jwtService.decode(jwtToken)['userId']
            const role = this.jwtService.decode(jwtToken)['role']
            switch(role) {
                case 1:{
                    if (type==='borrow'){
                        const form = await this.prismaService.form.findUnique({
                            where:{
                                id: body.formId
                            }
                        })
                        if (!form) {
                            return{
                                status: 404,
                                message: "Form not found"
                            }
                        }
                        if (form.status!==40){
                            return{
                                status: 403,
                                message: "Form not at appropriate status for you to approve"
                            }
                        }
                        await this.prismaService.form.update({
                            where:{
                                id: form.id
                            },
                            data:{
                                status: 51
                            }
                        })
                        const formhistory = await this.utilsService.formHistoryService.record(form.id,51,userId,"Form is rejected by borrower and waiting for lender configuration")
                        const user = await this.prismaService.user.findUnique({
                            where:{
                                id: userId
                            },
                            select: {
                                firstName: true,
                                lastName: true,
                                unit: true,
                                execId: true,
                                id:true,
                            }
                        })
                        const exec = await this.prismaService.user.findUnique({
                            where:{
                                id:user.execId
                            },
                            select:{
                                firstName:true,
                                lastName:true,
                                email:true
                            }
                        })
                        const context = {
                            sender:`${user.lastName} ${user.firstName}`,
                            dateSend: formhistory.date,
                            formId:form.id,
                            borrowDate: format(new Date(form.borrowDate), 'dd-MM-yyyy'),
                            returnDate: format(new Date(form.returnDate), 'dd-MM-yyyy'),
                            project: form.project,
                            unit: user.unit,
                            executor: `${exec.lastName} ${exec.firstName}`,
                            borrower: `${user.lastName} ${user.firstName}`,
                            status: 51
                        };
                        (await this.prismaService.user.findMany({
                            where:{
                                role:4
                            },
                            select:{
                                email:true
                            }
                        })).map(element=>element.email).forEach(element=>{
                            this.mailService.sendEmail(element,"Thông báo đơn mượn bị từ chối xác nhận",context,'borrow')
                        })
                        return {
                            status: 200,
                            message: "Successful"
                        }
                    }
                    else {
                        return {
                            status: 400,
                            message: "Bad request: Unable to reject"
                        }
                    }
                }
                case 2:{
                    if (type==='borrow') {
                        const form = await this.prismaService.form.findUnique({
                            where:{
                                id: body.formId
                            }
                        })
                        if (!form) {
                            return{
                                status: 404,
                                message: "Form not found"
                            }
                        }
                        if ([10,31].includes(form.status)){
                            return{
                                status: 403,
                                message: "Form not at appropriate status for you to approve"
                            }
                        }
                        await this.prismaService.form.update({
                            where:{
                                id: form.id
                            },
                            data:{
                                status: 21
                            }
                        })
                        const formhistory = await this.utilsService.formHistoryService.record(form.id,21,userId,"Form is denied by execborrower and may be fixed by borrower")
                        const user = await this.prismaService.user.findUnique({
                            where:{
                                id: form.userId
                            },
                            select: {
                                firstName: true,
                                lastName: true,
                                unit: true,
                                execId: true,
                                id:true,
                                email:true
                            }
                        })
                        const exec = await this.prismaService.user.findUnique({
                            where:{
                                id:userId
                            },
                            select:{
                                firstName:true,
                                lastName:true,
                                email:true
                            }
                        })
                        const context = {
                            sender: `${exec.lastName} ${exec.firstName}`,
                            dateSend: formhistory.date,
                            formId:form.id,
                            borrowDate: format(new Date(form.borrowDate), 'dd-MM-yyyy'),
                            returnDate: format(new Date(form.returnDate), 'dd-MM-yyyy'),
                            project: form.project,
                            unit: user.unit,
                            executor: `${exec.lastName} ${exec.firstName}`,
                            borrower: `${user.lastName} ${user.firstName}`,
                            status: 21
                        };
                        this.mailService.sendEmail(user.email,"Thông báo đơn mượn bị từ chối",context,'borrow')
                        return {
                            status: 200,
                            message: "Successful"
                        }
                    }
                    else {
                        const returnform = await this.prismaService.returnForm.findUnique({
                            where:{
                                id: body.formId
                            }
                        })
                        if (!returnform) {
                            return{
                                status: 404,
                                message: "Form not found"
                            }
                        }
                        if ([60,81].includes(returnform.status)){
                            return{
                                status: 403,
                                message: "Form not at appropriate status for you to approve"
                            }
                        }
                        await this.prismaService.returnForm.update({
                            where:{
                                id: returnform.id
                            },
                            data:{
                                status: 71
                            }
                        })
                        const formhistory = await this.utilsService.formHistoryService.record(returnform.id,71,userId,"Return form is denied by execborrower and may be fixed by borrower")
                        const form = await this.prismaService.form.findUnique({
                            where:{
                                id: returnform.formId
                            }
                        })
                        const user = await this.prismaService.user.findUnique({
                            where:{
                                id: form.userId
                            },
                            select: {
                                firstName: true,
                                lastName: true,
                                unit: true,
                                execId: true,
                                id:true,
                                email:true
                            }
                        })
                        const exec = await this.prismaService.user.findUnique({
                            where:{
                                id:userId
                            },
                            select:{
                                firstName:true,
                                lastName:true,
                                email:true
                            }
                        })
                        const context = {
                            sender: `${exec.lastName} ${exec.firstName}`,
                            dateSend: formhistory.date,
                            borowFormId:form.id,
                            returnFormId:returnform.id,
                            borrowDate: format(new Date(form.borrowDate), 'dd-MM-yyyy'),
                            returnDate: format(new Date(form.returnDate), 'dd-MM-yyyy'),
                            project: form.project,
                            unit: user.unit,
                            executor: `${exec.lastName} ${exec.firstName}`,
                            borrower: `${user.lastName} ${user.firstName}`,
                            status: 71
                        };
                        this.mailService.sendEmail(user.email,"Thông báo đơn mượn bị từ chối",context,'return')
                        return {
                            status: 200,
                            message: "Successful"
                        }
                    }
                }
                case 3:{
                    if (type==='borrow') {
                        const form = await this.prismaService.form.findUnique({
                            where:{
                                id: body.formId
                            }
                        })
                        if (!form) {
                            return{
                                status: 404,
                                message: "Form not found"
                            }
                        }
                        if (form.status!==20){
                            return{
                                status: 403,
                                message: "Form not at appropriate status for you to approve"
                            }
                        }
                        await this.prismaService.form.update({
                            where:{
                                id: form.id
                            },
                            data:{
                                status: 31
                            }
                        })
                        const formhistory = await this.utilsService.formHistoryService.record(form.id,31,userId,"Form is denied by execlender and waiting for denied by execborrower")
                        const user = await this.prismaService.user.findUnique({
                            where:{
                                id: form.userId
                            },
                            select: {
                                firstName: true,
                                lastName: true,
                                unit: true,
                                execId: true,
                                id:true,
                            }
                        })
                        const exec = await this.prismaService.user.findUnique({
                            where:{
                                id:userId
                            },
                            select:{
                                firstName:true,
                                lastName:true,
                                email:true
                            }
                        })
                        const sender = await this.prismaService.user.findUnique({
                            where:{
                                id: userId
                            }
                        })
                        const context = {
                            sender: `${sender.lastName} ${sender.firstName}`,
                            dateSend: formhistory.date,
                            formId:form.id,
                            borrowDate: format(new Date(form.borrowDate), 'dd-MM-yyyy'),
                            returnDate: format(new Date(form.returnDate), 'dd-MM-yyyy'),
                            project: form.project,
                            unit: user.unit,
                            executor: `${exec.lastName} ${exec.firstName}`,
                            borrower: `${user.lastName} ${user.firstName}`,
                            status: 30
                        };
                        this.mailService.sendEmail(exec.email,"Thông báo đơn mượn bị từ chối",context,'borrow')
                        return {
                            status: 200,
                            message: "Successful"
                        }
                    }
                    else {
                        const returnform = await this.prismaService.returnForm.findUnique({
                            where:{
                                id: body.formId
                            }
                        })
                        if (!returnform) {
                            return{
                                status: 404,
                                message: "Form not found"
                            }
                        }
                        if (returnform.status!==70){
                            return{
                                status: 403,
                                message: "Form not at appropriate status for you to approve"
                            }
                        }
                        await this.prismaService.returnForm.update({
                            where:{
                                id: returnform.id
                            },
                            data:{
                                status: 81
                            }
                        })
                        const formhistory = await this.utilsService.formHistoryService.record(returnform.id,81,userId,"Return form is approved by execlender and waiting for configuration of lender")
                        const form = await this.prismaService.form.findUnique({
                            where:{
                                id: returnform.formId
                            }
                        })
                        const user = await this.prismaService.user.findUnique({
                            where:{
                                id: userId
                            },
                            select: {
                                firstName: true,
                                lastName: true,
                                unit: true,
                                execId: true,
                                id:true,
                            }
                        })
                        const exec = await this.prismaService.user.findUnique({
                            where:{
                                id:user.execId
                            },
                            select:{
                                firstName:true,
                                lastName:true,
                                email:true
                            }
                        })
                        
                        const context = {
                            dateSend: formhistory.date,
                            borrowFormId:form.id,
                            returnFormId: returnform.id,
                            borrowDate: format(new Date(form.borrowDate), 'dd-MM-yyyy'),
                            returnDate: format(new Date(form.returnDate), 'dd-MM-yyyy'),
                            project: form.project,
                            unit: user.unit,
                            executor: `${exec.lastName} ${exec.firstName}`,
                            borrower: `${user.lastName} ${user.firstName}`,
                            status: 81
                        };
                        this.mailService.sendEmail(exec.email,"Thông báo đơn trả bị từ chối",context,'return')
                        return {
                            status: 200,
                            message: "Successful"
                        }
                    }
                }
            }
        }catch(error){
            return{
                status: 500,
                message: error
            }
        }
    }
    async cancel(body: FormConfirmDto, jwtToken:string){
        try{
            const userId = this.jwtService.decode(jwtToken)['userId']
            const formlist = await this.prismaService.form.findMany({
                where:{
                    id: body.formId,
                    userId: userId
                }
            })
            if (formlist.length===0) {
                return {
                    status: 404,
                    message: "FormId not found according to userId"
                }
            }
            const form = formlist[0]
            if ([10,21].includes(form.status)) {
                return {
                    status: 403,
                    message: "Form is not at appropriate status to be canceled"
                }
            }
            await this.prismaService.form.update({
                where:{
                    id: form.id
                },
                data:{
                    status: 0
                }
            })
            const formhistory = await this.utilsService.formHistoryService.record(form.id,0,userId,null)
            const user = await this.prismaService.user.findUnique({
                where:{
                    id: userId
                },
                select: {
                    firstName: true,
                    lastName: true,
                    unit: true,
                    execId: true,
                    id:true,
                    email: true
                }
            })
            const exec = await this.prismaService.user.findUnique({
                where:{
                    id:user.execId
                },
                select:{
                    firstName:true,
                    lastName:true,
                    email:true
                }
            })
            const context = {
                dateSend: formhistory.date,
                formId:form.id,
                borrowDate: format(new Date(form.borrowDate), 'dd-MM-yyyy'),
                returnDate: format(new Date(form.returnDate), 'dd-MM-yyyy'),
                project: form.project,
                unit: user.unit,
                executor: `${exec.lastName} ${exec.firstName}`,
                borrower: `${user.lastName} ${user.firstName}`,
                status: 0
            }
            this.mailService.sendEmail(user.email,"Thông báo đon đã bị hủy",context,'borrow confirmation')
            return {
                status: 200,
                message: "Successful"
            }
        }catch(error){
            return{
                status: 500,
                message: error
            }
        }
    }
    async evaluate(body: FormEvaluateDto, jwtToken:string){
        try{
            const userId = this.jwtService.decode(jwtToken)['userId']
            const role = this.jwtService.decode(jwtToken)['role']
            if (role===1){
                const form = await this.prismaService.form.findUnique({
                    where:{
                        id: body.formId
                    }
                })
                if (form.status!==50){
                    return {
                        status: 403,
                        message: "Form is not at appropriate status for you to evaluate"
                    }
                }
                const deviceBorrow = (await this.utilsService.deviceBorrowService.getbyformid(form.id)).map(element=>element.deviceId)
                Object.keys(body.evaluate).forEach(async(element)=>{
                    if (!deviceBorrow.includes(element)) {
                        return {
                            status: 403,
                            message: "Device is not in the form to be able to evaluate"
                        }
                    }
                })
                const evaluateform = await this.prismaService.evaluateForm.create({
                    data:{
                        formId: body.formId,
                        userId: userId,
                        type: false
                    },
                    select:{
                        id: true
                    }
                })
                Object.keys(body.evaluate).forEach(async (element)=>{
                    await this.prismaService.deviceEvaluate.create({
                        data:{
                            evaluateFormId:evaluateform.id,
                            deviceBorrowId:element,
                            status:body.evaluate[element]
                        }
                    })
                })
                await this.prismaService.form.update({
                    where:{
                        id: body.formId
                    },
                    data:{
                        status:55
                    }
                })
                const formhistory = await this.utilsService.formHistoryService.record(body.formId,55,userId,null)
                const user = await this.prismaService.user.findUnique({
                    where:{
                        id: userId
                    },
                    select: {
                        firstName: true,
                        lastName: true,
                        unit: true,
                        execId: true,
                        id:true,
                        email: true
                    }
                })
                const exec = await this.prismaService.user.findUnique({
                    where:{
                        id:user.execId
                    },
                    select:{
                        firstName:true,
                        lastName:true,
                        email:true
                    }
                })
                const context = {
                    dateSend: formhistory.date,
                    formId:form.id,
                    borrowDate: format(new Date(form.borrowDate), 'dd-MM-yyyy'),
                    returnDate: format(new Date(form.returnDate), 'dd-MM-yyyy'),
                    project: form.project,
                    unit: user.unit,
                    executor: `${exec.lastName} ${exec.firstName}`,
                    borrower: `${user.lastName} ${user.firstName}`,
                    status: 55
                }
                this.mailService.sendEmail(user.email,"Thông báo đã xác nhận mượn thiết bị thành công",context,'borrow confirmation')
            }
            else {
                const form = await this.prismaService.returnForm.findUnique({
                    where:{
                        id: body.formId
                    }
                })
                if (form.status!==95){
                    return {
                        status: 403,
                        message: "Form is not at appropriate status for you to evaluate"
                    }
                }
                const deviceBorrow = (await this.utilsService.deviceBorrowService.getbyreturnformid(form.id)).map(element=>element.deviceId)
                Object.keys(body.evaluate).forEach(async(element)=>{
                    if (!deviceBorrow.includes(element)) {
                        return {
                            status: 403,
                            message: "Device is not in the form to be able to evaluate"
                        }
                    }
                })
                const borrow = await this.prismaService.form.findUnique({
                    where:{
                        id: form.formId
                    }
                })
                const evaluateform = await this.prismaService.evaluateForm.create({
                    data:{
                        formId: body.formId,
                        userId: userId,
                        type: true
                    },
                    select:{
                        id: true
                    }
                })
                Object.keys(body.evaluate).forEach(async (element)=>{
                    await this.prismaService.deviceEvaluate.create({
                        data:{
                            evaluateFormId:evaluateform.id,
                            deviceBorrowId:element,
                            status:body.evaluate[element]
                        }
                    })
                })
                await this.prismaService.returnForm.update({
                    where:{
                        id: body.formId
                    },
                    data:{
                        status:100
                    }
                })
                const formhistory = await this.utilsService.formHistoryService.record(body.formId,100,userId,null)
                const user = await this.prismaService.user.findUnique({
                    where:{
                        id: borrow.userId
                    },
                    select: {
                        firstName: true,
                        lastName: true,
                        unit: true,
                        execId: true,
                        id:true,
                        email:true
                    }
                })
                const exec = await this.prismaService.user.findUnique({
                    where:{
                        id:user.execId
                    },
                    select:{
                        firstName:true,
                        lastName:true,
                        email:true
                    }
                })
                const context = {
                    dateSend: formhistory.date,
                    borrowFormId:borrow.id,
                    returnFormId:body.formId,
                    borrowDate: format(new Date(borrow.borrowDate), 'dd-MM-yyyy'),
                    returnDate: format(new Date(borrow.returnDate), 'dd-MM-yyyy'),
                    project: borrow.project,
                    unit: user.unit,
                    executor: `${exec.lastName} ${exec.firstName}`,
                    borrower: `${user.lastName} ${user.firstName}`,
                    status: 100
                }
                this.mailService.sendEmail(user.email,"Thông báo đã xác nhận đơn trả hoàn thành",context,'return confirmation')
                const returneddevice =await (await this.prismaService.returnForm.findMany({
                    where:{
                        formId: borrow.id,
                        status: 100
                    },
                    select:{
                        id: true
                    }
                })).map(element=>element.id).reduce(async (promise,element)=>{
                    const accum = await promise
                    return accum.concat((await this.utilsService.deviceBorrowService.getbyreturnformid(element)).map(element=>element.deviceId))
                },Promise.resolve([]))
                const borroweddevice = (await this.utilsService.deviceBorrowService.getbyformid(borrow.id)).map(element=>element.deviceId)
                if (returneddevice.length===borroweddevice.length) {
                    await this.prismaService.form.update({
                        where:{
                            id: borrow.id
                        },
                        data:{
                            status: 100
                        }
                    })
                }
            }
            return {
                status: 200,
                message: "Successful"
            }
        }catch(error){
            return {
                status:500,
                message: error
            }
        }
    }
    async getdetail(type:string, id:string){
        try{
            if (type==='borrow') {
                const form = await this.prismaService.form.findUnique({
                    where:{
                        id:id
                    }
                })
                if (!form) {
                    return {
                        status: 404,
                        message: "Form not found"
                    }
                }
                const returnform = await this.prismaService.returnForm.findMany({
                    where:{
                        formId: form.id
                    }
                })
                const formhistory = await this.prismaService.formHistory.findMany({
                    where:{
                        formId: form.id
                    }
                })
                const formattach = (await this.prismaService.formAttach.findMany({
                    where:{
                        formId:form.id
                    },
                    select:{
                        id:true
                    }
                })).map(element=>element.id)
                const deviceborrow = await this.prismaService.deviceBorrow.findMany({
                    where:{
                        formId:form.id
                    }
                })
                const evaluateform = await this.prismaService.evaluateForm.findMany({
                    where:{
                        formId:form.id
                    }
                })
                return {
                    status: 200,
                    form: form,
                    returnform: returnform,
                    formhistory: formhistory,
                    formattach: formattach,
                    deviceborrow: deviceborrow,
                    evaluateform: evaluateform
                }
            }
            else if (type==='return') {
                const returnform = await this.prismaService.returnForm.findUnique({
                    where:{
                        id:id
                    }
                })
                const formhistory = await this.prismaService.formHistory.findMany({
                    where:{
                        formId:returnform.id
                    }
                })
                const form = await this.prismaService.form.findUnique({
                    where:{
                        id: returnform.formId
                    }
                })
                const deviceBorrow = await this.prismaService.deviceBorrow.findMany({
                    where:{
                        returnFormId:returnform.id
                    }
                })
                const evaluateform = await this.prismaService.evaluateForm.findMany({
                    where:{
                        formId:returnform.id
                    }
                })
                return {
                    status: 200,
                    returnform: returnform,
                    form: form,
                    formhistory: formhistory,
                    deviceBorrow: deviceBorrow,
                    evaluateform: evaluateform

                }
            }
            else {
                return {
                    status: 400,
                    message: "Bad request"
                }
            }
        }catch(error){
            return {
                status:500,
                message: error
            }
        }
    }
    async getall(jwtToken:string){
        try{
            const userId = this.jwtService.decode(jwtToken)['userId']
            const role = this.jwtService.decode(jwtToken)['role']
            if (role===1){
                return {
                    status: 200,
                    message: await this.prismaService.form.findMany({
                        where:{
                            userId: userId
                        }
                    })
                }
            }
            else if (role===2) {
                return {
                    status: 200,
                    message: await (await this.prismaService.user.findMany({
                        where:{
                            execId: userId
                        },
                        select:{
                            id:true
                        }
                    })).map(element=>element.id).reduce(async(promise,element)=>{
                        const accum = await promise
                        return accum.concat(await this.prismaService.form.findMany({
                            where:{
                                userId:element
                            }
                        }))
                    },Promise.resolve([]))
                }
            }
            else {
                return {
                    status: 200,
                    message: await this.prismaService.form.findMany()
                }
            }
        }catch(error){
            return {
                status:500,
                message: error
            }
        }
    }
    async addattach(body:FormAddAttachDto,attaches: Express.Multer.File[]){
        return await this.utilsService.formAttachService.addattach(body.formId, attaches)
    }
    async deleteattach(body: FormDeleteAttachDto){
        return await this.utilsService.formAttachService.deleteattach(body.id)
    }
    async loadattach(body: FormLoadAttachDto, res: Response){
        return await this.utilsService.formAttachService.loadattach(body.id, res)
    }
}