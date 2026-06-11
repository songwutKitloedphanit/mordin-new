import { Module } from '@nestjs/common';

import { CalculationModule } from './calculation/calculation.module';
import { CryptoModule } from './crypto/crypto.module';

@Module({
  imports: [CryptoModule, CalculationModule],
})
export class CommonModule {}
