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

import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UnitsService } from './units.service';

@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createUnitDto: CreateUnitDto, @User('sub') userId: number) {
    return this.unitsService.create(createUnitDto, userId);
  }

  @Get('/logs')
  getLogs() {
    return this.unitsService.getLogs();
  }

  @Get()
  findAll() {
    return this.unitsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unitsService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUnitDto: UpdateUnitDto,
    @User('sub') userId: number
  ) {
    return this.unitsService.update(+id, updateUnitDto, userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.unitsService.remove(+id);
  }
}
