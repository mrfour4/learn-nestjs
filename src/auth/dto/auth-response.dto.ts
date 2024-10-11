import { $Enums, Address, User } from '@prisma/client';
import { Exclude, Transform } from 'class-transformer';

export class AuthResponseDto implements User {
    id: number;
    email: string;
    name: string;
    role: $Enums.Role;

    @Transform(({ value: phoneNumber }) => {
        if (!phoneNumber) {
            return null;
        }
        const numberLength = phoneNumber.length;
        const visiblePart = phoneNumber.substring(
            numberLength - 3,
            numberLength,
        );
        return `${'*'.repeat(numberLength - 3)}${visiblePart}`;
    })
    phoneNumber: string | null;

    @Exclude()
    password: string;

    addressId: number;

    address?: Address;

    @Exclude()
    refreshToken: string;
}
