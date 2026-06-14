import { Module } from '@nestjs/common';
import { FertilizerMajorsService } from './fertilizer-majors.service';
import { FertilizerMajorsController } from './fertilizer-majors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FertilizerMajor } from './entities/fertilizer-major.entity';
import { FertilizerMinor } from '../fertilizer-minors/entities/fertilizer-minor.entity';
import { FertilizerMajorLog } from './entities/fertilizer-major.log.entity';

import { ServiceFertilizerMajorUsage } from '../service-fertilizer-major-usages/entities/service-fertilizer-major-usage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FertilizerMajor, FertilizerMinor, FertilizerMajorLog, ServiceFertilizerMajorUsage])],
  controllers: [FertilizerMajorsController],
  providers: [FertilizerMajorsService],
})
export class FertilizerMajorsModule { }
