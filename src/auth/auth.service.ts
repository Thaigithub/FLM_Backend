import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthLoginDto } from './auth.dto';
import * as argon from 'argon2'
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
    constructor(
        private prismaService: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) {}
    async login(logindata: AuthLoginDto){
        try {
            const user = await this.prismaService.user.findUnique({
                where: {
                    email: logindata.email
                },
                select: {
                    id: true,
                    hashedPassword: true,
                    role: true,
                    disable: true,
                }
            })
            if(!user) {
                return {
                    message: "User not found"
                }
            }
            if(user.disable) {
                return {
                    message: "User is disabled"
                }
            }
            const passwordMatched = await argon.verify(user.hashedPassword, logindata.password)
            if (!passwordMatched) {
                return {
                    message: "Wrong password"
                }
            }
            const jwtToken = await this.jwtService.signAsync({
                userId: user.id,
                role: user.role
            },{
                expiresIn: '8h',
                secret: this.configService.get('JWT_SECRET')
            })
            return {
                accessToken: jwtToken,
                role: user.role
            }
        }
        catch(error) {
            console.log(error)
        }
    }
}
