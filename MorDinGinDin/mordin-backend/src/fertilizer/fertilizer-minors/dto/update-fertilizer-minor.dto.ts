import { PartialType } from '@nestjs/swagger';
import { CreateFertilizerMinorDto } from './create-fertilizer-minor.dto';
import { IsNumber, IsString } from 'class-validator';

export class UpdateFertilizerMinorDto extends PartialType(
  CreateFertilizerMinorDto,
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
