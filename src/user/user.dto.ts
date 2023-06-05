import { IsEmail, IsNotEmpty, IsNumber, IsString, IsBoolean } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
export class UserIdDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    userId: string
}

export class UserUpdatedetailDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    lastName: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    firstName: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password: string
}

export class UserUpdateadminDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    userId: string 

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    lastName: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    firstName: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    unit: string

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    role: number

    @ApiProperty()
    execId: string

    @ApiProperty()
    password: string

    @ApiProperty()
    @IsBoolean()
    @IsNotEmpty()
    disable: boolean
}

export class UserRegisterDto {
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    firstName: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    lastName: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    unit: string

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    role: number

    @ApiProperty()
    execId: string
}