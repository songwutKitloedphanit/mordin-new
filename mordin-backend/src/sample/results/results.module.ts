import { Module } from '@nestjs/common';
import { ResultsService } from './results.service';
import { ResultsController } from './results.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Result } from './entities/result.entity';
import { LaboratorySetting } from 'src/laboratory/laboratory-settings/entities/laboratory-setting.entity';
import { ServiceLaboratory } from 'src/service-type/service-laboratories/entities/service-laboratory.entity';
import { CalculationModule } from 'src/common/calculation/calculation.module';
import { Book } from '../books/entities/book.entity';
import { StandardCertificatesModule } from 'src/standard-sample/standard-certificates/standard-certificates.module';
import { AnalysisStandardResultsModule } from 'src/standard-sample/analysis-standard-results/analysis-standard-results.module';
import { ServiceCalendar } from 'src/service-calendars/entities/service-calendar.entity';
import { ResultLog } from './entities/result.log.entity';

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
  exports: [ResultsService]
})
export class ResultsModule { }
