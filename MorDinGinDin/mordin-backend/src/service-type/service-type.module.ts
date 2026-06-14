import { Module } from '@nestjs/common';
import { ServiceTypesModule } from './service-types/service-types.module';
import { ServiceCategoriesModule } from './service-categories/service-categories.module';
import { ServiceLaboratoriesModule } from './service-laboratories/service-laboratories.module';
import { SoilGradesModule } from 'src/soil-grade/soil-grades/soil-grades.module';

@Module({
  imports: [
    ServiceTypesModule,
    ServiceCategoriesModule,
    ServiceLaboratoriesModule,
    // SoilGradesModule
  ],
})
export class ServiceTypeModule {}
