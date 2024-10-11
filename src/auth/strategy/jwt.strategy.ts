import { TokenPayload } from '../interfaces/token-payload';

import { Injectable } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';

import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    return request?.cookies?.Authentication;
                },
            ]),
            secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
        });
    }

    async validate(payload: TokenPayload) {
        return this.userService.getById(payload.userId);
    }
}
