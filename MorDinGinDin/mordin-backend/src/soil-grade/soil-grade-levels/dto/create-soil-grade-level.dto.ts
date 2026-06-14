import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { NormalLevelEnum } from 'src/common/enums/normal-level.enum';

export class CreateSoilGradeLevelDto {
  @IsInt()
  soilGradeId: number;

  @IsNotEmpty()
  level: NormalLevelEnum;

  @IsNotEmpty()
  @IsNumber()
  cutoffValue: number;

  @IsNotEmpty()
  @IsString()
  @Length(1, 45)
  cutoffText: string;

  @IsNotEmpty()
  @IsNumber()
  score: number;

  @IsNotEmpty()
  @IsString()
  @Length(1, 45)
  scoreName: string;
}
