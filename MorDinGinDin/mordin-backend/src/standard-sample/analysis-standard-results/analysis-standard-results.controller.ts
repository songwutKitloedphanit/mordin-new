import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AnalysisStandardResultsService } from './analysis-standard-results.service';
import { CreateAnalysisStandardResultDto } from './dto/create-analysis-standard-result.dto';
import { UpdateAnalysisStandardResultDto } from './dto/update-analysis-standard-result.dto';
import { UpdateAnalysisStandardResultFromFileDto } from './dto/update-analysis-standard-result-file.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

@Controller('analysis-standard-results')
export class AnalysisStandardResultsController {
  constructor(private readonly analysisStandardResultsService: AnalysisStandardResultsService) { }
  @Patch('file')
  async updatePreValueFromFile(
    @Body() inputs: UpdateAnalysisStandardResultFromFileDto[],
  ) {
    await this.analysisStandardResultsService.updatePreValueFromFile(inputs);
    return { message: 'Updated standard results (blank) successfully.' };
  }

  @UseGuards(AuthGuard)
  @Patch('input')
  async updatePreValueFromInput(
    @Body() inputs: UpdateAnalysisStandardResultFromFileDto[],
    @User('sub') userId: number
  ) {
    await this.analysisStandardResultsService.updatePreValueFromInput(inputs, userId);
    return { message: 'Updated standard results (input) successfully.' };
  }

  @Get('/logs')
  getLogs() {
    return this.analysisStandardResultsService.getLogs();
  }
}
