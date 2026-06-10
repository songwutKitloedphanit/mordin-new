import { IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class CreateBusDto {
  @IsString()
  @Length(1, 45)
  busNumber: string;

  @IsString()
  @Length(1, 50)
  busName: string;

  @IsString()
  @Length(1, 45)
  licensePlate: string;

  @IsNumber()
  registrationProvinceCode: number;

  @IsString()
  @Length(1, 45)
  workingArea: string;

  @IsOptional()
  @IsString()
  @Length(0, 45)
  note?: string;
}
