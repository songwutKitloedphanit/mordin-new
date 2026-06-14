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

export class CreateFertilizerMajorDto {
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
