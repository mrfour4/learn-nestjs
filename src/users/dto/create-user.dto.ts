export class CreateUserDto {
    email: string;
    name: string;
    password: string;
    refreshToken?: string;
    phoneNumber?: string;
    address?: {
        street: string;
        city: string;
        country: string;
    };
}
