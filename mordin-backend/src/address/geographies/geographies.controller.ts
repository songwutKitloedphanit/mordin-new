import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { CreateGeographyDto } from './dto/create-geography.dto';
import { UpdateGeographyDto } from './dto/update-geography.dto';
import { GeographiesService } from './geographies.service';

@Controller('geographies')
export class GeographiesController {
  constructor(private readonly geographiesService: GeographiesService) {}

  @Post()
  create(@Body() createGeographyDto: CreateGeographyDto) {
    return this.geographiesService.create(createGeographyDto);
  }

  @Get()
  findAll() {
    return this.geographiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.geographiesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGeographyDto: UpdateGeographyDto
  ) {
    return this.geographiesService.update(+id, updateGeographyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.geographiesService.remove(+id);
  }
}
