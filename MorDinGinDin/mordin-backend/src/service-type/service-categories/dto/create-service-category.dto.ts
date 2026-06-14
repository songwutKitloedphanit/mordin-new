import { IsBoolean, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateServiceCategoryDto {
  @IsNumber()
  @IsOptional()
  serviceTypeId?: number;

  @IsString()
  name: string;

  @IsBoolean()
  isDisplay: boolean;
}
