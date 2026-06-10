import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ServiceCategoriesService } from './service-categories.service';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('service-categories')
export class ServiceCategoriesController {
  constructor(
    private readonly serviceCategoriesService: ServiceCategoriesService
  ) {}
  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createServiceCategoryDto: CreateServiceCategoryDto,
    @User('sub') userId: number
  ) {
    return this.serviceCategoriesService.create(
      createServiceCategoryDto,
      userId
    );
  }

  @Get()
  findAll() {
    return this.serviceCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceCategoriesService.findOne(+id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServiceCategoryDto: UpdateServiceCategoryDto,
    @User('sub') userId: number,
  ) {
    return this.serviceCategoriesService.update(+id, updateServiceCategoryDto,userId);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceCategoriesService.remove(+id);
  }
  @Get('/log')
  getLogs() {
    return this.serviceCategoriesService.getLogs();
  }
}
