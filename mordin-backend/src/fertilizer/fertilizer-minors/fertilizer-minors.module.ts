import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceType } from 'src/service-type/service-types/entities/service-type.entity';

import { ServiceFertilizerMinor } from '../service-fertilizer-minors/entities/service-fertilizer-minor.entity';

import { FertilizerMinor } from './entities/fertilizer-minor.entity';
import { FertilizerMinorLog } from './entities/fertilizer-minor.log.entity';
import { FertilizerMinorsController } from './fertilizer-minors.controller';
import { FertilizerMinorsService } from './fertilizer-minors.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FertilizerMinor,
      FertilizerMinorLog,
      ServiceType,
      ServiceFertilizerMinor,
    ]),
  ],
  controllers: [FertilizerMinorsController],
  providers: [FertilizerMinorsService],
  exports: [FertilizerMinorsService],
})
export class FertilizerMinorsModule {}
