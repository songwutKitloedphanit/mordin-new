import { PartialType } from '@nestjs/swagger';
import { CreateLaboratoryDto } from './create-laboratory.dto';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateLaboratoryDto extends PartialType(CreateLaboratoryDto) {
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
  @IsNotEmpty()
  @MaxLength(30)
  unitBefore: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  shortNameAfter: string;

  @IsString()
  @IsNotEmpty()
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
