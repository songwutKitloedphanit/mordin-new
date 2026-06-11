import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoModule } from 'src/common/crypto/crypto.module';
import { Farmer } from 'src/farmers/entities/farmer.entity';
import { Land } from 'src/lands/entities/land.entity';
import { ServiceCalendar } from 'src/service-calendars/entities/service-calendar.entity';

import { BooksModule } from '../books/books.module';
import { Book } from '../books/entities/book.entity';
import { ResultsModule } from '../results/results.module';

import { QrCode } from './entities/qr-code.entity';
import { QrCodeLog } from './entities/qr-code.log.entity';
import { QrCodesController } from './qr-codes.controller';
import { QrCodesService } from './qr-codes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QrCode,
      Book,
      Land,
      ServiceCalendar,
      Farmer,
      QrCodeLog,
    ]),
    BooksModule,
    CryptoModule,
    ResultsModule,
  ],
  controllers: [QrCodesController],
  providers: [QrCodesService],
})
export class QrCodesModule {}
