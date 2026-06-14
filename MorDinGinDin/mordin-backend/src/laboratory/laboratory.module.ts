import { Module } from '@nestjs/common';
import { LaboratoriesModule } from './laboratories/laboratories.module';
import { MachineTypesModule } from './machine-types/machine-types.module';
import { LaboratorySettingsModule } from './laboratory-settings/laboratory-settings.module';
import { LaboratorySettingDetailsModule } from './laboratory-setting-details/laboratory-setting-details.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Laboratory } from './laboratories/entities/laboratory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Laboratory]),
    LaboratoriesModule,
    MachineTypesModule,
    LaboratorySettingsModule,
    LaboratorySettingDetailsModule,
  ]
})
export class LaboratoryModule {}
