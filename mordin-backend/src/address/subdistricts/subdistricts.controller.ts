import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { CreateSubdistrictDto } from './dto/create-subdistrict.dto';
import { UpdateSubdistrictDto } from './dto/update-subdistrict.dto';
import { SubdistrictsService } from './subdistricts.service';

@Controller('subdistricts')
export class SubdistrictsController {
  constructor(private readonly subdistrictsService: SubdistrictsService) {}

  @Post()
  create(@Body() createSubdistrictDto: CreateSubdistrictDto) {
    return this.subdistrictsService.create(createSubdistrictDto);
  }

  @Get()
  findAll() {
    return this.subdistrictsService.findAll();
  }

  @Get('by-district/:districtCode')
  getSubdistrictsByDistrictCode(@Param('districtCode') districtCode: number) {
    return this.subdistrictsService.getSubdistrictsByDistrictCode(
      +districtCode
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subdistrictsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubdistrictDto: UpdateSubdistrictDto
  ) {
    return this.subdistrictsService.update(+id, updateSubdistrictDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subdistrictsService.remove(+id);
  }
}
