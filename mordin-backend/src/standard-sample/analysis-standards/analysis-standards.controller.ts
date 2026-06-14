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

import { AnalysisStandardsService } from './analysis-standards.service';
import { CreateAnalysisStandardDto } from './dto/create-analysis-standard.dto';
import { UpdateAnalysisStandardRepeatDto } from './dto/update-analysis-standard-repeat.dto';

@Controller('analysis-standards')
export class AnalysisStandardsController {
  constructor(
    private readonly analysisStandardsService: AnalysisStandardsService
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createAnalysisStandardDto: CreateAnalysisStandardDto,
    @User('sub') userId: number
  ) {
    return this.analysisStandardsService.create(
      createAnalysisStandardDto,
      userId
    );
  }

  @Get()
  findAll() {
    return this.analysisStandardsService.findAll();
  }

  @Get('calendar/:id')
  async findByCalendar(@Param('id') id: number) {
    return this.analysisStandardsService.findAnalysisStandardByServiceCalendarId(
      +id
    );
  }

  @Get('/log')
  getLogs() {
    return this.analysisStandardsService.getLogs();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.analysisStandardsService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAnalysisStandardRepeatDto: UpdateAnalysisStandardRepeatDto,
    @User('sub') userId: number
  ) {
    return this.analysisStandardsService.update(
      +id,
      updateAnalysisStandardRepeatDto,
      userId
    );
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @User('sub') userId: number) {
    return this.analysisStandardsService.remove(+id, userId);
  }
}
