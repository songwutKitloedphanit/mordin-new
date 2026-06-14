import { Module } from '@nestjs/common';
import { ServiceCategoriesService } from './service-categories.service';
import { ServiceCategoriesController } from './service-categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceCategory } from './entities/service-category.entity';
import { ServiceFertilizerMajorUsage } from 'src/fertilizer/service-fertilizer-major-usages/entities/service-fertilizer-major-usage.entity';
import { ServiceFertilizerMajorUsagesModule } from 'src/fertilizer/service-fertilizer-major-usages/service-fertilizer-major-usages.module';
import { ServiceCategoryLog } from './entities/service-category.log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceCategory, ServiceFertilizerMajorUsage,ServiceCategoryLog]),
    ServiceFertilizerMajorUsagesModule,
  ],
  controllers: [ServiceCategoriesController],
  providers: [ServiceCategoriesService],
})
export class ServiceCategoriesModule {}
