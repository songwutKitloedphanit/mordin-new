import { PartialType } from '@nestjs/swagger';
import { CreateFertilizerMajorDto } from './create-fertilizer-major.dto';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { FertilizerMajorTypes } from 'src/fertilizer/enums/fertilizer.enum';

export class UpdateFertilizerMajorDto extends PartialType(
  CreateFertilizerMajorDto,
) {
  @IsEnum(FertilizerMajorTypes)
  type: FertilizerMajorTypes;

  @IsInt()
  @Min(0)
  N: number;

  @IsInt()
  @Min(0)
  P: number;

  @IsInt()
  @Min(0)
  K: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitId: number;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  note?: string;
}
