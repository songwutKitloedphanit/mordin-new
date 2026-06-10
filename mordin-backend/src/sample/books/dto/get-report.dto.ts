import { Type } from 'class-transformer';
import { IsArray, ArrayNotEmpty, IsInt, Min, IsOptional, IsNotEmpty, IsString } from 'class-validator';

export class GetReportDto {
  // @IsArray()
  // @ArrayNotEmpty()
  // @Type(() => Number) // แปลง string เป็น number อัตโนมัติเมื่อใช้กับ query
  // @IsInt({ each: true })
  // @Min(1, { each: true })
  // bookIds: number[];

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  sampleCodes: string[];
}
