import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FertilizerMinorsModule } from '../fertilizer-minors/fertilizer-minors.module';
import { ServiceFertilizerMinorUsage } from '../service-fertilizer-minor-usages/entities/service-fertilizer-minor-usage.entity';

import { ServiceFertilizerMinor } from './entities/service-fertilizer-minor.entity';
import { ServiceFertilizerMinorLog } from './entities/service-fertilizer-minor.log.entity';
import { ServiceFertilizerMinorsController } from './service-fertilizer-minors.controller';
import { ServiceFertilizerMinorsService } from './service-fertilizer-minors.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceFertilizerMinor,
      ServiceFertilizerMinorUsage,
      ServiceFertilizerMinorLog,
    ]),
    FertilizerMinorsModule,
  ],
  controllers: [ServiceFertilizerMinorsController],
  providers: [ServiceFertilizerMinorsService],
  exports: [ServiceFertilizerMinorsService],
})
export class ServiceFertilizerMinorsModule {}
