import { Module } from '@nestjs/common';

import { ServiceCategoriesModule } from './service-categories/service-categories.module';
import { ServiceLaboratoriesModule } from './service-laboratories/service-laboratories.module';
import { ServiceTypesModule } from './service-types/service-types.module';

@Module({
  imports: [
    ServiceTypesModule,
    ServiceCategoriesModule,
    ServiceLaboratoriesModule,
    // SoilGradesModule
  ],
})
export class ServiceTypeModule {}
