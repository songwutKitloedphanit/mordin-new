import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditOutboxModule } from 'src/audit-outbox/audit-outbox.module';

import { ServiceArea } from '../service-areas/entities/service-area.entity';

import { Factory } from './entities/factory.entity';
import { FactoryLog } from './entities/factory.log.entity';
import { FactoriesController } from './factories.controller';
import { FactoriesService } from './factories.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Factory, ServiceArea]),
    TypeOrmModule.forFeature([FactoryLog], 'logs'),
    AuditOutboxModule,
  ],
  controllers: [FactoriesController],
  providers: [FactoriesService],
})
export class FactoriesModule {}
