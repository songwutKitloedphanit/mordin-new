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

@Module({
  imports: [TypeOrmModule.forFeature([ServiceArea, Factory, ServiceAreaLog, Farmer, Book, QrCode])],
  controllers: [ServiceAreasController],
  providers: [ServiceAreasService],
})
export class ServiceAreasModule { }
