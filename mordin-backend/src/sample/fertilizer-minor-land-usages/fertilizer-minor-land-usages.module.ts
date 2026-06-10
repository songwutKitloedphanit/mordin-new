import { Module } from '@nestjs/common';
import { FertilizerMinorLandUsagesService } from './fertilizer-minor-land-usages.service';
import { FertilizerMinorLandUsagesController } from './fertilizer-minor-land-usages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FertilizerMinorLandUsage } from './entities/fertilizer-minor-land-usage.entity';
import { ServiceFertilizerMinor } from 'src/fertilizer/service-fertilizer-minors/entities/service-fertilizer-minor.entity';
import { Result } from '../results/entities/result.entity';
import { FertilizerMinorLandUsageLog } from './entities/fertilizer-minor-land-usage.log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FertilizerMinorLandUsage,
      FertilizerMinorLandUsageLog,
      ServiceFertilizerMinor,
      Result
    ])
  ],
  controllers: [FertilizerMinorLandUsagesController],
  providers: [FertilizerMinorLandUsagesService],
  exports: [FertilizerMinorLandUsagesService]
})
export class FertilizerMinorLandUsagesModule {}
