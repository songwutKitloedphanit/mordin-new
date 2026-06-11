import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LaboratorySetting } from 'src/laboratory/laboratory-settings/entities/laboratory-setting.entity';

import { AnalysisStandard } from '../analysis-standards/entities/analysis-standard.entity';
import { Standard } from '../standards/entities/standard.entity';

import { AnalysisStandardResultsController } from './analysis-standard-results.controller';
import { AnalysisStandardResultsService } from './analysis-standard-results.service';
import { AnalysisStandardResult } from './entities/analysis-standard-result.entity';
import { AnalysisStandardResultLog } from './entities/analysis-standard-result.log.entity';
import { StandardCalculationService } from './standard-calculation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalysisStandardResult,
      AnalysisStandard,
      LaboratorySetting,
      Standard,
      AnalysisStandardResultLog,
    ]),
  ],
  controllers: [AnalysisStandardResultsController],
  providers: [AnalysisStandardResultsService, StandardCalculationService],
  exports: [AnalysisStandardResultsService],
})
export class AnalysisStandardResultsModule {}
