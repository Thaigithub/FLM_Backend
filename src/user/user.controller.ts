import { Controller, Get, UseGuards, Body, Req, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport'
import { UserService } from './user.service';
import { UserUpdateadminDto, UserUpdatedetailDto, UserRegisterDto, UserIdDto } from './user.dto';
import { RolesGuard } from '../auth/auth.strategy';
import { ApiBody, ApiTags } from '@nestjs/swagger';
@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private userService:UserService){}

    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([5]))
    @ApiBody({
        type:UserRegisterDto
    })
    @Post('register')
    async register(@Body() body:UserRegisterDto, @Res() res: Response) {
        const response = await this.userService.register(body)
        const {message} = response
        res.status(response.status).json(message)
        
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('getdetail')
    async getdetail(@Req() req: Request, @Res() res: Response){
        const response = await this.userService.getdetail(req.headers['authorization'].substring(7))
        const {status} = response
        delete response.status
        res.status(status).json(response)
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBody({
        type:UserUpdatedetailDto
    })
    @Post('updatedetail')
    async updatedetail(@Req() req: Request, @Body() body: UserUpdatedetailDto, @Res() res: Response){
        const response = await this.userService.updatedetail(req.headers['authorization'].substring(7),body)
        const {status} = response
        delete response.status
        res.status(status).json(response)
    }

    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([5]))
    @ApiBody({
        type:UserUpdateadminDto
    })
    @Post('updateadmin')
    async updateadmin(@Body() body:UserUpdateadminDto, @Res() res: Response) {
        const response = await this.userService.updateadmin(body)
        const {status} = response
        delete response.status
        res.status(status).json(response)
    }

    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([5]))
    @Get('getall')
    async getall(@Res() res: Response){
        const response = await this.userService.getall()
        const {status} = response
        delete response.status
        res.status(status).json(response)
    }
}
