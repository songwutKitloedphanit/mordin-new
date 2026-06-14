import { Module } from '@nestjs/common';
import { FertilizerMajorsModule } from './fertilizer-majors/fertilizer-majors.module';
import { FertilizerMinorsModule } from './fertilizer-minors/fertilizer-minors.module';
import { ServiceFertilizerMinorsModule } from './service-fertilizer-minors/service-fertilizer-minors.module';
import { ServiceFertilizerMinorUsagesModule } from './service-fertilizer-minor-usages/service-fertilizer-minor-usages.module';
import { UsageTypesModule } from './usage-types/usage-types.module';
import { ServiceFertilizerMajorUsagesModule } from './service-fertilizer-major-usages/service-fertilizer-major-usages.module';

@Module({
  imports: [
    FertilizerMajorsModule,
    FertilizerMinorsModule,
    ServiceFertilizerMinorsModule,
    ServiceFertilizerMinorUsagesModule,
    ServiceFertilizerMajorUsagesModule,
    UsageTypesModule,
    ServiceFertilizerMajorUsagesModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class FertilizerModule {}
