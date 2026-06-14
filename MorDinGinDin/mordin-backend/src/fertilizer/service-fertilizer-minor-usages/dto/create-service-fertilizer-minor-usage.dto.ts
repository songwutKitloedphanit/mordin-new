import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateServiceFertilizerMinorUsageDto {
  @IsNotEmpty()
  @IsNumber()
  level: number;

  @IsNotEmpty()
  @IsNumber()
  cutoffValue: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  cutoffText: string;

  @IsNotEmpty()
  @IsNumber()
  fertilizerUsageValue: number;
}
