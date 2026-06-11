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

import { CreateServiceFertilizerMinorDto } from './dto/create-service-fertilizer-minor.dto';
import { UpdateServiceFertilizerMinorDto } from './dto/update-service-fertilizer-minor.dto';
import { ServiceFertilizerMinorsService } from './service-fertilizer-minors.service';

@Controller('service-fertilizer-minors')
export class ServiceFertilizerMinorsController {
  constructor(
    private readonly serviceFertilizerMinorsService: ServiceFertilizerMinorsService
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createServiceFertilizerMinorDto: CreateServiceFertilizerMinorDto,
    @User('sub') userId: number
  ) {
    return this.serviceFertilizerMinorsService.create(
      createServiceFertilizerMinorDto,
      userId
    );
  }

  @Get()
  findAll() {
    return this.serviceFertilizerMinorsService.findAll();
  }

  @Get('/logs')
  getLogs() {
    return this.serviceFertilizerMinorsService.getLogs();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceFertilizerMinorsService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServiceFertilizerMinorDto: UpdateServiceFertilizerMinorDto,
    @User('sub') userId: number
  ) {
    return this.serviceFertilizerMinorsService.update(
      +id,
      updateServiceFertilizerMinorDto,
      userId
    );
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceFertilizerMinorsService.remove(+id);
  }
}
