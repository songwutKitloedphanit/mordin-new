import { Module } from '@nestjs/common';
import { QrCodeLabsService } from './qr-code-labs.service';
import { QrCodeLabsController } from './qr-code-labs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrCodeLabLog } from './entities/qr-code-lab.log.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([
        QrCodeLabLog
      ]),
    ],
  controllers: [QrCodeLabsController],
  providers: [QrCodeLabsService],
})
export class QrCodeLabsModule {}
