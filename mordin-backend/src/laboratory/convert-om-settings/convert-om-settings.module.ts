import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LaboratorySetting } from '../laboratory-settings/entities/laboratory-setting.entity';

import { ConvertOmSettingController } from './convert-om-settings.controller';
import { ConvertOmSettingService } from './convert-om-settings.service';
import { ConvertOmSetting } from './entities/convert-om-setting.entity';
import { ConvertOmSettingLog } from './entities/convert-om-setting.log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConvertOmSetting,
      LaboratorySetting,
      ConvertOmSettingLog,
    ]),
  ],
  controllers: [ConvertOmSettingController],
  providers: [ConvertOmSettingService],
})
export class ConvertOmSettingModule {}
