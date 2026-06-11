import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Laboratory } from './laboratories/entities/laboratory.entity';
import { LaboratoriesModule } from './laboratories/laboratories.module';
import { LaboratorySettingDetailsModule } from './laboratory-setting-details/laboratory-setting-details.module';
import { LaboratorySettingsModule } from './laboratory-settings/laboratory-settings.module';
import { MachineTypesModule } from './machine-types/machine-types.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Laboratory]),
    LaboratoriesModule,
    MachineTypesModule,
    LaboratorySettingsModule,
    LaboratorySettingDetailsModule,
  ],
})
export class LaboratoryModule {}
