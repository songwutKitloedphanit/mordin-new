import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFertilizerMinorDto {
  @IsString()
  name: string;

  @IsNumber()
  pricePerUnit: number;

  @IsNumber()
  unitId: number;

  @IsString()
  benefit: string;

  @IsString()
  @IsOptional()
  note?: string;
}
