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
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRoles } from 'src/users/enums/user.enum';

import { CreateFactoryDto } from './dto/create-factory.dto';
import { UpdateFactoryDto } from './dto/update-factory.dto';
import { FactoriesService } from './factories.service';

@Controller('factories')
export class FactoriesController {
  constructor(private readonly factoriesService: FactoriesService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoles.Admin)
  @Post()
  create(
    @Body() createFactoryDto: CreateFactoryDto,
    @User('sub') userId: number
  ) {
    return this.factoriesService.create(createFactoryDto, userId);
  }

  @Get()
  findAll() {
    return this.factoriesService.findAll();
  }

  @Get('summary')
  getSummary() {
    return this.factoriesService.getSummary();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoles.Admin)
  @Get('management')
  findAllManagement() {
    return this.factoriesService.findAllManagement();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoles.Admin)
  @Get('management/:id')
  findOneManagement(@Param('id', ParseIntPipe) id: number) {
    return this.factoriesService.findOneManagement(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoles.Admin)
  @Get('logs')
  getLogs() {
    return this.factoriesService.getLogs();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.factoriesService.findOne(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoles.Admin)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFactoryDto: UpdateFactoryDto,
    @User('sub') userId: number
  ) {
    return this.factoriesService.update(id, updateFactoryDto, userId);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoles.Admin)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @User('sub') userId: number) {
    return this.factoriesService.remove(id, userId);
  }
}
