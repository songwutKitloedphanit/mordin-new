import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LaboratorySettingDetail } from './entities/laboratory-setting-detail.entity';
import { LaboratorySettingDetailLog } from './entities/laboratory-setting-detail.log.entity';
import { LaboratorySettingDetailsController } from './laboratory-setting-details.controller';
import { LaboratorySettingDetailsService } from './laboratory-setting-details.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LaboratorySettingDetail,
      LaboratorySettingDetailLog,
    ]),
  ],
  controllers: [LaboratorySettingDetailsController],
  providers: [LaboratorySettingDetailsService],
})
export class LaboratorySettingDetailsModule {}
