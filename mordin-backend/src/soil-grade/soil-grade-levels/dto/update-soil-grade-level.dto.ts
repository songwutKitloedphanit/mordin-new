import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSoilGradeLevelDto } from './create-soil-grade-level.dto';
import { IsNumber, IsString } from 'class-validator';

export class UpdateSoilGradeLevelDto {
  @IsNumber()
  @ApiProperty({ description: 'Soil grade level ID' })
  soilGradeLevelId: number;

  @ApiProperty({ description: 'Soil grade level - level' })
  @IsNumber()
  level: number;

  @ApiProperty({ description: 'Soil grade level - cutoffValue' })
  @IsNumber()
  cutoffValue: number;

  @ApiProperty({ description: 'Soil grade level - cutoffText' })
  @IsString()
  cutoffText: string;

  @ApiProperty({ description: 'Soil grade level - score' })
  @IsNumber()
  score: number;

  @ApiProperty({ description: 'Soil grade level - scoreName' })
  @IsString()
  scoreName: string;
}
