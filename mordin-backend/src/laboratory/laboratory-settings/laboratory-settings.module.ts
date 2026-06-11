import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculationModule } from 'src/common/calculation/calculation.module';
import { ServiceCalendar } from 'src/service-calendars/entities/service-calendar.entity';

import { ConvertOmSetting } from '../convert-om-settings/entities/convert-om-setting.entity';
import { Laboratory } from '../laboratories/entities/laboratory.entity';
import { LaboratorySettingDetail } from '../laboratory-setting-details/entities/laboratory-setting-detail.entity';

import { LaboratorySetting } from './entities/laboratory-setting.entity';
import { LaboratorySettingLog } from './entities/laboratory-setting.log.entity';
import { LaboratorySettingsController } from './laboratory-settings.controller';
import { LaboratorySettingsService } from './laboratory-settings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LaboratorySetting,
      LaboratorySettingDetail,
      Laboratory,
      ServiceCalendar,
      ConvertOmSetting,
      LaboratorySettingLog,
    ]),
    CalculationModule,
  ],
  controllers: [LaboratorySettingsController],
  providers: [LaboratorySettingsService],
  exports: [LaboratorySettingsService],
})
export class LaboratorySettingsModule {}
