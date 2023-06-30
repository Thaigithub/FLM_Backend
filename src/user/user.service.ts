import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2'
import { UserUpdateadminDto, UserUpdatedetailDto, UserRegisterDto } from './user.dto';
@Injectable()
export class UserService {
    constructor(
        private prismaService: PrismaService,
        private jwtService: JwtService,
    ) {}
    async register(body: UserRegisterDto){
        try {
            if (body.role===1) {
                if (!body.execId) {
                    return{
                        status: 409,
                        message: "Missing execId"
                    }
                }
                const execId = await this.prismaService.user.findUnique({
                    where:{
                        id: body.execId
                    }
                })
                if (!execId) {
                    return {
                        status: 409,
                        message: "ExecId not found"
                    }
                }
            }
            const user = await this.prismaService.user.findUnique({
                where:{
                    email: body.email
                }
            })
            if (user) {
                return {
                    status: 409,
                    message: "Email existed"
                }
            }
            const hasedPassword = await argon.hash(body.password)
            await this.prismaService.user.create({
                data: {
                    email: body.email,
                    hashedPassword: hasedPassword,
                    firstName: body.firstName,
                    lastName: body.lastName,
                    unit: body.unit,
                    role: body.role,
                    execId: body.execId
                }
            })
            return {
                status: 201,
                message:"Successful"
            }
        }
        catch(error){
            return {
                status: 500,
                message:error
            }
        }
        
    }
    async getdetail(jwtToken:string){
        try {
            const userId = this.jwtService.decode(jwtToken)['userId']
            const user = await this.prismaService.user.findUnique({
                where:{
                    id: userId
                },
                select: {
                    email: true,
                    firstName: true,
                    lastName: true,
                    unit: true,
                    role:true
                }
            })
            return {
                status: 200, 
                ...user
            }
        }
        catch(error) {
            return {
                status: 500,
                message: error
            }
        }
    }
    async updatedetail(jwtToken:string, body:UserUpdatedetailDto) {
        try{
            const userId = await this.jwtService.decode(jwtToken)['userId']
            if (body.password) {
                const hasedPassword = await argon.hash(body.password)
                await this.prismaService.user.update({
                    where: {
                        id: userId
                    },
                    data: {
                        lastName: body.lastName,
                        firstName:body.firstName,
                        hashedPassword: hasedPassword                
                    }
                })
            }
            else {
                await this.prismaService.user.update({
                    where: {
                        id: userId
                    },
                    data: {
                        lastName: body.lastName,
                        firstName: body.firstName             
                    }
                })
            }
            return {
                status: 200,
                message:"Successful"
            }
        }
        catch(error) {
            return {
                status: 500,
                message: error
            }
        }
    }
    async getall () {
        try{
            const listuser = await this.prismaService.user.findMany({
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    unit: true,
                    role: true,
                    execId: true
                }
            })
            const res = await listuser.reduce(async(promise:Promise<Array<Object>>,element)=> {
                const array = await promise
                if (element.execId !==null) {
                    const exec = await this.prismaService.user.findUnique({
                        where:{
                            id:element['execId']
                        },
                        select: {
                            lastName:true,
                            firstName: true
                        }
                    })
                    array.push({
                        ...element,
                        'execLastName':exec.lastName,
                        'execFirstName':exec.firstName
                    })
                }
                else {
                    array.push({
                        ...element,
                        'execLastName':null,
                        'execFirstName':null
                    })
                }
                return array
            },Promise.resolve([]))
            return {
                status: 200,
                message: res
            }
        }catch(error) {
            return {
                status: 500,
                message: error
            }
        }
    }
    async updateadmin(data: UserUpdateadminDto) {
        try {
            if (data.password===null) {
                await this.prismaService.user.update({
                    where: {
                        id: data.userId
                    },
                    data: {
                        lastName: data.lastName,
                        firstName: data.firstName,
                        email: data.email,
                        unit: data.unit,
                        role: data.role,
                        execId: data.execId,
                        disable: data.disable
                    }
                })
            }else{
                const hasedPassword = await argon.hash(data.password)
                await this.prismaService.user.update({
                    where: {
                        id: data.userId
                    },
                    data: {
                        lastName: data.lastName,
                        firstName: data.firstName,
                        email: data.email,
                        unit: data.unit,
                        role: data.role,
                        execId: data.execId,
                        disable: data.disable,
                        hashedPassword: hasedPassword
                    }
                })
            }
            return {
                status: 200,
                message:"Successful"
            }
        }catch(error) {
            return {
                status: 500,
                message: error
            }
        }
    }
}
