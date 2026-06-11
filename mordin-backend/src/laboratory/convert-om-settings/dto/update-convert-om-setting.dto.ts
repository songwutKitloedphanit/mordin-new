import { IsNumber } from 'class-validator';

export class UpdateConvertOmSettingDto {
  @IsNumber()
  intercept: number;

  @IsNumber()
  slope: number;
}
