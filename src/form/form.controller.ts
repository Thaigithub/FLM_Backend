import { Controller, Post, UseGuards, Body, Req, Get } from '@nestjs/common';
import { FormService } from './form.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/auth.strategy';
import { FormCreateDto, FormDetailDto, FormApproveDto, FormRejectDto, FormReturnDto, FormUpdateStatusDto } from './form.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
@ApiTags('Form')
@Controller('form')
export class FormController {
    constructor(private formService: FormService){}
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([1,5]))
    @ApiBody({
        type:FormCreateDto
    })
    @Post('create')
    create(@Req() req: Request, @Body() body:FormCreateDto){
        return this.formService.create(body,req.headers['authorization'].substring(7))
    }
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([1]))
    @ApiBody({
        type:FormReturnDto
    })
    @Post('return')
    return(@Req() req: Request, @Body() body:FormReturnDto){
        return this.formService.return(body,req.headers['authorization'].substring(7))
    }
    @UseGuards(AuthGuard('jwt'))
    @Get('getall')
    getall(@Req() req: Request){
        return this.formService.getall(req.headers['authorization'].substring(7))
    }
    @UseGuards(AuthGuard('jwt'))
    @ApiBody({
        type:FormDetailDto
    })
    @Get('getdetail')
    getdetail(@Body() body:FormDetailDto) {
        return this.formService.getdetail(body)
    }
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([5]))
    @ApiBody({
        type:FormUpdateStatusDto
    })
    @Post('updatestatus')
    update(@Req() req: Request,@Body() body:FormUpdateStatusDto) {
        return this.formService.updatestatus(body,req.headers['authorization'].substring(7))
    }
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([2,3,4]))
    @ApiBody({
        type:FormApproveDto
    })
    @Post('approve')
    approve(@Req() req: Request,@Body() body:FormApproveDto) {
        return this.formService.approve(body, req.headers['authorization'].substring(7))
    }
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(new RolesGuard([2,3]))
    @ApiBody({
        type:FormRejectDto
    })
    @Post('reject')
    reject(@Req() req: Request,@Body() body:FormRejectDto) {
        return this.formService.reject(body, req.headers['authorization'].substring(7))
    }
}
