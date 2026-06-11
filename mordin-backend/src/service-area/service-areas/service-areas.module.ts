import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditOutboxModule } from 'src/audit-outbox/audit-outbox.module';
import { Farmer } from 'src/farmers/entities/farmer.entity';
import { Book } from 'src/sample/books/entities/book.entity';
import { QrCode } from 'src/sample/qr-codes/entities/qr-code.entity';

import { Factory } from '../factories/entities/factory.entity';

import { ServiceArea } from './entities/service-area.entity';
import { ServiceAreaLog } from './entities/service-area.log.entity';
import { ServiceAreasController } from './service-areas.controller';
import { ServiceAreasService } from './service-areas.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceArea, Factory, Farmer, Book, QrCode]),
    TypeOrmModule.forFeature([ServiceAreaLog], 'logs'),
    AuditOutboxModule,
  ],
  controllers: [ServiceAreasController],
  providers: [ServiceAreasService],
})
export class ServiceAreasModule {}
