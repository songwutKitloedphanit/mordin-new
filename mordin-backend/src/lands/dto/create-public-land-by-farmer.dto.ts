import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePublicLandByFarmerDto {
  @IsInt()
  farmerId!: number;

  @Transform(({ value }) => (value == null ? '' : String(value).trim()))
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @Transform(({ value }) =>
    value == null ? '' : String(value).replace(/\D/g, '')
  )
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsOptional()
  landCode?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @IsNotEmpty()
  areaSize!: number;

  @IsString()
  @IsOptional()
  latitude?: string;

  @IsString()
  @IsOptional()
  longitude?: string;

  @IsString()
  @IsNotEmpty()
  subdistrictCode!: string;

  @IsInt()
  zipCode!: number;
}
