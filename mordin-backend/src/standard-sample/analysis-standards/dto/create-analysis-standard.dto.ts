import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayNotEmpty,
} from 'class-validator';

import { StandardType } from '../entities/analysis-standard.entity';

export class StandardItemDto {
  @IsOptional()
  @IsNumber()
  standardId?: number; // If the standard is blank, this will be null

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  repeatCount: number;

  @IsEnum(StandardType)
  @IsNotEmpty()
  type: StandardType;
}

export class CreateAnalysisStandardDto {
  @IsNumber()
  @IsNotEmpty()
  serviceCalendarId: number;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => StandardItemDto)
  standard: StandardItemDto[];
}
