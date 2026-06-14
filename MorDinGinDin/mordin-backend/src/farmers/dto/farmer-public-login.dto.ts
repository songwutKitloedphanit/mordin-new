import { IsIn, IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class FarmerPublicLoginDto {
  @IsIn(['thai_id', 'farmer_id'])
  loginType!: 'thai_id' | 'farmer_id';

  @Transform(({ value }) => value == null ? '' : String(value))
  @IsString()
  @IsNotEmpty()
  @Length(1, 45)
  identifier!: string; // ปชช. หรือ รหัสเกษตรกร (ขึ้นกับ loginType)

  @Transform(({ value }) => value == null ? '' : String(value).replace(/\D/g, ''))
  @IsString()
  @IsNotEmpty()
  @Length(9, 20)
  phone!: string;
}
