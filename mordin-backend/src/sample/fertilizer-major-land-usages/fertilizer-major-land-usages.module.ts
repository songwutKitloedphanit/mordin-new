import { Module } from '@nestjs/common';
import { FertilizerMajorLandUsagesService } from './fertilizer-major-land-usages.service';
import { FertilizerMajorLandUsagesController } from './fertilizer-major-land-usages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FertilizerMajorLandUsage } from './entities/fertilizer-major-land-usage.entity';
import { SoilGrade } from 'src/soil-grade/soil-grades/entities/soil-grade.entity';
import { FertilizerMajorLandScore } from '../fertilizer-major-land-scores/entities/fertilizer-major-land-score.entity';
import { UsageType } from 'src/fertilizer/usage-types/entities/usage-type.entity';
import { ServiceFertilizerMajorUsage } from 'src/fertilizer/service-fertilizer-major-usages/entities/service-fertilizer-major-usage.entity';
import { FertilizerMajorLandUsageLog } from './entities/fertilizer-major-land-usage.log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FertilizerMajorLandUsage,
      FertilizerMajorLandUsageLog,
      SoilGrade,
      FertilizerMajorLandScore,
      UsageType,
      ServiceFertilizerMajorUsage
    ])
  ],
  controllers: [FertilizerMajorLandUsagesController],
  providers: [FertilizerMajorLandUsagesService],
  exports: [FertilizerMajorLandUsagesService]
})
export class FertilizerMajorLandUsagesModule {}
