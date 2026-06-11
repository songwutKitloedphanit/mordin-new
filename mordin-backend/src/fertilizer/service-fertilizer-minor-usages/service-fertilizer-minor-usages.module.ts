import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServiceFertilizerMinorUsage } from './entities/service-fertilizer-minor-usage.entity';
import { ServiceFertilizerMinorUsageLog } from './entities/service-fertilizer-minor-usage.log.entity';
import { ServiceFertilizerMinorUsagesController } from './service-fertilizer-minor-usages.controller';
import { ServiceFertilizerMinorUsagesService } from './service-fertilizer-minor-usages.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceFertilizerMinorUsage,
      ServiceFertilizerMinorUsageLog,
    ]),
  ],
  controllers: [ServiceFertilizerMinorUsagesController],
  providers: [ServiceFertilizerMinorUsagesService],
})
export class ServiceFertilizerMinorUsagesModule {}
