import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateServiceCategoryDto {
  @IsNumber()
  @IsOptional()
  serviceCategoryId?: number;

  @IsNumber()
  @IsOptional()
  serviceTypeId?: number;

  @IsString()
  name: string;

  @IsBoolean()
  isDisplay: boolean;
}
