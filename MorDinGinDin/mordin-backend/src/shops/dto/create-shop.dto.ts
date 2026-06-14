import { IsArray, IsNumber, IsString, IsUrl, Length, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShopDto {
  @IsString()
  @Length(10, 10)
  phone: string;

  @IsString()
  @Length(1, 45)
  name: string;

  @IsString()
  @Length(1, 100)
  ownerName: string;

  @IsUrl()
  @Length(1, 100)
  @IsOptional()
  facebook?: string;

  @IsString()
  @Length(1, 100)
  @IsOptional()
  lineId?: string;

  @IsString()
  @Length(1, 100)
  @IsOptional()
  googleMapUrl?: string;

  @IsString()
  @Length(6, 6)
  subdistrictId: string;

  @Type(() => Number)
  @IsNumber()
  zipCode: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

