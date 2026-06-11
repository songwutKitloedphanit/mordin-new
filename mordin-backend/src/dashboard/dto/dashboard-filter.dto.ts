import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class DashboardFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2500) // Assuming year is in Buddhist Era
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  serviceTypeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  factoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  serviceAreaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  provinceCode?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  districtCode?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  subdistrictCode?: number;
}
