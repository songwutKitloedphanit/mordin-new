import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsInt, IsNumber, Min } from "class-validator";

export class ApproveQrCodeDto {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number) // แปลง string เป็น number อัตโนมัติเมื่อใช้กับ query
  @IsInt({ each: true })
  @Min(1, { each: true })
  bookIds: number[];
}