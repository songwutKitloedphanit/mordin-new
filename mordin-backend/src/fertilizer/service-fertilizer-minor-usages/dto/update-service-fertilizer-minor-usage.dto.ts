import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class UpdateServiceFertilizerMinorUsageDto {
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
