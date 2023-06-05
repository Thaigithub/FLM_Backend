import { Controller, UseGuards, Post, Get, Body, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { DeviceService } from './device.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/auth.strategy';
import { DeviceCreateDto, DeviceImageAddDto, DeviceImageDeleteDto, DeviceUpdateDto } from './device.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { type } from 'os';
@ApiTags('Device')
@Controller('device')
export class DeviceController {
    constructor(private deviceService:DeviceService){}
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([5]))
    @ApiBody({
        type:DeviceCreateDto
    })
    @Post('create')
    @UseInterceptors(FilesInterceptor('medias'))
    create(@UploadedFiles() medias: Express.Multer.File[], @Body() body:DeviceCreateDto){
        return this.deviceService.create(body, medias)
    }
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([5]))
    @ApiBody({
        type:DeviceUpdateDto
    })
    @Post('update')
    update(@Body() body: DeviceUpdateDto){
        return this.deviceService.update(body)
    }
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([5]))
    @ApiBody({
        type:DeviceImageAddDto
    })
    @Post('addmedia')
    @UseInterceptors(FilesInterceptor('medias'))
    addmedia(@UploadedFiles() medias: Express.Multer.File[],@Body() body: DeviceImageAddDto){
        return this.deviceService.addmedia(body,medias)
    }
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([5]))
    @ApiBody({
        type:DeviceImageDeleteDto
    })
    @Post('deletemedia')
    deletemedia(@Body() body: DeviceImageDeleteDto){
        return this.deviceService.deletemedia(body)
    }
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([4,5]))
    @Get('getall')
    getall(){
        return this.deviceService.getall()
    }
    @UseGuards(AuthGuard('jwt'))
    @Get('getavailable')
    getavailable(){
        return this.deviceService.getavailable()
    }
}
