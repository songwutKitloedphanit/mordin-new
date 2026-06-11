import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FertilizerMinor } from '../fertilizer-minors/entities/fertilizer-minor.entity';
import { ServiceFertilizerMajorUsage } from '../service-fertilizer-major-usages/entities/service-fertilizer-major-usage.entity';

import { FertilizerMajor } from './entities/fertilizer-major.entity';
import { FertilizerMajorLog } from './entities/fertilizer-major.log.entity';
import { FertilizerMajorsController } from './fertilizer-majors.controller';
import { FertilizerMajorsService } from './fertilizer-majors.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FertilizerMajor,
      FertilizerMinor,
      FertilizerMajorLog,
      ServiceFertilizerMajorUsage,
    ]),
  ],
  controllers: [FertilizerMajorsController],
  providers: [FertilizerMajorsService],
})
export class FertilizerMajorsModule {}
