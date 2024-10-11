import { Role } from '@prisma/client';

import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';

import RoleGuard from 'src/auth/guard/role.guard';
import { CategoryService } from './category.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Get()
    getAll() {
        return this.categoryService.getAll();
    }

    @Get(':id')
    getById(@Param('id', ParseIntPipe) id: number) {
        return this.categoryService.getById(id);
    }

    @UseGuards(RoleGuard([Role.ADMIN]))
    @Post()
    create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoryService.create(createCategoryDto);
    }

    @UseGuards(RoleGuard([Role.ADMIN]))
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() category: UpdateCategoryDto,
    ) {
        return this.categoryService.update(id, category);
    }

    @Delete(':id')
    @UseGuards(RoleGuard([Role.ADMIN]))
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.categoryService.delete(id);
    }
}
