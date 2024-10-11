import {
    Body,
    Controller,
    Get,
    HttpCode,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';

import { TransformPlainToInstance } from 'class-transformer';
import { Response } from 'express';
import { RequestWithUser } from './interfaces/request-with-user';

import { AuthService } from './auth.service';

import { AuthResponseDto } from './dto/auth-response.dto';
import { LogInDto } from './dto/log-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

import { JwtAuthenticationGuard } from './guard/jwt-authentication.guard';
import JwtRefreshGuard from './guard/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('sign-up')
    @TransformPlainToInstance(AuthResponseDto)
    signUp(@Body() signUpData: SignUpDto) {
        return this.authService.signUp(signUpData);
    }

    @HttpCode(200)
    @Post('log-in')
    @TransformPlainToInstance(AuthResponseDto)
    async logIn(
        @Body() logInData: LogInDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const user = await this.authService.getAuthenticatedUser(logInData);
        const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
            user.id,
        );
        const { cookie: refreshTokenCookie, token: refreshToken } =
            this.authService.getCookieWithJwtRefreshToken(user.id);

        await this.authService.setCurrentRefreshToken(refreshToken, user.id);

        response.setHeader('Set-Cookie', [
            accessTokenCookie,
            refreshTokenCookie,
        ]);
        return user;
    }

    @UseGuards(JwtAuthenticationGuard)
    @HttpCode(200)
    @Post('log-out')
    async logOut(
        @Req() request: RequestWithUser,
        @Res({ passthrough: true }) response: Response,
    ) {
        await this.authService.removeRefreshToken(request.user.id);

        const cookie = this.authService.getCookieForLogOut();
        response.setHeader('Set-Cookie', cookie);
    }

    @UseGuards(JwtRefreshGuard)
    @Get('refresh')
    @TransformPlainToInstance(AuthResponseDto)
    refresh(@Req() request: RequestWithUser) {
        const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
            request.user.id,
        );

        request.res.setHeader('Set-Cookie', accessTokenCookie);
        return request.user;
    }

    @UseGuards(JwtAuthenticationGuard)
    @Get()
    @TransformPlainToInstance(AuthResponseDto)
    authenticate(@Req() request: RequestWithUser) {
        return request.user;
    }
}
