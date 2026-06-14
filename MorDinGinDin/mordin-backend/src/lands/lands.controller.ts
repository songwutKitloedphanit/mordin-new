/* eslint-disable prettier/prettier */
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
import { LandsService } from './lands.service';
import { CreateLandDto } from './dto/create-land.dto';
import { UpdateLandDto } from './dto/update-land.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import { UpdateLandByFarmerDto } from './dto/update-land-by-farmer.dto';

@Controller('lands')
export class LandsController {
  constructor(private readonly landsService: LandsService) { }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createLandDto: CreateLandDto, @User('sub') userId: number) {
    return this.landsService.create(createLandDto, userId);
  }

  @Post('by-farmer')
  createByFarmer(@Body() createLandDto: CreateLandDto) {
    return this.landsService.create(createLandDto, null);
  }

  @Get()
  findAll() {
    return this.landsService.findAll();
  }

  @Get('/logs')
  getLogs() {
    return this.landsService.getLogs();
  }

  @Get('/summary')
  getSummary() {
    return this.landsService.getSummary();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.landsService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLandDto: UpdateLandDto, @User('sub') userId: number) {
    return this.landsService.update(+id, updateLandDto, userId);
  }

  @Patch('by-farmer/:landId')
  updateByFarmer(
    @Param('landId', ParseIntPipe) landId: number,
    @Body() updateDto: UpdateLandByFarmerDto,
  ) {
    return this.landsService.updateByFarmer(landId, updateDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.landsService.remove(+id);
  }

  @Get('farmer/:farmerId')
  findByFarmerId(@Param('farmerId') farmerId: number) {
    return this.landsService.findByFarmerId(+farmerId);
  }

  @Delete(':landId/farmer/:farmerId')
  removeByFarmer(
    @Param('landId', ParseIntPipe) landId: number,
    @Param('farmerId', ParseIntPipe) farmerId: number,
  ) {
    return this.landsService.removeByFarmer(landId, farmerId);
  }
}
