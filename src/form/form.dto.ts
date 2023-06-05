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
export class FormDetailDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    formId: string
}

export class FormApproveDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    formId: string
}

export class FormRejectDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    formId: string
}

export class FormReturnDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    formId: string
}
export class FormUpdateStatusDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    formId: string

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    status: number
}