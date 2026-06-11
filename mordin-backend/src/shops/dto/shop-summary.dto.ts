import { IsNumber } from 'class-validator';

export class ShopSummaryDTO {
  @IsNumber()
  totalShops: number;
}
