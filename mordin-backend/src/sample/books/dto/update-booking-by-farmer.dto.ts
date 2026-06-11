import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateBookingByFarmerDto {
  @IsInt()
  @IsNotEmpty()
  receivedServiceCalendarId: number;

  @IsInt()
  @IsNotEmpty()
  farmerId: number;
}
