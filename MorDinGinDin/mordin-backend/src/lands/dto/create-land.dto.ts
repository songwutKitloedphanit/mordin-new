/* eslint-disable prettier/prettier */
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  IsDecimal,
} from 'class-validator';

export class CreateLandDto {
  @IsString()
  @IsOptional()
  landCode: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  quotaCode: string;

  @IsNumber()
  @IsNotEmpty()
  areaSize: number;

  @IsDecimal(
    { decimal_digits: '1,6' },
    {
      message:
        'latitude must be a decimal with up to 6 digits after the decimal point',
    },
  )
  @IsOptional()
  latitude: string;

  @IsDecimal(
    { decimal_digits: '1,6' },
    {
      message:
        'longitude must be a decimal with up to 6 digits after the decimal point',
    },
  )
  @IsOptional()
  longitude: string;

  @IsString()
  @IsNotEmpty()
  subdistrictCode: string;

  @IsInt()
  zipCode: number;

  @IsString()
  @IsOptional()
  village?: string;

  @IsInt()
  farmerId: number;
}
