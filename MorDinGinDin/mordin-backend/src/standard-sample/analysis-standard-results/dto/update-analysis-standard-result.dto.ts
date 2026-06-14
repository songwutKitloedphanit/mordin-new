import { PartialType } from '@nestjs/swagger';
import { CreateAnalysisStandardResultDto } from './create-analysis-standard-result.dto';

export class UpdateAnalysisStandardResultDto extends PartialType(CreateAnalysisStandardResultDto) {}
