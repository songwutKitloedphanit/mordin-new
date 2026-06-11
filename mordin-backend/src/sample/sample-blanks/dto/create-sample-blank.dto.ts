import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateSampleBlankResultDto } from 'src/sample/sample-blank-results/dto/create-sample-blank-result.dto';

import { SampleBlankType } from '../entities/sample-blank.entity';

export class CreateSampleBlankDto {
  @IsNumber()
  @IsNotEmpty()
  serviceCalendarId: number;

  @IsString()
  name: string;

  @IsNumber()
  repeatCount: number;

  @IsEnum(SampleBlankType)
  type: SampleBlankType;

  @ValidateNested({ each: true })
  @Type(() => CreateSampleBlankResultDto)
  sampleBlankResult: CreateSampleBlankResultDto[];
}
