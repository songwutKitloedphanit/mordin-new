import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceFertilizerMinor } from 'src/fertilizer/service-fertilizer-minors/entities/service-fertilizer-minor.entity';

import { Result } from '../results/entities/result.entity';

import { FertilizerMinorLandUsage } from './entities/fertilizer-minor-land-usage.entity';
import { FertilizerMinorLandUsageLog } from './entities/fertilizer-minor-land-usage.log.entity';
import { FertilizerMinorLandUsagesController } from './fertilizer-minor-land-usages.controller';
import { FertilizerMinorLandUsagesService } from './fertilizer-minor-land-usages.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FertilizerMinorLandUsage,
      FertilizerMinorLandUsageLog,
      ServiceFertilizerMinor,
      Result,
    ]),
  ],
  controllers: [FertilizerMinorLandUsagesController],
  providers: [FertilizerMinorLandUsagesService],
  exports: [FertilizerMinorLandUsagesService],
})
export class FertilizerMinorLandUsagesModule {}
