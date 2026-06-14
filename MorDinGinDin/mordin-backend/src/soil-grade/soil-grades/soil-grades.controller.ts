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
import { SoilGradesService } from './soil-grades.service';
import { CreateSoilGradeDto } from './dto/create-soil-grade.dto';
import { UpdateSoilGradeDto } from './dto/update-soil-grade.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('soil-grades')
export class SoilGradesController {
  constructor(private readonly soilGradesService: SoilGradesService) {}
  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createSoilGradeDto: CreateSoilGradeDto,
    @User('sub') userId: number
  ) {
    return this.soilGradesService.create(createSoilGradeDto, userId);
  }

  @Get()
  findAll() {
    return this.soilGradesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.soilGradesService.findOne(+id);
  }

  @Get('service-type/:id')
  findByServiceTypeId(@Param('id') id: string) {
    return this.soilGradesService.findByServiceTypeId(+id);
  }
  @UseGuards(AuthGuard)
  @Patch()
  update(
    @Body() updateSoilGradeDto: UpdateSoilGradeDto[],
    @User('sub') userId: number
  ) {
    return this.soilGradesService.update(updateSoilGradeDto, userId);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.soilGradesService.remove(+id);
  }

  @Get('/logs')
  getLogs() {
    return this.soilGradesService.getLogs();
  }
}
