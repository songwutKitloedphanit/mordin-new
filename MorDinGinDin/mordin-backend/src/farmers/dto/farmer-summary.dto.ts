import { IsNumber } from 'class-validator';

export class FarmerSummaryDTO {
  @IsNumber()
  totalFarmers : number;

  @IsNumber()
  totalLands : number;

  @IsNumber()
  totalSpaces : number;
}
