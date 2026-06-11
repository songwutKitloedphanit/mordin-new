import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Farmer } from 'src/farmers/entities/farmer.entity';
import { FarmersModule } from 'src/farmers/farmers.module';
import { UsageType } from 'src/fertilizer/usage-types/entities/usage-type.entity';
import { Land } from 'src/lands/entities/land.entity';
import { ServiceCalendar } from 'src/service-calendars/entities/service-calendar.entity';
import { ServiceCalendarsModule } from 'src/service-calendars/service-calendars.module';

import { FertilizerMajorLandScore } from '../fertilizer-major-land-scores/entities/fertilizer-major-land-score.entity';
import { FertilizerMajorLandUsage } from '../fertilizer-major-land-usages/entities/fertilizer-major-land-usage.entity';
import { FertilizerMinorLandUsage } from '../fertilizer-minor-land-usages/entities/fertilizer-minor-land-usage.entity';
import { QrCode } from '../qr-codes/entities/qr-code.entity';
import { Result } from '../results/entities/result.entity';
import { ResultsModule } from '../results/results.module';

import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';
import { BookLog } from './entities/book.log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Book,
      Result,
      QrCode,
      ServiceCalendar,
      Land,
      FertilizerMinorLandUsage,
      FertilizerMajorLandUsage,
      FertilizerMajorLandScore,
      UsageType,
      BookLog,
      Farmer,
    ]),
    ResultsModule,
    ServiceCalendarsModule,
    forwardRef(() => FarmersModule),
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
