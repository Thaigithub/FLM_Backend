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
    async register(registerdata: UserRegisterDto){
        const hasedPassword = await argon.hash(registerdata.password)
        try {
            if (registerdata.role===1) {
                if (!registerdata.execId) {
                    return{
                        message: "Missing execId"
                    }
                }
                const execId = await this.prismaService.user.findUnique({
                    where:{
                        id: registerdata.execId
                    }
                })
                if (!execId) {
                    return {
                        message: "ExecId not found"
                    }
                }
            }
            await this.prismaService.user.create({
                data: {
                    email: registerdata.email,
                    hashedPassword: hasedPassword,
                    firstName: registerdata.firstName,
                    lastName: registerdata.lastName,
                    unit: registerdata.unit,
                    role: registerdata.role,
                    execId: registerdata.execId
                }
            })
            return {
                message:"Successful"
            }
        }
        catch(error){
            return {
                error: error
            }
        }
        
    }
    async getdetail(jwtToken:string){
        const userId = await this.jwtService.decode(jwtToken)['userId']
        try {
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
            return user
        }
        catch(error) {
            console.log(error)
        }
    }
    async updatedetail(jwtToken:string, data:UserUpdatedetailDto) {
        try{
            const userId = await this.jwtService.decode(jwtToken)['userId']
            if (data.password) {
                const hasedPassword = await argon.hash(data.password)
                await this.prismaService.user.update({
                    where: {
                        id: userId
                    },
                    data: {
                        lastName: data.lastName,
                        firstName:data.firstName,
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
                        lastName: data.lastName,
                        firstName: data.firstName             
                    }
                })
            }
            return {
                message:"Successful"
            }
        }
        catch(error) {
            console.log(error)
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
            return res
        }catch(error) {
            console.log(error)
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
                message:"Successful"
            }
        }catch(error) {
            console.log(error)
        }
    }
}
