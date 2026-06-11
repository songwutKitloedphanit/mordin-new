import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnalysisStandardResultsModule } from '../analysis-standard-results/analysis-standard-results.module';

import { AnalysisStandardsController } from './analysis-standards.controller';
import { AnalysisStandardsService } from './analysis-standards.service';
import { AnalysisStandard } from './entities/analysis-standard.entity';
import { AnalysisStandardLog } from './entities/analysis-standard.log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnalysisStandard, AnalysisStandardLog]),
    AnalysisStandardResultsModule,
  ],
  controllers: [AnalysisStandardsController],
  providers: [AnalysisStandardsService],
})
export class AnalysisStandardsModule {}
