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
import { ServiceTypesService } from './service-types.service';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';
import { ServiceTypesSummaryDTO } from './dto/service-types-summary.dto';
import { ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('service-types')
export class ServiceTypesController {
  constructor(private readonly serviceTypesService: ServiceTypesService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createServiceTypeDto: CreateServiceTypeDto,
    @User('sub') userId: number
  ) {
    return this.serviceTypesService.create(createServiceTypeDto, userId);
  }

  @Get()
  findAll() {
    return this.serviceTypesService.findAll();
  }

  @Get('fertilizer-usages')
  findWithFertilizerUsages() {
    return this.serviceTypesService.findWithFertilizerUsages();
  }

  @Get('fertilizer-usages/soil-grade/:id')
  findForSoilGradeEdit(@Param('id', ParseIntPipe) id: number) {
    return this.serviceTypesService.findOneForSoilGradeEdit(id);
  }

  @Get('fertilizer-usages/:id')
  findWithFertilizerUsagesById(@Param('id', ParseIntPipe) id: number) {
    return this.serviceTypesService.findOneWithFertilizerUsages(id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceTypeDto: UpdateServiceTypeDto,
    @User('sub') userId: number
  ) {
    return this.serviceTypesService.update(id, updateServiceTypeDto, userId);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serviceTypesService.remove(id);
  }

  @Get('/summary')
  async getSummary(): Promise<ServiceTypesSummaryDTO> {
    return this.serviceTypesService.getSummary();
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviceTypesService.findOne(id);
  }
  @Get('/log')
  getLogs() {
    return this.serviceTypesService.getLogs();
  }
}
