import { IsArray, IsISO8601, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class FormCreateDto {
    @ApiProperty()
    @IsISO8601()
    @IsNotEmpty()
    borrowDate: string
    // YYYY-MM-DDTHH:MM:SSZ
    @ApiProperty()
    @IsISO8601()
    @IsNotEmpty()
    returnDate: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    project: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    decision: string

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    devices: Array<string>

    @ApiProperty()
    userId: string
}

export class FormConfigDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    formId: string

    @ApiProperty()
    @IsISO8601()
    @IsNotEmpty()
    borrowDate: string
    // YYYY-MM-DDTHH:MM:SSZ
    @ApiProperty()
    @IsISO8601()
    @IsNotEmpty()
    returnDate: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    project: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    decision: string

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    devices: Array<string>

    @ApiProperty()
    userId: string
}
export class FormAddAttachDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    formId: string
}
export class FormDeleteAttachDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    id: string
}
export class FormLoadAttachDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    id: string
}
export class FormCreateReturnDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    formId:string

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    devices: Array<string>
}
export class FormConfigReturnDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    formId: string

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    devices: Array<string>
}
export class FormConfirmDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    formId: string
}
export class FormEvaluateDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    formId: string

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    evaluate: {[deviceId:string]:boolean}
}