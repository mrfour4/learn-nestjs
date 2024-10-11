import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LogInDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
