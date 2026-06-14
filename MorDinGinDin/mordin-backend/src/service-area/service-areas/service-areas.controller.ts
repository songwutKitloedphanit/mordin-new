import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ServiceAreasService } from './service-areas.service';
import { CreateServiceAreaDto } from './dto/create-service-area.dto';
import { UpdateServiceAreaDto } from './dto/update-service-area.dto';
import { User } from 'src/auth/decorators/user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('service-areas')
export class ServiceAreasController {
  constructor(private readonly serviceAreasService: ServiceAreasService) { }
  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createServiceAreaDto: CreateServiceAreaDto,
    @User('sub') userId: number
  ) {
    return this.serviceAreasService.create(createServiceAreaDto, userId);
  }

  @Get()
  findAll() {
    return this.serviceAreasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceAreasService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServiceAreaDto: UpdateServiceAreaDto,
    @User('sub') userId: number
  ) {
    return this.serviceAreasService.update(+id, updateServiceAreaDto, userId);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceAreasService.remove(+id);
  }
  @Get('/log')
  getLogs() {
    return this.serviceAreasService.getLogs();
  }

  @Get('by-factory/:factoryId')
  findByFactoryId(@Param('factoryId', ParseIntPipe) factoryId: number) {
    return this.serviceAreasService.findByFactoryId(factoryId);
  }
}
