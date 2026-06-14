import { forwardRef, Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Result } from '../results/entities/result.entity';
import { QrCode } from '../qr-codes/entities/qr-code.entity';
import { ResultsModule } from '../results/results.module';
import { ServiceCalendar } from 'src/service-calendars/entities/service-calendar.entity';
import { ServiceCalendarsModule } from 'src/service-calendars/service-calendars.module';
import { Land } from 'src/lands/entities/land.entity';
import { FertilizerMinorLandUsage } from '../fertilizer-minor-land-usages/entities/fertilizer-minor-land-usage.entity';
import { FertilizerMajorLandUsage } from '../fertilizer-major-land-usages/entities/fertilizer-major-land-usage.entity';
import { UsageType } from 'src/fertilizer/usage-types/entities/usage-type.entity';
import { FertilizerMajorLandScore } from '../fertilizer-major-land-scores/entities/fertilizer-major-land-score.entity';
import { BookLog } from './entities/book.log.entity';
import { Farmer } from 'src/farmers/entities/farmer.entity';
import { FarmersModule } from 'src/farmers/farmers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Book ,
      Result,
      QrCode,
      ServiceCalendar,
      Land,
      FertilizerMinorLandUsage,
      FertilizerMajorLandUsage,
      FertilizerMajorLandScore,
      UsageType,
      BookLog,
      Farmer
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
