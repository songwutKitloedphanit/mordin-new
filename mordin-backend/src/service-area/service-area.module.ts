import { Module } from '@nestjs/common';
import { ServiceAreasModule } from './service-areas/service-areas.module';
import { FactoriesModule } from './factories/factories.module';

@Module({
  imports: [ServiceAreasModule, FactoriesModule],
})
export class ServiceAreaModule {}
