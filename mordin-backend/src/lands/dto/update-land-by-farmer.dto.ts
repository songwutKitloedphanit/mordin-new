import { IsInt, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

// DTO
// นี้จะคล้ายกับ
// UpdateLandDto
// แต่มี
// farmerId
//
export class UpdateLandByFarmerDto {
  @IsInt()
  @IsNotEmpty()
  farmerId: number; //
                    // เพื่อยืนยันความเป็นเจ้าของ

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  areaSize?: number;

  @IsOptional()
  @IsString()
  latitude?: string;

  @IsOptional()
  @IsString()
  longitude?: string;

  @IsOptional()
  @IsString()
  landCode?: string;

  @IsOptional()
  @IsString()
  quotaCode?: string;

  @IsOptional()
  @IsString()
  village?: string;

  //
  // หมายเหตุ:
  // เราจะไม่ให้แก้
  // subdistrictCode
  // ในหน้านี้
  // (ถ้าจะแก้
  // ต้องไปทำหน้า
  // Advance)
}