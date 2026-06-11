import { Type } from 'class-transformer';
import { IsString, IsNumber, IsEnum, ValidateNested } from 'class-validator';
import { UpdateSampleBlankResultDto } from 'src/sample/sample-blank-results/dto/update-sample-blank-result.dto';

import { SampleBlankType } from '../entities/sample-blank.entity';

export class UpdateSampleBlankDto {
  @IsString()
  name: string;

  @IsNumber()
  repeatCount: number;

  @IsEnum(SampleBlankType)
  type: SampleBlankType;

  @ValidateNested({ each: true })
  @Type(() => UpdateSampleBlankResultDto)
  sampleBlankResult: UpdateSampleBlankResultDto[];
}
