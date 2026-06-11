import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, ValidateNested } from 'class-validator';
import { UpdateSoilGradeLevelDto } from 'src/soil-grade/soil-grade-levels/dto/update-soil-grade-level.dto';

export class UpdateSoilGradeDto {
  @ApiProperty({ description: 'Soil grade ID' })
  @IsNumber()
  soilGradeId: number;

  @ValidateNested({ each: true })
  @Type(() => UpdateSoilGradeLevelDto)
  soilGradeLevels: UpdateSoilGradeLevelDto[];
}
