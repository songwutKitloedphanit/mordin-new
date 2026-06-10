import { Module } from '@nestjs/common';
import { ServiceAreasService } from './service-areas.service';
import { ServiceAreasController } from './service-areas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceArea } from './entities/service-area.entity';
import { Factory } from '../factories/entities/factory.entity';
import { ServiceAreaLog } from './entities/service-area.log.entity';
import { Farmer } from 'src/farmers/entities/farmer.entity';
import { Book } from 'src/sample/books/entities/book.entity';
import { QrCode } from 'src/sample/qr-codes/entities/qr-code.entity';
import { AuditOutboxModule } from 'src/audit-outbox/audit-outbox.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceArea, Factory, Farmer, Book, QrCode]),
    TypeOrmModule.forFeature([ServiceAreaLog], 'logs'),
    AuditOutboxModule,
  ],
  controllers: [ServiceAreasController],
  providers: [ServiceAreasService],
})
export class ServiceAreasModule { }
