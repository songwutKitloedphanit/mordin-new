import { Module } from '@nestjs/common';
import { ServiceFertilizerMinorsService } from './service-fertilizer-minors.service';
import { ServiceFertilizerMinorsController } from './service-fertilizer-minors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceFertilizerMinor } from './entities/service-fertilizer-minor.entity';
import { ServiceFertilizerMinorUsage } from '../service-fertilizer-minor-usages/entities/service-fertilizer-minor-usage.entity';
import { FertilizerMinorsModule } from '../fertilizer-minors/fertilizer-minors.module';
import { ServiceFertilizerMinorLog } from './entities/service-fertilizer-minor.log.entity';

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
