import { PartialType } from '@nestjs/swagger';

import { CreateAnalysisStandardDto } from './create-analysis-standard.dto';

export class UpdateAnalysisStandardDto extends PartialType(
  CreateAnalysisStandardDto
) {}
