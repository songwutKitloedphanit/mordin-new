import { IsNumber } from 'class-validator';

export class UpdateLaboratorySettingDetailDto {
  @IsNumber()
  numberOfValues: number;

  @IsNumber()
  absorbance: number;

  @IsNumber()
  workingStandard: number;
}
