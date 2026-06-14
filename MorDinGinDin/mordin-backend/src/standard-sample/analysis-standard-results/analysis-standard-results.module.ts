import { Module } from '@nestjs/common';
import { AnalysisStandardResultsService } from './analysis-standard-results.service';
import { AnalysisStandardResultsController } from './analysis-standard-results.controller';
import { StandardCalculationService } from './standard-calculation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisStandardResult } from './entities/analysis-standard-result.entity';
import { AnalysisStandard } from '../analysis-standards/entities/analysis-standard.entity';
import { LaboratorySetting } from 'src/laboratory/laboratory-settings/entities/laboratory-setting.entity';
import { Standard } from '../standards/entities/standard.entity';
import { AnalysisStandardResultLog } from './entities/analysis-standard-result.log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalysisStandardResult,
      AnalysisStandard,
      LaboratorySetting,
      Standard,
      AnalysisStandardResultLog
    ])
  ],
  controllers: [AnalysisStandardResultsController],
  providers: [AnalysisStandardResultsService, StandardCalculationService],
  exports: [AnalysisStandardResultsService],
})
export class AnalysisStandardResultsModule { }
