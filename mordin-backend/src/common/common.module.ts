import { Module } from '@nestjs/common';
import { CryptoModule } from './crypto/crypto.module';
import { CalculationModule } from './calculation/calculation.module';

@Module({
  imports: [CryptoModule, CalculationModule],
})
export class CommonModule {}
