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
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

import { CreateServiceLaboratoryDto } from './dto/create-service-laboratory.dto';
import { UpdateServiceLaboratoryDto } from './dto/update-service-laboratory.dto';
import { ServiceLaboratoriesService } from './service-laboratories.service';

@Controller('service-laboratories')
export class ServiceLaboratoriesController {
  constructor(
    private readonly serviceLaboratoriesService: ServiceLaboratoriesService
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createServiceLaboratoryDto: CreateServiceLaboratoryDto,
    @User('sub') userId: number
  ) {
    return this.serviceLaboratoriesService.create(
      createServiceLaboratoryDto,
      userId
    );
  }

  @Get()
  findAll() {
    return this.serviceLaboratoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceLaboratoriesService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServiceLaboratoryDto: UpdateServiceLaboratoryDto,
    @User('sub') userId: number
  ) {
    return this.serviceLaboratoriesService.update(
      +id,
      updateServiceLaboratoryDto,
      userId
    );
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceLaboratoriesService.remove(+id);
  }

  @Get('/log')
  getLogs() {
    return this.serviceLaboratoriesService.getLogs();
  }
}
