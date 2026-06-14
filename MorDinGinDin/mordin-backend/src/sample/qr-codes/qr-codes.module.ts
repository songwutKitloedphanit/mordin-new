import { Module } from '@nestjs/common';
import { QrCodesService } from './qr-codes.service';
import { QrCodesController } from './qr-codes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrCode } from './entities/qr-code.entity';
import { BooksModule } from '../books/books.module';
import { CryptoModule } from 'src/common/crypto/crypto.module';
import { Book } from '../books/entities/book.entity';
import { Land } from 'src/lands/entities/land.entity';
import { ResultsModule } from '../results/results.module';
import { ServiceCalendar } from 'src/service-calendars/entities/service-calendar.entity';
import { Farmer } from 'src/farmers/entities/farmer.entity';
import { QrCodeLog } from './entities/qr-code.log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QrCode,
      Book,
      Land,
      ServiceCalendar,
      Farmer,
      QrCodeLog
    ]),
    BooksModule,
    CryptoModule,
    ResultsModule
  ],
  controllers: [QrCodesController],
  providers: [QrCodesService],
})
export class QrCodesModule {}
