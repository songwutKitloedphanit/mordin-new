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

import { CreateResultGradeDto } from './dto/create-result-grade.dto';
import { UpdateResultGradeDto } from './dto/update-result-grade.dto';
import { ResultGradesService } from './result-grades.service';

@Controller('result-grades')
export class ResultGradesController {
  constructor(private readonly resultGradesService: ResultGradesService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createResultGradeDto: CreateResultGradeDto,
    @User('sub') userId: number
  ) {
    return this.resultGradesService.create(createResultGradeDto, userId);
  }

  @Get()
  getLogs() {
    return this.resultGradesService.getLogs();
  }

  @Get()
  findAll() {
    return this.resultGradesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resultGradesService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateResultGradeDto: UpdateResultGradeDto,
    @User('sub') userId: number
  ) {
    return this.resultGradesService.update(+id, updateResultGradeDto, userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resultGradesService.remove(+id);
  }
}
