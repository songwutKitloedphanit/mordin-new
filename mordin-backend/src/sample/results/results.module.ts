import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculationModule } from 'src/common/calculation/calculation.module';
import { LaboratorySetting } from 'src/laboratory/laboratory-settings/entities/laboratory-setting.entity';
import { ServiceCalendar } from 'src/service-calendars/entities/service-calendar.entity';
import { ServiceLaboratory } from 'src/service-type/service-laboratories/entities/service-laboratory.entity';
import { AnalysisStandardResultsModule } from 'src/standard-sample/analysis-standard-results/analysis-standard-results.module';
import { StandardCertificatesModule } from 'src/standard-sample/standard-certificates/standard-certificates.module';

import { Book } from '../books/entities/book.entity';

import { Result } from './entities/result.entity';
import { ResultLog } from './entities/result.log.entity';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Result,
      ResultLog,
      LaboratorySetting,
      ServiceLaboratory,
      Book,
      ServiceCalendar,
    ]),
    CalculationModule,
    AnalysisStandardResultsModule,
    StandardCertificatesModule,
  ],
  controllers: [ResultsController],
  providers: [ResultsService],
  exports: [ResultsService],
})
export class ResultsModule {}
