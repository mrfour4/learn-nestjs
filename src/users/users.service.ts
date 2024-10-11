import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { PrismaError } from 'src/database/prisma-error.enum';

import { PrismaService } from 'src/database/prisma.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private readonly prismaService: PrismaService) {}

    async getByEmail(email: string) {
        const user = await this.prismaService.user.findUnique({
            where: {
                email,
            },
            include: {
                address: true,
            },
        });
        if (!user) {
            throw new NotFoundException();
        }

        return user;
    }

    async getById(id: number) {
        const user = await this.prismaService.user.findUnique({
            where: {
                id,
            },
            include: {
                address: true,
            },
        });
        if (!user) {
            throw new NotFoundException();
        }

        return user;
    }

    async getUserIfRefreshTokenMatches(refreshToken: string, userId: number) {
        const user = await this.getById(userId);

        const isRefreshTokenMatching = await bcrypt.compare(
            refreshToken,
            user.refreshToken,
        );

        if (isRefreshTokenMatching) {
            return user;
        }
    }

    async create(user: CreateUserDto) {
        try {
            return await this.prismaService.user.create({
                data: {
                    name: user.name,
                    email: user.email,
                    password: user.password,
                    phoneNumber: user.phoneNumber,
                    address: {
                        create: user.address,
                    },
                },
                include: {
                    address: true,
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error?.code === PrismaError.UniqueConstraintFailed
            ) {
                throw new ConflictException(
                    'User with that email already exists',
                );
            }
            throw error;
        }
    }

    async update(user: UpdateUserDto) {
        try {
            return await this.prismaService.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    name: user.name,
                    email: user.email,
                    password: user.password,
                    phoneNumber: user.phoneNumber,
                    refreshToken: user.refreshToken,
                    address: {
                        create: user.address,
                    },
                },
                include: {
                    address: true,
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error?.code === PrismaError.UniqueConstraintFailed
            ) {
                throw new ConflictException(
                    'User with that email already exists',
                );
            }
            throw error;
        }
    }
}
