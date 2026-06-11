import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class UpdateServiceFertilizerMajorUsageDto {
  @IsInt()
  @IsNotEmpty()
  serviceFertilizerMajorUsageId: number;

  @IsInt()
  @IsNotEmpty()
  fertilizerMajorId: number;

  @IsPositive()
  @IsNotEmpty()
  volume: number;
}
