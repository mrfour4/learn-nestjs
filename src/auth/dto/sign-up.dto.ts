import { Type } from 'class-transformer';
import {
    IsEmail,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsPhoneNumber,
    IsString,
    MinLength,
    ValidateNested,
} from 'class-validator';

import { CanBeUndefined } from 'src/utilities/can-be-undefined';

import { AddressDto } from './address-dto';

export class SignUpDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    password: string;

    @IsPhoneNumber('VN')
    @IsOptional()
    phoneNumber?: string;

    @CanBeUndefined()
    @Type(() => AddressDto)
    @IsObject()
    @ValidateNested()
    address?: AddressDto;
}
