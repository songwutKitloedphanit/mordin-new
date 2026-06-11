import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QrCodeLabLog } from './entities/qr-code-lab.log.entity';
import { QrCodeLabsController } from './qr-code-labs.controller';
import { QrCodeLabsService } from './qr-code-labs.service';

@Module({
  imports: [TypeOrmModule.forFeature([QrCodeLabLog])],
  controllers: [QrCodeLabsController],
  providers: [QrCodeLabsService],
})
export class QrCodeLabsModule {}
