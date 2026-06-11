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

import { CreateServiceFertilizerMajorUsageDto } from './dto/create-service-fertilizer-major-usage.dto';
import { UpdateServiceFertilizerMajorUsageDto } from './dto/update-service-fertilizer-major-usage.dto';
import { ServiceFertilizerMajorUsagesService } from './service-fertilizer-major-usages.service';

@Controller('service-fertilizer-major-usages')
export class ServiceFertilizerMajorUsagesController {
  constructor(
    private readonly serviceFertilizerMajorUsageService: ServiceFertilizerMajorUsagesService
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body()
    createServiceFertilizerMajorUsageDto: CreateServiceFertilizerMajorUsageDto,
    @User('sub') userId: number
  ) {
    return this.serviceFertilizerMajorUsageService.create(
      createServiceFertilizerMajorUsageDto,
      userId
    );
  }

  @Get()
  findAll() {
    return this.serviceFertilizerMajorUsageService.findAll();
  }

  @Get('/logs')
  getLogs() {
    return this.serviceFertilizerMajorUsageService.getLogs();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceFertilizerMajorUsageService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch()
  update(
    @Body()
    updateServiceFertilizerMajorUsageDto: UpdateServiceFertilizerMajorUsageDto[],
    @User('sub') userId: number
  ) {
    return this.serviceFertilizerMajorUsageService.update(
      updateServiceFertilizerMajorUsageDto,
      userId
    );
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceFertilizerMajorUsageService.remove(+id);
  }
}
