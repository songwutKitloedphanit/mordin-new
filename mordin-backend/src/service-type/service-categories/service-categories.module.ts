import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceFertilizerMajorUsage } from 'src/fertilizer/service-fertilizer-major-usages/entities/service-fertilizer-major-usage.entity';
import { ServiceFertilizerMajorUsagesModule } from 'src/fertilizer/service-fertilizer-major-usages/service-fertilizer-major-usages.module';

import { ServiceCategory } from './entities/service-category.entity';
import { ServiceCategoryLog } from './entities/service-category.log.entity';
import { ServiceCategoriesController } from './service-categories.controller';
import { ServiceCategoriesService } from './service-categories.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceCategory,
      ServiceFertilizerMajorUsage,
      ServiceCategoryLog,
    ]),
    ServiceFertilizerMajorUsagesModule,
  ],
  controllers: [ServiceCategoriesController],
  providers: [ServiceCategoriesService],
})
export class ServiceCategoriesModule {}
