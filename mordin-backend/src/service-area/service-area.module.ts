import { Module } from '@nestjs/common';

import { FactoriesModule } from './factories/factories.module';
import { ServiceAreasModule } from './service-areas/service-areas.module';

@Module({
  imports: [ServiceAreasModule, FactoriesModule],
})
export class ServiceAreaModule {}
