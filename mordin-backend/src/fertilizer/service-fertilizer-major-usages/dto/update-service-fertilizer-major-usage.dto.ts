import { PartialType } from '@nestjs/swagger';
import { CreateServiceFertilizerMajorUsageDto } from './create-service-fertilizer-major-usage.dto';
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
