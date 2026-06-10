import { Module } from '@nestjs/common';
import { ServiceLaboratoriesService } from './service-laboratories.service';
import { ServiceLaboratoriesController } from './service-laboratories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceLaboratory } from './entities/service-laboratory.entity';
import { ServiceType } from '../service-types/entities/service-type.entity';
import { ServiceLaboratoryLog } from './entities/service-laboratory.log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceLaboratory, ServiceType,ServiceLaboratoryLog])],
  controllers: [ServiceLaboratoriesController],
  providers: [ServiceLaboratoriesService],
  exports: [ServiceLaboratoriesService],
})
export class ServiceLaboratoriesModule {}
