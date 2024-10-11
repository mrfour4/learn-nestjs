import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { DatabaseModule } from './database/database.module';

import * as Joi from 'joi';

@Module({
    imports: [
        DatabaseModule,
        AuthModule,
        CategoryModule,
        ConfigModule.forRoot({
            validationSchema: Joi.object({
                DATABASE_URL: Joi.string().required(),
                JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
                JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
                JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
                JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
            }),
        }),
    ],
})
export class AppModule {}
