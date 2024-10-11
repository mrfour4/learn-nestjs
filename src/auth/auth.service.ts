import { Injectable, NotFoundException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from 'src/users/users.service';

import { LogInDto } from './dto/log-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

import { WrongCredentialsException } from './exception/wrong-credentials';
import { TokenPayload } from './interfaces/token-payload';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async signUp(signUpData: SignUpDto) {
        const hashedPassword = await bcrypt.hash(signUpData.password, 10);
        return this.usersService.create({
            name: signUpData.name,
            email: signUpData.email,
            phoneNumber: signUpData.phoneNumber,
            password: hashedPassword,
            address: signUpData.address,
        });
    }

    async setCurrentRefreshToken(refreshToken: string, userId: number) {
        const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        return this.usersService.update({
            id: userId,
            refreshToken: currentHashedRefreshToken,
        });
    }

    private async verifyPassword(
        plainTextPassword: string,
        hashedPassword: string,
    ) {
        const isPasswordMatching = await bcrypt.compare(
            plainTextPassword,
            hashedPassword,
        );
        if (!isPasswordMatching) {
            throw new WrongCredentialsException();
        }
    }

    private async getUserByEmail(email: string) {
        try {
            return await this.usersService.getByEmail(email);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new WrongCredentialsException();
            }
            throw error;
        }
    }

    async getAuthenticatedUser(logInData: LogInDto) {
        const user = await this.getUserByEmail(logInData.email);
        await this.verifyPassword(logInData.password, user.password);
        return user;
    }

    public getCookieWithJwtAccessToken(userId: number) {
        const payload: TokenPayload = { userId };
        const token = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
            expiresIn: this.configService.get(
                'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
            ),
        });
        return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`;
    }

    public getCookieWithJwtRefreshToken(userId: number) {
        const payload: TokenPayload = { userId };
        const token = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: this.configService.get(
                'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
            ),
        });
        const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}`;
        return {
            cookie,
            token,
        };
    }

    async removeRefreshToken(userId: number) {
        return this.usersService.update({
            id: userId,
            refreshToken: null,
        });
    }

    getCookieForLogOut() {
        return [
            'Authentication=; HttpOnly; Path=/; Max-Age=0',
            'Refresh=; HttpOnly; Path=/; Max-Age=0',
        ];
    }
}
