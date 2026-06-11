// src/fertilizer-major-land-scores/dto/get-graph-filter.dto.ts

import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class GetGraphFilterDto {
  // --- Existing Geographical Filters ---
  @IsOptional()
  @Type(() => Number)
  geographyId?: number;

  @IsOptional()
  @Type(() => Number)
  provinceCode?: number;

  @IsOptional()
  @Type(() => Number)
  districtCode?: number;

  @IsOptional()
  @Type(() => Number)
  subdistrictCode?: number;

  @IsOptional()
  @Type(() => Number)
  factoryId?: number; // โรงงาน

  @IsOptional()
  @Type(() => Number)
  serviceAreaId?: number; // เขตส่งเสริม

  @IsOptional()
  @Type(() => Number)
  year?: number; // ปีการผลิต (2567, 2568)

  @IsOptional()
  @Type(() => Number)
  typeId?: number; // ชนิดพืช (1=อ้อย, 2=ข้าว)
}
