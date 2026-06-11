import { IsNumber, IsOptional } from 'class-validator';

export class ReceiveSampleDto {
  @IsNumber()
  serviceCalendarId: number;

  @IsNumber()
  @IsOptional()
  bookId?: number;
}
