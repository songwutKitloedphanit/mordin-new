import { IsNumber, IsOptional } from 'class-validator';

export class UpdateLaboratorySettingDto {
  @IsNumber()
  laboratorySettingId: number;

  @IsNumber()
  @IsOptional()
  dirtWeight: number;

  @IsNumber()
  @IsOptional()
  extractConcentration: number;

  @IsNumber()
  @IsOptional()
  extractAmount: number;
}
