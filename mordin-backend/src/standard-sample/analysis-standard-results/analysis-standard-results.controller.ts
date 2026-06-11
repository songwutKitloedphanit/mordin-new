import { Controller, Get, Body, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/auth/decorators/user.decorator';

import { AnalysisStandardResultsService } from './analysis-standard-results.service';
import { UpdateAnalysisStandardResultFromFileDto } from './dto/update-analysis-standard-result-file.dto';

@Controller('analysis-standard-results')
export class AnalysisStandardResultsController {
  constructor(
    private readonly analysisStandardResultsService: AnalysisStandardResultsService
  ) {}

  @Patch('file')
  async updatePreValueFromFile(
    @Body() inputs: UpdateAnalysisStandardResultFromFileDto[]
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
    await this.analysisStandardResultsService.updatePreValueFromInput(
      inputs,
      userId
    );
    return { message: 'Updated standard results (input) successfully.' };
  }

  @Get('/logs')
  getLogs() {
    return this.analysisStandardResultsService.getLogs();
  }
}
