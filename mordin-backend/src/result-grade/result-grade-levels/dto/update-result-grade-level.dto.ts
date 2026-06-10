import { PartialType } from '@nestjs/swagger';
import { CreateResultGradeLevelDto } from './create-result-grade-level.dto';

export class UpdateResultGradeLevelDto extends PartialType(CreateResultGradeLevelDto) {}
