import { IsNumber } from 'class-validator';

export class UserSummaryDTO {
  @IsNumber()
  totalUsers : number;

  @IsNumber()
  adminAmount : number;

  @IsNumber()
  staffAmount : number;

  @IsNumber()
  executiveAmount : number;
}
