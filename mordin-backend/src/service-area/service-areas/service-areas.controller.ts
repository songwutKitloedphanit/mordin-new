import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  Body,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRoles } from 'src/users/enums/user.enum';
import { MoveServiceAreaDto } from './dto/move-service-area.dto';
import { SupersedeServiceAreaDto } from './dto/supersede-service-area.dto';
import { ServiceAreasService } from './service-areas.service';

@Controller('service-areas')
export class ServiceAreasController {
  constructor(private readonly serviceAreasService: ServiceAreasService) {}

  @Get()
  findAll() {
    return this.serviceAreasService.findAll();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoles.Admin)
  @Get('management')
  findAllManagement() {
    return this.serviceAreasService.findAllManagement();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoles.Admin)
  @Get('logs')
  getLogs() {
    return this.serviceAreasService.getLogs();
  }

  @Get('by-factory/:factoryId')
  findByFactoryId(@Param('factoryId', ParseIntPipe) factoryId: number) {
    return this.serviceAreasService.findByFactoryId(factoryId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviceAreasService.findOne(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoles.Admin)
  @Patch(':id/move')
  move(
    @Param('id', ParseIntPipe) id: number,
    @Body() moveServiceAreaDto: MoveServiceAreaDto,
    @User('sub') userId: number
  ) {
    return this.serviceAreasService.move(id, moveServiceAreaDto, userId);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoles.Admin)
  @Post(':id/supersede')
  supersede(
    @Param('id', ParseIntPipe) id: number,
    @Body() supersedeServiceAreaDto: SupersedeServiceAreaDto,
    @User('sub') userId: number
  ) {
    return this.serviceAreasService.supersede(
      id,
      supersedeServiceAreaDto,
      userId
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRoles.Admin)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @User('sub') userId: number
  ) {
    return this.serviceAreasService.remove(id, userId);
  }
}
