import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { CreateSoilGradeLevelDto } from 'src/soil-grade/soil-grade-levels/dto/create-soil-grade-level.dto';

export class CreateSoilGradeDto {
  @ApiProperty({ description: 'Service type ID' })
  @IsNumber()
  serviceTypeId: number;

  @ApiProperty({ description: 'Laboratory ID' })
  @IsNumber()
  @IsOptional()
  laboratoryId?: number;

  @ApiProperty({ description: 'Parameter', maxLength: 40 })
  @IsString()
  @Length(1, 40)
  parameter: string;

  @ValidateNested({ each: true })
  @Type(() => CreateSoilGradeLevelDto)
  soilGradeLevels: CreateSoilGradeLevelDto[];
}
