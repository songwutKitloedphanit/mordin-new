import { Module } from '@nestjs/common';
import { GeographiesModule } from './geographies/geographies.module';
import { ProvincesModule } from './provinces/provinces.module';
import { DistrictsModule } from './districts/districts.module';
import { SubdistrictsModule } from './subdistricts/subdistricts.module';

@Module({
  imports: [
    GeographiesModule,
    ProvincesModule,
    DistrictsModule,
    SubdistrictsModule,
  ],
})
export class AddressModule {}
