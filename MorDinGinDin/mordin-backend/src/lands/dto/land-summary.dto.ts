import { IsNumber } from 'class-validator';

export class LandSummaryDTO {
  @IsNumber()
  totalLands : number;

  @IsNumber()
  needsImprovementCount : number;

  @IsNumber()
  normalSoilCount : number;

  @IsNumber()
  fertileSoilCount : number;
}
