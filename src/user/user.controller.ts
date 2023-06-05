import { Controller, Get, UseGuards, Body, Req, Post } from '@nestjs/common';
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
    @Get('getdetail')
    getdetail(@Req() req: Request){
        return this.userService.getdetail(req.headers['authorization'].substring(7))
    }
    @UseGuards(AuthGuard('jwt'))
    @ApiBody({
        type:UserUpdatedetailDto
    })
    @Post('updatedetail')
    updatedetail(@Req() req: Request, @Body() body: UserUpdatedetailDto ){
        return this.userService.updatedetail(req.headers['authorization'].substring(7),body)
    }
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([5]))
    @ApiBody({
        type:UserRegisterDto
    })
    @Post('register')
    register(@Body() body:UserRegisterDto) {
        return this.userService.register(body)
    }
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([5]))
    @ApiBody({
        type:UserUpdateadminDto
    })
    @Post('updateadmin')
    updateadmin(@Body() body:UserUpdateadminDto) {
        return this.userService.updateadmin(body)
    }
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([5]))
    @Get('getall')
    getall(){
        return this.userService.getall()
    }
}
