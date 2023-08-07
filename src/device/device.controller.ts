import { Controller, UseGuards, Post, Get, Body, UseInterceptors, UploadedFiles, Res, Param } from '@nestjs/common';
import { Response } from 'express';
import { DeviceService } from './device.service';
import { UtilsService } from '../utils/utils.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/auth.strategy';
import { DeviceCreateDto, DeviceMediaAddDto, DeviceMediaDeleteDto, DeviceUpdateDto } from './device.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiTags } from '@nestjs/swagger';
@ApiTags('Device')
@Controller('device')
export class DeviceController {
    constructor(
        private deviceService:DeviceService
    ){}
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([5]))
    @ApiBody({
        type:DeviceCreateDto
    })
    @Post('create')
    @UseInterceptors(FilesInterceptor('medias'))
    async create(@UploadedFiles() medias: Express.Multer.File[], @Body() body:DeviceCreateDto, @Res() res: Response){
        const response = await this.deviceService.create(body, medias)
        const {status} = response
        delete response.status
        res.status(status).json(response)
    }

    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([5]))
    @ApiBody({
        type:DeviceUpdateDto
    })
    @Post('update')
    async update(@Body() body: DeviceUpdateDto, @Res() res: Response){
        const response = await this.deviceService.update(body)
        const {status} = response
        delete response.status
        res.status(status).json(response)
    }

    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([5]))
    @ApiBody({
        type:DeviceMediaAddDto
    })
    @Post('addmedia')
    @UseInterceptors(FilesInterceptor('medias'))
    async addmedia(@UploadedFiles() medias: Express.Multer.File[],@Body() body: DeviceMediaAddDto, @Res() res: Response){
        const response = await this.deviceService.addmedia(medias, body)
        const {status} = response
        delete response.status
        res.status(status).json(response)
    }
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([5]))
    @ApiBody({
        type:DeviceMediaDeleteDto
    })
    @Post('deletemedia')
    async deletemedia(@Body() body: DeviceMediaDeleteDto, @Res() res: Response){
        const response = await this.deviceService.deletemedia(body)
        const {status} = response
        delete response.status
        res.status(status).json(response)
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('getall')
    async getall(@Res() res: Response){
        const response = await this.deviceService.getall()
        if (response.status===200) {
            res.status(response.status).json(response.data)
        }
        else {
            res.status(response.status).json(response.message)
        }
    }

    @Get('getdetail/:id')
    async getdetail(@Res() res: Response, @Param('id') id:string){
        const response = await this.deviceService.getdetail(id)
        if (response.status===200){
            const {status, device} = response
            delete response.status
            delete response.device
            res.status(status).json({...response,...device})
        }
        else {
            res.status(response.status).json(response.message)
        }
    }
    @UseGuards(AuthGuard('jwt'))
    @Get('loadmedia/:id')
    async loadmedia(@Res() res: Response, @Param('id') id:string){
        await this.deviceService.loadmedia(id, res)
    }
}
