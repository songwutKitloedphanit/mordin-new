import { PartialType } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

import { CreateFertilizerMinorDto } from './create-fertilizer-minor.dto';

export class UpdateFertilizerMinorDto extends PartialType(
  CreateFertilizerMinorDto
) {
  @IsString()
  name: string;

  @IsNumber()
  pricePerUnit: number;

  @IsNumber()
  unitId: number;

  @IsString()
  benefit: string;

  @IsString()
  note?: string;
}
