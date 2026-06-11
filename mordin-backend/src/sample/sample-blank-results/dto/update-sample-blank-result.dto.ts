import { PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

import { CreateSampleBlankResultDto } from './create-sample-blank-result.dto';

export class UpdateSampleBlankResultDto extends PartialType(
  CreateSampleBlankResultDto
) {
  @IsOptional()
  @IsNumber()
  sampleBlankResultId?: number;
}
