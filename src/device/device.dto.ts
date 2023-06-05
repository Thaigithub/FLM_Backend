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
}
export class DeviceImageAddDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    deviceId: string
}
export class DeviceImageDeleteDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    id: string
}