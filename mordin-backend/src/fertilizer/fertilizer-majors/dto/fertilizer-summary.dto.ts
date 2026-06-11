import { IsNumber } from 'class-validator';

// fertilizer-summary.dto.ts
export class FertilizerSummaryDto {
  @IsNumber()
  majorCount: number;

  @IsNumber()
  majorAvgPricePerSack: number;

  @IsNumber()
  minorCount: number;

  @IsNumber()
  minorAvgPricePerKg: number;
}
