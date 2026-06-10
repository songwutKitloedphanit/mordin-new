import { IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class CreateFarmerDto {
  @IsOptional()
  @IsString()
  @Length(0, 13)
  thaiNationalId?: string;

  @IsOptional()
  @IsString()
  @Length(0, 45)
  thaiFarmerId?: string;

  @IsString()
  @Length(0, 10)
  phone?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsString()
  @Length(1, 45)
  firstName: string;

  @IsString()
  @Length(1, 45)
  lastName: string;

  @IsString()
  @Length(0, 50)
  @IsOptional()
  lineUserId?: string;

  @IsNumber()
  factoryId: number;

  @IsNumber()
  serviceAreaId: number;
}
