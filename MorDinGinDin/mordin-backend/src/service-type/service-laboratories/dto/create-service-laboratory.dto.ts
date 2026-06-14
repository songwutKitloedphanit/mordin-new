import { IsBoolean, IsEnum, IsNumber } from 'class-validator';

export class CreateServiceLaboratoryDto {
  @IsNumber()
  laboratoryId: number;

  @IsBoolean()
  isDisplay?: boolean;
}
