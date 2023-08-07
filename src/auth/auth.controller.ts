import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './auth.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    @ApiBody({
        type: AuthLoginDto
    })
    @Post('login')
    async login(@Body() body:AuthLoginDto, @Res() res: Response) {
        const response = await this.authService.login(body)
        if (response.status===200){
            const {accessToken, role} = response
            res.status(response.status).json({accessToken, role})
        }
        else {
            const {message} = response
            res.status(response.status).json({message})
        }
    }
}
