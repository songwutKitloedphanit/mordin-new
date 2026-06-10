import { Module } from '@nestjs/common';
import { FertilizerMinorsService } from './fertilizer-minors.service';
import { FertilizerMinorsController } from './fertilizer-minors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FertilizerMinor } from './entities/fertilizer-minor.entity';
import { ServiceType } from 'src/service-type/service-types/entities/service-type.entity';
import { ServiceFertilizerMinor } from '../service-fertilizer-minors/entities/service-fertilizer-minor.entity';
import { FertilizerMinorLog } from './entities/fertilizer-minor.log.entity';

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
