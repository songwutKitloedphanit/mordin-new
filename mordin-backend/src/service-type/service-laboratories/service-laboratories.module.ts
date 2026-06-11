import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServiceType } from '../service-types/entities/service-type.entity';

import { ServiceLaboratory } from './entities/service-laboratory.entity';
import { ServiceLaboratoryLog } from './entities/service-laboratory.log.entity';
import { ServiceLaboratoriesController } from './service-laboratories.controller';
import { ServiceLaboratoriesService } from './service-laboratories.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceLaboratory,
      ServiceType,
      ServiceLaboratoryLog,
    ]),
  ],
  controllers: [ServiceLaboratoriesController],
  providers: [ServiceLaboratoriesService],
  exports: [ServiceLaboratoriesService],
})
export class ServiceLaboratoriesModule {}
