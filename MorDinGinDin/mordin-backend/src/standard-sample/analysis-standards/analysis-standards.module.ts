import { Module } from '@nestjs/common';
import { AnalysisStandardsService } from './analysis-standards.service';
import { AnalysisStandardsController } from './analysis-standards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisStandard } from './entities/analysis-standard.entity';
import { AnalysisStandardResultsModule } from '../analysis-standard-results/analysis-standard-results.module';
import { AnalysisStandardLog } from './entities/analysis-standard.log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalysisStandard,AnalysisStandardLog
    ]),
    AnalysisStandardResultsModule
  ],
  controllers: [AnalysisStandardsController],
  providers: [AnalysisStandardsService],
})
export class AnalysisStandardsModule {}
