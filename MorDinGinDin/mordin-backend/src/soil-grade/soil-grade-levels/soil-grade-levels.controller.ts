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
import { SoilGradeLevelsService } from './soil-grade-levels.service';
import { CreateSoilGradeLevelDto } from './dto/create-soil-grade-level.dto';
import { UpdateSoilGradeLevelDto } from './dto/update-soil-grade-level.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('soil-grade-levels')
export class SoilGradeLevelsController {
  constructor(
    private readonly soilGradeLevelsService: SoilGradeLevelsService
  ) {}
  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createSoilGradeLevelDto: CreateSoilGradeLevelDto,
    @User('sub') userId: number
  ) {
    return this.soilGradeLevelsService.create(createSoilGradeLevelDto, userId);
  }

  @Get()
  findAll() {
    return this.soilGradeLevelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.soilGradeLevelsService.findOne(+id);
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSoilGradeLevelDto: UpdateSoilGradeLevelDto,
    @User('sub') userId: number
  ) {
    return this.soilGradeLevelsService.update(
      +id,
      updateSoilGradeLevelDto,
      userId
    );
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.soilGradeLevelsService.remove(+id);
  }

  @Get('/logs')
  getLogs() {
    return this.soilGradeLevelsService.getLogs();
  }
}
