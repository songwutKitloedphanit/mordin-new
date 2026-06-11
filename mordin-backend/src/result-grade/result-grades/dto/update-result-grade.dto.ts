import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { UpdateResultGradeLevelDto } from 'src/result-grade/result-grade-levels/dto/update-result-grade-level.dto';

export class UpdateResultGradeDto {
  @ValidateNested({ each: true })
  @Type(() => UpdateResultGradeLevelDto)
  resultGradeLevels: UpdateResultGradeLevelDto[];
}
