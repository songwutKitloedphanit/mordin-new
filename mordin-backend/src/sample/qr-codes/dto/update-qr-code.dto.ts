import {
  IsDecimal,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateQrCodeDto {
  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsNumber()
  farmerId?: number;

  @IsOptional()
  @IsNumber()
  landId?: number;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  thaiNationalId: string;

  @IsNumber()
  serviceAreaId: number;

  @IsString()
  landCode: string;

  @IsString()
  landName: string;

  @IsOptional()
  @IsNumber()
  areaSize?: number;

  @IsOptional()
  @IsString()
  subdistrictCode?: string;

  @IsOptional()
  @IsNumber()
  zipCode?: number;

  @IsNumber()
  serviceTypeId: number;

  @IsOptional()
  @IsNumber()
  dirtWeightOm?: number;

  @IsOptional()
  @IsNumber()
  dirtWeightMehlich?: number;

  @IsDecimal(
    {
      decimal_digits: '1,6',
    },
    {
      message:
        'latitude must be a decimal with up to 6 digits after the decimal point',
    }
  )
  latitude: string;

  @IsDecimal(
    {
      decimal_digits: '1,6',
    },
    {
      message:
        'longitude must be a decimal with up to 6 digits after the decimal point',
    }
  )
  longitude: string;
}
