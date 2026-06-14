// src/service-calendars/dto/search-service-calendar.dto.ts

import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { BaseSearchDto } from 'src/common/dto/base-search.dto';

export class SearchServiceCalendarDto extends BaseSearchDto {
  @IsOptional()
  @Type(() => Number) // แปลง query param (string) เป็น number
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  // กำหนดค่า default สำหรับการเรียงลำดับ
  override sortBy?: string = 'date';
  override order?: 'ASC' | 'DESC' = 'DESC';
}