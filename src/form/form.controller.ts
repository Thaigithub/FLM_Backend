import { Controller, Post, UseGuards, Body, Req, Get, Res, UseInterceptors, UploadedFiles, Param } from '@nestjs/common';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FormService } from './form.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/auth.strategy';
import { FormCreateDto, FormConfigDto, FormAddAttachDto, FormDeleteAttachDto, FormLoadAttachDto, FormCreateReturnDto, FormConfigReturnDto, FormConfirmDto, FormEvaluateDto } from './form.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
@ApiTags('Form')
@Controller('form')
export class FormController {
    constructor(
        private formService: FormService
    ){}
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([1]))
    @ApiBody({
        type:FormCreateDto
    })
    @Post('create')
    @UseInterceptors(FilesInterceptor('attaches'))
    async create(@UploadedFiles() attaches: Express.Multer.File[],@Req() req: Request, @Body() body:FormCreateDto, @Res() res: Response){
        const response = await this.formService.create(body,req.headers['authorization'].substring(7), attaches)
        const {status} = response
        delete response.status
        res.status(status).json(response)
    }
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([1,4]))
    @ApiBody({
        type:FormConfigDto
    })
    @Post('config')
    async config(@Body() body: FormConfigDto, @Req() req: Request, @Res() res: Response){
        const response = await this.formService.config(body, req.headers['authorization'].substring(7))
        const {status} = response
        delete response.status
        res.status(status).json(response)
    }
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([1,4]))
    @ApiBody({
        type: FormAddAttachDto
    })
    @Post('addattach')
    @UseInterceptors(FilesInterceptor('attaches'))
    async addattach(@Body() body: FormAddAttachDto,@UploadedFiles() attaches: Express.Multer.File[], @Res() res: Response){
        const response = await this.formService.addattach(body,attaches)
        const {status} = response
        delete response.status
        res.status(status).json(response)
    }
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([1,4]))
    @ApiBody({
        type: FormDeleteAttachDto
    })
    @Post('deleteattach')
    async deleteattach(@Body() body: FormDeleteAttachDto, @Res() res: Response){
        const response = await this.formService.deleteattach(body)
        const {status} = response
        delete response.status
        res.status(status).json(response)
    }
    @UseGuards(AuthGuard('jwt'))
    @ApiBody({
        type: FormLoadAttachDto
    })
    @Post('loadattach')
    async loadattach(@Body() body: FormLoadAttachDto, @Res() res: Response){
        await this.formService.loadattach(body,res)
    }
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([1]))
    @ApiBody({
        type:FormCreateReturnDto
    })
    @Post('createreturn')
    async createreturn(@Req() req: Request, @Body() body:FormCreateReturnDto, @Res() res: Response){
        const response = await this.formService.createreturn(body,req.headers['authorization'].substring(7))
        const {status} = response
        delete response.status
        res.status(status).json(response)
    }
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([1,4]))
    @ApiBody({
        type:FormConfigReturnDto
    })
    @Post('configreturn')
    async configreturn(@Body() body: FormConfigReturnDto, @Req() req: Request, @Res() res: Response){
        const response = await this.formService.configreturn(body, req.headers['authorization'].substring(7))
        const {status} = response
        delete response.status
        res.status(status).json(response)
    }
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([1,2,3,4]))
    @ApiBody({
        type:FormConfirmDto
    })
    @Post('approve/:type')
    async approve(@Res() res: Response, @Body() body: FormConfirmDto, @Req() req: Request,@Param('type') type:string){
        const response = await this.formService.approve(type,body, req.headers['authorization'].substring(7))
        const {status} = response
        delete response.status
        res.status(status).json(response)
    }
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([1,2,3]))
    @ApiBody({
        type:FormConfirmDto
    })
    @Post('reject/:type')
    async reject(@Res() res: Response, @Body() body: FormConfirmDto, @Req() req: Request,@Param('type') type:string){
        const response = await this.formService.reject(type,body, req.headers['authorization'].substring(7))
        const {status} = response
        delete response.status
        res.status(status).json(response)
    }
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([1]))
    @ApiBody({
        type:FormConfirmDto
    })
    @Post('cancel')
    async cancel(@Res() res: Response, @Body() body: FormConfirmDto, @Req() req: Request){
        const response = await this.formService.cancel(body, req.headers['authorization'].substring(7))
        const {status} = response
        delete response.status
        res.status(status).json(response)
    }
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([1,6]))
    @ApiBody({
        type: FormEvaluateDto
    })
    @Post('evaluate/:type')
    async evaluate(@Res() res: Response, @Body() body: FormEvaluateDto, @Req() req: Request){
        const response = await this.formService.evaluate(body, req.headers['authorization'].substring(7))
        const {status} = response
        delete response.status
        res.status(status).json(response)
    }
    @UseGuards(AuthGuard('jwt'))
    @ApiBody({
        type: FormEvaluateDto
    })
    @Get('getall')
    async getall(@Res() res: Response, @Req() req: Request){
        const response = await this.formService.getall(req.headers['authorization'].substring(7))
        const {status} = response
        delete response.status
        res.status(status).json(response.message)
    }
    @UseGuards(AuthGuard('jwt'))
    @Get('detail/:type/:id')
    async getdetail(@Res() res: Response, @Param('type') type:string,  @Param('id') id:string){
        const response = await this.formService.getdetail(type,id)
        const {status} = response
        delete response.status
        res.status(status).json(response)
    }
}   
