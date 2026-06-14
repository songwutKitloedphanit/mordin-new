import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateLaboratoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(45)
  laboratoryCode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  shortNameBefore: string;

  @IsString()
  @MaxLength(30)
  unitBefore: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  shortNameAfter: string;

  @IsString()
  @MaxLength(30)
  unitAfter: string;

  @IsNumber()
  rangeMin: number;

  @IsNumber()
  rangeMax: number;

  @IsNumber()
  machineTypeId: number;

  @IsBoolean()
  @IsOptional()
  isMain?: boolean;
}
