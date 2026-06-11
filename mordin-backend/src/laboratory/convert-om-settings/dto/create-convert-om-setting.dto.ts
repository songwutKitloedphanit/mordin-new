import { IsNumber } from 'class-validator';

export class CreateConvertOmSettingDto {
  @IsNumber()
  laboratorySettingId: number;
}
