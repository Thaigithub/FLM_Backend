import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { FormCreateDto, FormDetailDto, FormApproveDto, FormRejectDto, FormReturnDto, FormUpdateStatusDto } from './form.dto';
import { MailService } from '../mail/mail.service';
import { format } from 'date-fns';
@Injectable()
export class FormService {
    constructor(
        private prismaService: PrismaService,
        private jwtService: JwtService,
        private mailService: MailService
    ){}
    async create(body:FormCreateDto, jwtToken:string){
        try{
            const userId = await this.jwtService.decode(jwtToken)['userId']
            const role = await this.jwtService.decode(jwtToken)['role']
            if (role===5){
                if (body.userId===null) return {
                    message: "Missing userId"
                }
                const user = await this.prismaService.user.findUnique({
                    where:{
                        id: userId
                    },
                    select: {
                        firstName: true,
                        lastName: true,
                        unit: true,
                        execId: true,
                    }
                })
                if (user===undefined) return {
                    message: "ExecId not found"
                }
            }
            const user = await this.prismaService.user.findUnique({
                where:{
                    id: role===1?userId:body.userId
                },
                select: {
                    firstName: true,
                    lastName: true,
                    unit: true,
                    execId: true,
                    id:true,
                }
            })
            body.devices.map(async (element)=>{
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
                        message:'Device not found'  
                    } 
                }
                if (device.status!==0) {
                    return{
                        message:'Device is not available'  
                    }
                }
            })
            const form = await this.prismaService.form.create({
                data: {
                    borrowDate: body.borrowDate,
                    returnDate: body.returnDate,
                    project: body.project,
                    decision: body.decision,
                    status: 10,
                    userId: user.id
                },
                select: {
                    id: true
                }
            })
            const formhistory = await this.prismaService.formHistory.create({
                data:{
                    formId:form.id,
                    status:10,
                    userId:userId
                },
                select:{
                    date:true
                }
            })
            body.devices.map(async (element)=>{
                await this.prismaService.deviceBorrow.create({
                    data:{
                        formId:form.id,
                        deviceId:element
                    }
                })
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
                borrowDate: format(new Date(body.borrowDate), 'dd-MM-yyyy'),
                returnDate: format(new Date(body.returnDate), 'dd-MM-yyyy'),
                project: body.project,
                unit: user.unit,
                executor: `${exec.lastName} ${exec.firstName}`,
                borrower: `${user.lastName} ${user.firstName}`,
                status: 10
            }
            this.mailService.sendEmail(exec.email,"Thông báo mượn thiết bị",context,'mail.template')
            return {
                message: "Successfull"
            }
        }catch(error){
            console.log(error)
        }
    }
    async getall(jwtToken:string) {
        try{
            const userId = await this.jwtService.decode(jwtToken)['userId']
            const role = await this.jwtService.decode(jwtToken)['role']
            const forms = new Promise(async (resolve)=>{
                if (role === 1) {
                    resolve(await this.prismaService.form.findMany({
                        where:{
                            userId: userId
                        },
                        select:{
                            id: true,
                            borrowDate: true,
                            returnDate: true,
                            project: true,
                            decision: true,
                            status: true,
                            userId: true
                        }
                    }))
                }
                else if (role === 2){
                    const employees = await this.prismaService.user.findMany({
                        where:{
                            execId: userId
                        },
                        select:{
                            id: true
                        }
                    }) 
                    resolve(await employees.reduce(async(promise:Promise<Array<Object>>,element)=>{
                        const array = await promise
                        return array.concat(await this.prismaService.form.findMany({
                            where:{
                                userId:element.id
                            },
                            select:{
                                id: true,
                                borrowDate: true,
                                returnDate: true,
                                project: true,
                                decision: true,
                                status: true,
                                userId: true
                            }
                        }))
                    },Promise.resolve([])))
                }
                else if (role===3){
                    resolve(await this.prismaService.form.findMany({
                        where:{
                            status:{
                                gte:20
                            }
                        },
                        select:{
                            id: true,
                            borrowDate: true,
                            returnDate: true,
                            project: true,
                            decision: true,
                            status: true,
                            userId: true
                        }
                    }))
                }
                else if (role===4){
                    resolve(await this.prismaService.form.findMany({
                        where:{
                            status:{
                                gte:30
                            }
                        },
                        select:{
                            id: true,
                            borrowDate: true,
                            returnDate: true,
                            project: true,
                            decision: true,
                            status: true,
                            userId: true
                        }
                    }))
                }
                else {
                    resolve(await this.prismaService.form.findMany({}))
                }
            })
            return await Promise.resolve(forms.then(async(data:any)=>{
                return await Promise.all(data.map(async (element)=>{
                    const user = await this.prismaService.user.findUnique({
                        where:{
                            id: element.userId
                        },
                        select:{
                            firstName: true,
                            lastName: true,
                            unit: true
                        }
                    })
                    const {id,status,project,decision} = element
                    return {
                        id,
                        status,
                        project,
                        decision,
                        borrowDate: format(new Date(element.borrowDate), 'dd-MM-yyyy'),
                        returnDate: format(new Date(element.returnDate), 'dd-MM-yyyy'),
                        ...user
                    }
                }))
            }))
        }catch(error){
            console.log(error)
        }
    }
    async getdetail(body: FormDetailDto){
        const form = await this.prismaService.form.findUnique({
            where:{
                id:body.formId
            }
        })
        const deviceBorrow = await this.prismaService.deviceBorrow.findMany({
            where:{
                formId: body.formId
            },
            select:{
                deviceId: true
            }
        })
        const devices = await Promise.all( deviceBorrow.map(async (element)=>{
            const device = await this.prismaService.device.findUnique({
                where:{
                    id: element.deviceId
                },
                select:{
                    name: true,
                    status: true
                }
            })
            return {...element,...device}
        }))
        const formHistory = await this.prismaService.formHistory.findMany({
            where:{
                formId:body.formId
            },
            select:{
                date: true,
                status: true
            }
        })
        const history = formHistory.map((element)=>{
            const {status} = element
            return {
                status,
                date: format(new Date(element.date), 'dd-MM-yyyy HH:mm:ss')
            }
        })
        const user = await this.prismaService.user.findUnique({
            where:{
                id: form.userId
            },
            select:{
                lastName: true,
                firstName: true,
                email: true,
                unit: true,
            }
        })
        return {
            ...form,
            ...user,
            history: history,
            devices: devices
        }
    }
    async approve(body: FormApproveDto, jwtToken:string){
        try{
            const userId = await this.jwtService.decode(jwtToken)['userId']
            const role = await this.jwtService.decode(jwtToken)['role']
            const sender = await this.prismaService.user.findUnique({
                where:{
                    id: userId
                },
                select:{
                    lastName: true,
                    firstName: true
                }
            })
            const email = []
            const form = await this.prismaService.form.findUnique({
                where:{
                    id: body.formId
                },
                select:{
                    status:true,
                    userId:true
                }
            })
            if (!form) {
                return {
                    message: "Form not found"
                }
            }
            if(role===2){
                if (![10,50].includes(form.status)) {
                    return {
                        message: "Unauthorize approval"
                    }
                }
                else {
                    const mails = await this.prismaService.user.findMany({
                        where:{
                            role:3
                        },
                        select:{
                            email: true
                        }
                    })
                    email.concat(mails.map((element)=>{
                        return element.email
                    }))
                }
            }
            else if(role===3) {
                if (![20,60].includes(form.status)) {
                    return {
                        message: "Unauthorize approval"
                    }
                }
                else {
                    const deviceborrow = await this.prismaService.deviceBorrow.findMany({
                        where:{
                            formId:body.formId
                        },
                        select:{
                            deviceId:true
                        }
                    })
                    const check = await Promise.all(deviceborrow.map(async(element)=>{
                        const device = await this.prismaService.device.findUnique({
                            where:{
                                id: element.deviceId
                            },
                            select:{
                                status:true
                            }
                        })
                        if (device.status!== (form.status===20?0:2)) {
                            return false
                        }
                        else{
                            return true
                        }
                    }))
                    if (check.includes(false)) {
                        return {
                            message: "Device is not at the right status"
                        }
                    }
                    else{
                        this.prismaService.device.updateMany({
                            where:{
                                id:{
                                    in:deviceborrow.map(element=>element.deviceId)
                                }
                            },
                            data:{
                                status: form.status===20?1:3
                            }
                        })
                        this.prismaService.deviceHistory.createMany({
                            data:deviceborrow.map(element=>{
                                return {
                                    deviceId: element.deviceId,
                                    status: form.status===20?1:3,
                                    formId: body.formId
                                }
                            })
                        })
                        const mails = await this.prismaService.user.findMany({
                            where:{
                                role:4
                            },
                            select:{
                                email: true
                            }
                        })
                        const user = await this.prismaService.user.findUnique({
                            where:{
                                id: form.userId
                            },
                            select:{
                                email:true
                            }
                        })
                        email.concat(mails.map((element)=>{
                            return element.email
                        }))
                        email.concat(user.email)
                    }
                }
            }
            else {
                if (![30,70].includes(form.status)) {
                    return {
                        message: "Unauthorize approval"
                    }
                }
                else {
                    const deviceborrow = await this.prismaService.deviceBorrow.findMany({
                        where:{
                            formId: body.formId
                        },
                        select:{
                            deviceId: true
                        }
                    })
                    this.prismaService.device.updateMany({
                        where:{
                            id:{
                                in:deviceborrow.map(element=>element.deviceId)
                            }
                        },
                        data:{
                            status: form.status===30?2:0
                        }
                    })
                    this.prismaService.deviceHistory.createMany({
                        data:deviceborrow.map(element=>{
                            return {
                                deviceId: element.deviceId,
                                status: form.status===30?2:0,
                                formId: body.formId
                            }
                        })
                    })
                    const mails = await this.prismaService.user.findUnique({
                        where:{
                            id: form.userId
                        },
                        select:{
                            email: true
                        }
                    })
                    email.push(mails.email)
                }
            }
            const newform = await this.prismaService.form.update({
                where:{
                    id: body.formId
                },
                data:{
                    status: form.status+10
                },
                select:{
                    id:true,
                    borrowDate: true,
                    returnDate: true,
                    project: true,
                    userId: true,
                    status: true
                }
            })
            const user = await this.prismaService.user.findUnique({
                where:{
                    id:newform.userId
                },
                select:{
                    lastName:true,
                    firstName: true,
                    unit: true,
                    execId: true
                }
            })
            const exec = await this.prismaService.user.findUnique({
                where:{
                    id:user.execId
                },
                select:{
                    firstName:true,
                    lastName:true,
                }
            })
            const formhistory = await this.prismaService.formHistory.create({
                data:{
                    formId:body.formId,
                    status:newform.status,
                    userId: userId
                },
                select:{
                    date:true,
                    status: true
                }
            })
            const context = {
                dateSend: formhistory.date,
                formId:newform.id,
                sender: `${sender.lastName} ${sender.firstName}`,
                borrowDate: format(new Date(newform.borrowDate), 'dd-MM-yyyy'),
                returnDate: format(new Date(newform.returnDate), 'dd-MM-yyyy'),
                project: newform.project,
                unit: user.unit,
                executor: `${exec.lastName} ${exec.firstName}`,
                borrower: `${user.lastName} ${user.firstName}`,
                status: formhistory.status
            }
            email.map(async(element)=>{
                await this.mailService.sendEmail(element,newform.status<50?"Thông báo mượn thiết bị":"Thông báo trả thiết bị",context,'mail.template')
            })
            return {
                message: "Success"
            }
        }catch(error){
            console.log(error)
        }
    }
    async reject(body: FormRejectDto, jwtToken:string){
        try{
            const userId = await this.jwtService.decode(jwtToken)['userId']
            const role = await this.jwtService.decode(jwtToken)['role']
            const email = []
            const form = await this.prismaService.form.findUnique({
                where:{
                    id: body.formId
                },
                select:{
                    status:true,
                    userId:true
                }
            })
            const sender = await this.prismaService.user.findUnique({
                where:{
                    id: userId
                },
                select:{
                    lastName: true,
                    firstName: true
                }
            })
            if (!form) {
                return {
                    message: "Form not found"
                }
            }
            if(role===2){
                if (![10,50,31,71].includes(form.status)) {
                    return {
                        message: "Unauthorize approval"
                    }
                }
                else {
                    const mails = await this.prismaService.user.findUnique({
                        where:{
                            id: form.userId
                        },
                        select:{
                            email: true
                        }
                    })
                    email.push(mails.email)
                }
            }
            else{
                if (![20,60].includes(form.status)) {
                    return {
                        message: "Unauthorize approval"
                    }
                }
                else {
                    const user = await this.prismaService.user.findUnique({
                        where:{
                            id: form.userId
                        },
                        select:{
                            execId: true
                        }
                    })
                    const exec = await this.prismaService.user.findUnique({
                        where:{
                            id: user.execId
                        },
                        select:{
                            email: true
                        }
                    })
                    email.push(exec.email)
                }
            }
            const newform = await this.prismaService.form.update({
                where:{
                    id: body.formId
                },
                data:{
                    status: [31,71].includes(form.status)?form.status-9:form.status+11
                },
                select:{
                    id:true,
                    borrowDate: true,
                    returnDate: true,
                    project: true,
                    userId: true,
                    status:true
                }
            })
            const user = await this.prismaService.user.findUnique({
                where:{
                    id:newform.userId
                },
                select:{
                    lastName:true,
                    firstName: true,
                    unit: true,
                    execId: true
                }
            })
            const exec = await this.prismaService.user.findUnique({
                where:{
                    id:user.execId
                },
                select:{
                    firstName:true,
                    lastName:true,
                }
            })
            const formhistory = await this.prismaService.formHistory.create({
                data:{
                    formId:body.formId,
                    status:newform.status,
                    userId: userId
                },
                select:{
                    date:true,
                    status: true
                }
            })
            const context = {
                sender: `${sender.lastName} ${sender.firstName}`,
                dateSend: formhistory.date,
                formId:newform.id,
                borrowDate: format(new Date(newform.borrowDate), 'dd-MM-yyyy'),
                returnDate: format(new Date(newform.returnDate), 'dd-MM-yyyy'),
                project: newform.project,
                unit: user.unit,
                executor: `${exec.lastName} ${exec.firstName}`,
                borrower: `${user.lastName} ${user.firstName}`,
                status: formhistory.status
            }
            email.map(async(element)=>{
                await this.mailService.sendEmail(element,newform.status<50?"Thông báo từ chối mượn thiết bị":"Thông báo từ chối trả thiết bị",context,'mail.template')
            })
            return {
                message: "Success"
            }
        }catch(error){
            console.log(error)
        }
    }
    async return(body: FormReturnDto, jwtToken:string){
        try{
            const userId = await this.jwtService.decode(jwtToken)['userId']
            const form = await this.prismaService.form.findUnique({
                where:{
                    id:body.formId
                },
                select: {
                    status: true,
                    userId: true
                }
            })
            if (!form) {
                return {
                    message: "Form not found"
                }
            }
            else if(form.userId!==userId) {
                return {
                    message: "Form is not yours"
                }
            }
            else if(![50,61,62].includes(form.status)) {
                return {
                    message: "Invalid request"
                }
            }
            else{
                const newform = await this.prismaService.form.update({
                    where:{
                        id: body.formId
                    },
                    data:{
                        status: 50
                    },
                    select:{
                        id:true,
                        borrowDate: true,
                        returnDate: true,
                        project: true,
                        status:true
                    }
                })
                const formhistory = await this.prismaService.formHistory.create({
                    data:{
                        formId:body.formId,
                        status:newform.status,
                        userId: userId
                    },
                    select:{
                        date:true,
                        status: true
                    }
                })
                const user = await this.prismaService.user.findUnique({
                    where:{
                        id: userId
                    },
                    select:{
                        lastName: true,
                        firstName: true,
                        unit: true,
                        execId: true
                    }
                })
                const exec = await this.prismaService.user.findUnique({
                    where:{
                        id:user.execId
                    },
                    select:{
                        firstName:true,
                        lastName:true,
                        email: true
                    }
                })
                const context = {
                    sender: `${user.lastName} ${user.firstName}`,
                    dateSend: formhistory.date,
                    formId:newform.id,
                    borrowDate: format(new Date(newform.borrowDate), 'dd-MM-yyyy'),
                    returnDate: format(new Date(newform.returnDate), 'dd-MM-yyyy'),
                    project: newform.project,
                    unit: user.unit,
                    executor: `${exec.lastName} ${exec.firstName}`,
                    borrower: `${user.lastName} ${user.firstName}`,
                    status: formhistory.status
                }
                this.mailService.sendEmail(exec.email,"Thông báo trả thiết bị",context,'mail.template')
            return {
                message: "Successfull"
            }
            }
        }catch(error){
            console.log(error)
        }
    }
    async updatestatus(body:FormUpdateStatusDto,jwtToken:string){
        try {
            const mail = []
            const userId = await this.jwtService.decode(jwtToken)['userId']
            const form = await this.prismaService.form.update({
                where:{
                    id: body.formId
                },
                data:{
                    status: body.status
                },
                select:{
                    id:true,
                    borrowDate: true,
                    returnDate: true,
                    project: true,
                    userId: true,
                }
            })
            const user = await this.prismaService.user.findUnique({
                where:{
                    id: form.userId
                },
                select:{
                    lastName: true,
                    firstName: true,
                    unit: true,
                    execId: true,
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
                    email: true
                }
            })
            const formhistory = await this.prismaService.formHistory.create({
                data:{
                    formId:body.formId,
                    status:body.status,
                    userId: userId
                },
                select:{
                    date:true,
                    status: true
                }
            })
            if ([21,22,30,40,61,62,70,80,90].includes(body.status)) {
                mail.push(user.email)
                if ([30,70].includes(body.status)){
                    const lender = await this.prismaService.user.findMany({
                        where:{
                            role:4
                        },
                        select:{
                            email:true
                        }
                    })
                    mail.concat(lender.map(element=>element.email))
                }
            }
            else if ([10,31,40,50,71,80].includes(body.status)) {
                mail.push(exec.email)
            }
            else if ([20,60].includes(body.status)) {
                const execlender = await this.prismaService.user.findMany({
                    where:{
                        role:3
                    },
                    select:{
                        email:true
                    }
                })
                mail.push(execlender.map(element=>element.email))
            }
        }catch(error){
            console.log(error)
        }
    }
}
