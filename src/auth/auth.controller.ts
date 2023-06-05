import { Controller, Post, Body } from '@nestjs/common';
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
    login(@Body() body:AuthLoginDto) {
        return this.authService.login(body)
    }
}
