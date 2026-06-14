import { Module } from '@nestjs/common';
import { UnitsModule } from './units/units.module';

@Module({
  imports: [UnitsModule],
})
export class ReferenceDataModule {}
