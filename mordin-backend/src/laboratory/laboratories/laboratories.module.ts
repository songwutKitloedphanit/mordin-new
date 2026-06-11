import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceLaboratoriesModule } from 'src/service-type/service-laboratories/service-laboratories.module';

import { LaboratorySettingsModule } from '../laboratory-settings/laboratory-settings.module';

import { Laboratory } from './entities/laboratory.entity';
import { LaboratoryLog } from './entities/laboratory.log.entity';
import { LaboratoriesController } from './laboratories.controller';
import { LaboratoriesService } from './laboratories.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Laboratory, LaboratoryLog]),
    ServiceLaboratoriesModule,
    LaboratorySettingsModule,
  ],
  controllers: [LaboratoriesController],
  providers: [LaboratoriesService],
})
export class LaboratoriesModule {}
