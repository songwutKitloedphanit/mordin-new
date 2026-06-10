import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSoilGradeDto } from './create-soil-grade.dto';
import { CreateSoilGradeLevelDto } from 'src/soil-grade/soil-grade-levels/dto/create-soil-grade-level.dto';
import { IsNumber, IsString, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateSoilGradeLevelDto } from 'src/soil-grade/soil-grade-levels/dto/update-soil-grade-level.dto';

export class UpdateSoilGradeDto {
  @ApiProperty({ description: 'Soil grade ID' })
  @IsNumber()
  soilGradeId: number;

  @ValidateNested({ each: true })
  @Type(() => UpdateSoilGradeLevelDto)
  soilGradeLevels: UpdateSoilGradeLevelDto[];
}
