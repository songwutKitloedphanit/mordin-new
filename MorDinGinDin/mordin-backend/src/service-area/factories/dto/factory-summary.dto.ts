import { IsNumber } from 'class-validator';

export class FactorySummaryDTO {
  @IsNumber()
  totalFactories : number;

  @IsNumber()
  totalServiceAres : number;
}
