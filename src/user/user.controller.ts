import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserLogin } from './user.dto';
@Controller('user')
export class UserController {
  constructor(private readonly appService: UserService) {}

  @Post('/login')
  Login(@Body() data:UserLogin) {
    return {
      message: null
    }
  }
}
