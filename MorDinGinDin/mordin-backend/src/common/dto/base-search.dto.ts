import { Transform } from 'class-transformer';
import { IsOptional, IsNumber, IsString, IsIn } from 'class-validator';

export class BaseSearchDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 1)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 10)
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  all?: boolean = false;

  // ต้อง override ใน dto ที่ extend BaseSearchDto เพราะต้อง deafault ตาม field ทีของ entity นั้นๆ
  @IsOptional()
  @IsString()
  sortBy?: string; 

  @IsOptional()
  @Transform(({ value }) => value?.toUpperCase?.() === 'DESC' ? 'DESC' : 'ASC')
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'ASC';
}
