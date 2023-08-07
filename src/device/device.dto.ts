import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class DeviceCreateDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    id: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string
}
export class DeviceUpdateDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    id: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    status: number

    @ApiProperty()
    note: string

    
    @ApiProperty()
    formId: string
}
export class DeviceMediaAddDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    deviceId: string
}
export class DeviceMediaDeleteDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    id: string
}