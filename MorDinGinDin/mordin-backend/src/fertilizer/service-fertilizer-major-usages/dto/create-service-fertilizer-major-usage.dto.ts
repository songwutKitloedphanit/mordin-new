import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class CreateServiceFertilizerMajorUsageDto {
  @IsInt()
  @IsNotEmpty()
  serviceCategoryId: number;

  @IsInt()
  @IsOptional()
  usageTypeId: number;

  @IsInt()
  @IsOptional()
  soilGradeLevelId: number;

  @IsInt()
  @IsNotEmpty()
  fertilizerMajorId: number;

  @IsPositive()
  @IsNotEmpty()
  volume: number;

  @IsOptional()
  updateUid: number;
}
