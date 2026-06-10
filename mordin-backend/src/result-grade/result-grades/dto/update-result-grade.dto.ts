import { PartialType } from '@nestjs/swagger';
import { CreateResultGradeDto } from './create-result-grade.dto';
import { UpdateResultGradeLevelDto } from 'src/result-grade/result-grade-levels/dto/update-result-grade-level.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class UpdateResultGradeDto {
    @ValidateNested({ each: true })
    @Type(() => UpdateResultGradeLevelDto)
    resultGradeLevels: UpdateResultGradeLevelDto[];
}
