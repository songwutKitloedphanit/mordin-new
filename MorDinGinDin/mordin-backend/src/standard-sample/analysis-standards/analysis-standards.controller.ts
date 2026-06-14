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
import { AnalysisStandardsService } from './analysis-standards.service';
import { CreateAnalysisStandardDto } from './dto/create-analysis-standard.dto';
import { UpdateAnalysisStandardDto } from './dto/update-analysis-standard.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.analysisStandardsService.findOne(+id);
  }

  @Get('calendar/:id')
  async findByCalendar(@Param('id') id: number) {
    return this.analysisStandardsService.findAnalysisStandardByServiceCalendarId(
      +id
    );
  }
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAnalysisStandardDto: UpdateAnalysisStandardDto,
    @User('sub') userId: number
  ) {
    return this.analysisStandardsService.update(
      +id,
      updateAnalysisStandardDto,
      userId
    );
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.analysisStandardsService.remove(+id);
  }
  @Get('/log')
  getLogs() {
    return this.analysisStandardsService.getLogs();
  }
}
