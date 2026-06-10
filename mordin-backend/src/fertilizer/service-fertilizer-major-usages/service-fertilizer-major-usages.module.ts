import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceFertilizerMajorUsage } from './entities/service-fertilizer-major-usage.entity';
import { ServiceFertilizerMajorUsagesController } from './service-fertilizer-major-usages.controller';
import { ServiceFertilizerMajorUsagesService } from './service-fertilizer-major-usages.service';
import { ServiceFertilizerMajorUsageLog } from './entities/service-fertilizer-major-usage.log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceFertilizerMajorUsage, ServiceFertilizerMajorUsageLog])],
  controllers: [ServiceFertilizerMajorUsagesController],
  providers: [ServiceFertilizerMajorUsagesService],
  exports: [ServiceFertilizerMajorUsagesService],
})
export class ServiceFertilizerMajorUsagesModule {}
