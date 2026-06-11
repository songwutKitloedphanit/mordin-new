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

import { CreateResultGradeLevelDto } from './dto/create-result-grade-level.dto';
import { UpdateResultGradeLevelDto } from './dto/update-result-grade-level.dto';
import { ResultGradeLevelsService } from './result-grade-levels.service';

@Controller('result-grade-levels')
export class ResultGradeLevelsController {
  constructor(
    private readonly resultGradeLevelsService: ResultGradeLevelsService
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createResultGradeLevelDto: CreateResultGradeLevelDto,
    @User('sub') userId: number
  ) {
    return this.resultGradeLevelsService.create(
      createResultGradeLevelDto,
      userId
    );
  }

  @Get('/logs')
  getLogs() {
    return this.resultGradeLevelsService.getLogs();
  }

  @Get()
  findAll() {
    return this.resultGradeLevelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resultGradeLevelsService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateResultGradeLevelDto: UpdateResultGradeLevelDto,
    @User('sub') userId: number
  ) {
    return this.resultGradeLevelsService.update(
      +id,
      updateResultGradeLevelDto,
      userId
    );
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resultGradeLevelsService.remove(+id);
  }
}
