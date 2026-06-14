import { IsNumber } from 'class-validator';

export class BusSummaryDTO {
  @IsNumber()
  totalBuses : number;
}
