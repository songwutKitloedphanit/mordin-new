import { Module } from '@nestjs/common';
import { LaboratoriesService } from './laboratories.service';
import { LaboratoriesController } from './laboratories.controller';
import { Type } from 'class-transformer';
import { Laboratory } from './entities/laboratory.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceLaboratoriesModule } from 'src/service-type/service-laboratories/service-laboratories.module';
import { LaboratorySettingsModule } from '../laboratory-settings/laboratory-settings.module';
import { LaboratoryLog } from './entities/laboratory.log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Laboratory,LaboratoryLog]),
    ServiceLaboratoriesModule,
    LaboratorySettingsModule,
  ],
  controllers: [LaboratoriesController],
  providers: [LaboratoriesService],
})
export class LaboratoriesModule {}
